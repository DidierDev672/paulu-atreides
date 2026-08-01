import { chatWithLlama3 } from '@/application/services/ollamaService'
import type {
  ProductDocumentValidationResult,
  ProductFieldMismatch,
  ProductFormDraft,
  ProductListItemValidation,
} from '@/domain/product-document/productDocument.types'
import {
  PRODUCT_COMMERCIAL_POLICIES,
  PRODUCT_UNITS,
} from '@/domain/product-document/productDocument.types'

const REQUIRED_FIELDS = ['name', 'product_code', 'unit', 'quantity'] as const

const EMPTY_DRAFT = (): ProductFormDraft => ({
  name: '',
  product_code: '',
  categories: [],
  unit: 'Unidad',
  quantity: 0,
  minimum_stock: 0,
  supplier_name: '',
  supplier_id: '',
  winery_name: '',
  winery_id: '',
  unit_cost: 0,
  commercial_policy: 'Normal',
  profit_margin: 0,
})

const SYSTEM_PROMPT = `Eres un asistente que valida y organiza datos de PRODUCTOS para un sistema ERP de inventario.
Debes detectar si el documento trae UN solo producto o una LISTA, y organizar TODOS los registros al formato de alta de producto.

Responde ÚNICAMENTE con JSON válido (sin markdown):
{
  "isList": boolean,
  "products": [
    {
      "mapped": {
        "name": string,
        "product_code": string,
        "categories": string[],
        "unit": string,
        "quantity": number,
        "minimum_stock": number,
        "supplier_name": string,
        "winery_name": string,
        "unit_cost": number,
        "commercial_policy": "Normal" | "Premium" | "Descuento" | "Mayorista" | "",
        "profit_margin": number
      },
      "mismatches": [
        { "field": string, "foundValue": string, "issue": string, "suggestion": string }
      ],
      "missingRequired": string[]
    }
  ],
  "summary": string
}

Reglas:
- Si hay 2 o más productos, isList=true.
- Campos de producto: name, product_code, categories, unit, quantity, minimum_stock, supplier_name, winery_name.
- Campos para la entrada de inventario asociada: unit_cost, commercial_policy, profit_margin.
- unit preferible: ${PRODUCT_UNITS.join(', ')}.
- commercial_policy preferible: ${PRODUCT_COMMERCIAL_POLICIES.join(', ')}.
- categories: array de strings (puede venir como texto separado por comas).
- quantity y minimum_stock / unit_cost / profit_margin como números.
- Organiza filas de Excel/tablas aunque usen sinónimos (código, nombre, stock, costo, bodega, proveedor).
- missingRequired del ítem entre: ${REQUIRED_FIELDS.join(', ')}.
- summary en español, amable, indicando si es lista y cuántos productos organizaste.`

function buildUserPrompt(documentText: string, fileName: string): string {
  return `Archivo: ${fileName}

Contenido extraído:
"""
${documentText.slice(0, 14000)}
"""

Detecta si es un producto o una lista. Organiza TODOS los registros al formato de alta de producto
(incluyendo costo unitario y política comercial para generar la entrada de inventario).`
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const n = parseFloat(String(value ?? '').replace(/,/g, '.').replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => asString(v)).filter(Boolean)
  }
  const raw = asString(value)
  if (!raw) return []
  return raw.split(/[,;|/]/).map((s) => s.trim()).filter(Boolean)
}

function normalizeUnit(value: string): string {
  const v = value.trim()
  const found = PRODUCT_UNITS.find((u) => u.toLowerCase() === v.toLowerCase())
  if (found) return found
  if (!v) return 'Unidad'
  return v
}

function normalizePolicy(value: string): string {
  const v = value.trim()
  const found = PRODUCT_COMMERCIAL_POLICIES.find((p) => p.toLowerCase() === v.toLowerCase())
  return found ?? (v || 'Normal')
}

function parseModelJson(raw: string): unknown {
  const trimmed = raw.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1))
    }
    throw new Error('Llama 3 no devolvió JSON válido. Intenta de nuevo con un documento más claro.')
  }
}

function mapDraft(mappedRaw: Record<string, unknown>): ProductFormDraft {
  return {
    ...EMPTY_DRAFT(),
    name: asString(mappedRaw.name),
    product_code: asString(mappedRaw.product_code || mappedRaw.code),
    categories: asStringArray(mappedRaw.categories),
    unit: normalizeUnit(asString(mappedRaw.unit)),
    quantity: asNumber(mappedRaw.quantity),
    minimum_stock: asNumber(mappedRaw.minimum_stock),
    supplier_name: asString(mappedRaw.supplier_name || mappedRaw.supplier || mappedRaw.proveedor),
    supplier_id: asString(mappedRaw.supplier_id),
    winery_name: asString(mappedRaw.winery_name || mappedRaw.warehouse || mappedRaw.bodega),
    winery_id: asString(mappedRaw.winery_id),
    unit_cost: asNumber(mappedRaw.unit_cost || mappedRaw.cost || mappedRaw.costo),
    commercial_policy: normalizePolicy(asString(mappedRaw.commercial_policy)),
    profit_margin: asNumber(mappedRaw.profit_margin),
  }
}

function mapMismatches(raw: unknown, productIndex?: number): ProductFieldMismatch[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>
    return {
      field: asString(row.field) || 'desconocido',
      foundValue: asString(row.foundValue),
      issue: asString(row.issue) || 'Este dato no encaja con el registro de producto.',
      suggestion: asString(row.suggestion) || 'Revisa y corrige este campo.',
      productIndex,
    }
  })
}

function validateItem(rawItem: unknown, productIndex: number): ProductListItemValidation {
  const obj = (rawItem ?? {}) as Record<string, unknown>
  const mapped = mapDraft((obj.mapped ?? obj) as Record<string, unknown>)
  const mismatches = mapMismatches(obj.mismatches, productIndex)

  const missingRequired = REQUIRED_FIELDS.filter((field) => {
    if (field === 'quantity') return !(mapped.quantity > 0)
    return !asString(mapped[field] as string)
  })
  const modelMissing = Array.isArray(obj.missingRequired)
    ? obj.missingRequired.map((f) => asString(f)).filter(Boolean)
    : []
  const mergedMissing = [...new Set([...missingRequired, ...modelMissing])]

  return {
    mapped,
    isValid: mergedMissing.length === 0 && mismatches.length === 0,
    mismatches,
    missingRequired: mergedMissing,
  }
}

function toValidationResult(payload: unknown, rawModelText: string): ProductDocumentValidationResult {
  const obj = (payload ?? {}) as Record<string, unknown>

  let items: unknown[] = []
  if (Array.isArray(obj.products) && obj.products.length > 0) {
    items = obj.products
  } else if (obj.mapped && typeof obj.mapped === 'object') {
    items = [obj]
  } else {
    items = [obj]
  }

  const products = items.map((item, index) => validateItem(item, index + 1))
  const isList = Boolean(obj.isList) || products.length > 1
  const allMismatches = products.flatMap((p) => p.mismatches)
  const allMissing = products.flatMap((p, index) =>
    p.missingRequired.map((field) => (isList ? `[#${index + 1}] ${field}` : field)),
  )
  const isValid = products.length > 0 && products.every((p) => p.isValid)
  const first = products[0]?.mapped ?? EMPTY_DRAFT()

  const defaultSummary = isList
    ? `Organicé ${products.length} productos al formato de registro. Al guardar se crearán los productos y una entrada de inventario.`
    : 'Producto organizado al formato de registro. Al guardar se creará el producto y su entrada de inventario.'

  return {
    isList,
    products,
    mapped: first,
    isValid,
    mismatches: allMismatches,
    missingRequired: allMissing,
    summary: asString(obj.summary) || defaultSummary,
    rawModelText,
  }
}

export async function validateProductDocumentWithLlama3(
  documentText: string,
  fileName: string,
): Promise<ProductDocumentValidationResult> {
  const raw = await chatWithLlama3({
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(documentText, fileName),
    formatJson: true,
    temperature: 0.1,
  })

  return toValidationResult(parseModelJson(raw), raw)
}
