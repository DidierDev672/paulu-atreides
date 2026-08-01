/**
 * Before POST /products + POST /product-entries, asks Llama 3 (Ollama) to reshape
 * the imported list using the selected supplier and winery so payloads match the API.
 */

import { chatWithLlama3 } from '@/application/services/ollamaService'
import type { ProductFormDraft } from '@/domain/product-document/productDocument.types'
import {
  PRODUCT_COMMERCIAL_POLICIES,
  PRODUCT_UNITS,
} from '@/domain/product-document/productDocument.types'

export interface PersistAssociationInfo {
  companyId: string
  supplierId: string
  supplierName: string
  wineryId: string
  wineryName: string
}

const SYSTEM_PROMPT = `Eres un asistente que prepara payloads de PRODUCTOS para un ERP.
Debes devolver la lista lista para consumir el endpoint POST /products y, en paralelo,
campos auxiliares para POST /product-entries (entrada de inventario).

Responde ÚNICAMENTE con JSON válido (sin markdown):
{
  "products": [
    {
      "company_id": string,
      "supplier_id": string,
      "name": string,
      "product_code": string,
      "categories": string[],
      "unit": string,
      "quantity": number,
      "minimum_stock": number,
      "winery_id": string,
      "supplier_name": string,
      "winery_name": string,
      "unit_cost": number,
      "commercial_policy": "Normal" | "Premium" | "Descuento" | "Mayorista",
      "profit_margin": number
    }
  ],
  "summary": string
}

Reglas estrictas:
- TODOS los productos deben usar EXACTAMENTE el supplier_id y winery_id indicados por el usuario (no inventes IDs).
- company_id debe ser EXACTAMENTE el company_id indicado.
- supplier_name y winery_name deben reflejar los nombres/áreas indicados.
- unit preferible: ${PRODUCT_UNITS.join(', ')}.
- commercial_policy preferible: ${PRODUCT_COMMERCIAL_POLICIES.join(', ')}.
- quantity > 0, product_code y name no vacíos.
- Conserva la cantidad de productos de entrada (no omitas ni dupliques sin necesidad).
- summary en español, breve.`

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
  return v || 'Unidad'
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
    throw new Error(
      'La inteligencia artificial no devolvió un formato válido. Intenta guardar de nuevo en un momento.',
    )
  }
}

function mapOrganizedProduct(
  raw: Record<string, unknown>,
  association: PersistAssociationInfo,
  fallback: ProductFormDraft,
): ProductFormDraft {
  return {
    name: asString(raw.name) || fallback.name,
    product_code: asString(raw.product_code || raw.code) || fallback.product_code,
    categories: asStringArray(raw.categories).length
      ? asStringArray(raw.categories)
      : fallback.categories.length
        ? fallback.categories
        : ['General'],
    unit: normalizeUnit(asString(raw.unit) || fallback.unit),
    quantity: asNumber(raw.quantity) || fallback.quantity,
    minimum_stock: asNumber(raw.minimum_stock) || fallback.minimum_stock,
    supplier_name: association.supplierName || asString(raw.supplier_name) || fallback.supplier_name,
    // IDs del formulario: nunca los del modelo si vienen inventados.
    supplier_id: association.supplierId,
    winery_name: association.wineryName || asString(raw.winery_name) || fallback.winery_name,
    winery_id: association.wineryId,
    unit_cost: asNumber(raw.unit_cost) || fallback.unit_cost,
    commercial_policy: normalizePolicy(asString(raw.commercial_policy) || fallback.commercial_policy),
    profit_margin: asNumber(raw.profit_margin) || fallback.profit_margin,
  }
}

function buildUserPrompt(
  drafts: ProductFormDraft[],
  association: PersistAssociationInfo,
): string {
  const compact = drafts.map((d, index) => ({
    index: index + 1,
    name: d.name,
    product_code: d.product_code,
    categories: d.categories,
    unit: d.unit,
    quantity: d.quantity,
    minimum_stock: d.minimum_stock,
    unit_cost: d.unit_cost,
    commercial_policy: d.commercial_policy,
    profit_margin: d.profit_margin,
    supplier_name_from_document: d.supplier_name,
    winery_name_from_document: d.winery_name,
  }))

  return `Prepara esta lista para persistir en el ERP.

Asociaciones OBLIGATORIAS (usar en TODOS los productos):
- company_id: ${association.companyId}
- supplier_id: ${association.supplierId}
- supplier_name: ${association.supplierName || '(proveedor seleccionado)'}
- winery_id: ${association.wineryId}
- winery_name / área: ${association.wineryName || '(bodega seleccionada)'}

Contrato POST /products (por ítem):
company_id, supplier_id, name, product_code, categories[], unit, quantity, minimum_stock, winery_id

Lista actual (${drafts.length} producto(s)):
${JSON.stringify(compact, null, 2)}

Devuelve el JSON con products ya alineados al contrato, con supplier_id y winery_id exactos.`
}

/**
 * Asks Ollama/Llama 3 to reshape drafts for POST /products using the selected
 * supplier and winery. Always re-applies association IDs after the model response.
 */
export async function prepareProductsForPersistWithLlama3(
  drafts: ProductFormDraft[],
  association: PersistAssociationInfo,
): Promise<ProductFormDraft[]> {
  if (drafts.length === 0) {
    throw new Error('No hay productos para organizar antes de guardar.')
  }
  if (!association.companyId || !association.supplierId || !association.wineryId) {
    throw new Error(
      'Faltan empresa, proveedor o bodega para que la inteligencia artificial prepare el guardado.',
    )
  }

  const raw = await chatWithLlama3({
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(drafts, association),
    formatJson: true,
    temperature: 0.1,
  })

  const payload = parseModelJson(raw) as Record<string, unknown>
  const items = Array.isArray(payload.products) ? payload.products : []

  if (items.length === 0) {
    // Fallback seguro: aplica asociaciones localmente si el modelo no devolvió ítems.
    return drafts.map((d) => ({
      ...d,
      supplier_id: association.supplierId,
      supplier_name: association.supplierName || d.supplier_name,
      winery_id: association.wineryId,
      winery_name: association.wineryName || d.winery_name,
    }))
  }

  return items.map((item, index) => {
    const row = (item ?? {}) as Record<string, unknown>
    const fallback = drafts[index] ?? drafts[drafts.length - 1]
    return mapOrganizedProduct(row, association, fallback)
  })
}

/** Mensaje amable (psicología) cuando falla la persistencia o la organización. */
export function buildFriendlyPersistErrorMessage(cause: string): string {
  const detail = cause.trim() || 'No pudimos identificar el detalle técnico en este momento.'
  return [
    'Tranquilo: esto puede pasar y no significa que hayas hecho algo mal.',
    'No pudimos guardar la información por ahora.',
    '',
    `Causa: ${detail}`,
    '',
    'Cuando quieras, vuelve a intentarlo — estamos listos para ayudarte a completar el registro.',
  ].join('\n')
}

export function buildFriendlyPersistSuccessMessage(
  savedCount: number,
  entryCreated: boolean,
): string {
  if (entryCreated) {
    return savedCount > 1
      ? `Listo. Se almacenaron correctamente ${savedCount} productos y se creó la entrada de inventario.`
      : 'Listo. El producto se almacenó correctamente y se creó su entrada de inventario.'
  }
  return savedCount > 1
    ? `Se almacenaron ${savedCount} productos. La entrada de inventario no se completó; puedes revisarla después.`
    : 'El producto se almacenó. La entrada de inventario no se completó; puedes revisarla después.'
}
