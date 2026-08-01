import { chatWithLlama3 } from '@/application/services/ollamaService'
import type {
  ProviderDocumentValidationResult,
  ProviderFieldMismatch,
  ProviderFormDraft,
  ProviderListItemValidation,
} from '@/domain/provider-document/providerDocument.types'
import {
  PROVIDER_DOCUMENT_TYPES,
  PROVIDER_PERSON_TYPES,
} from '@/domain/provider-document/providerDocument.types'

const REQUIRED_FIELDS = [
  'code',
  'type_person',
  'document_type',
  'document_number',
  'business_name',
] as const

const EMPTY_DRAFT = (): ProviderFormDraft => ({
  code: '',
  type_person: '',
  document_type: '',
  document_number: '',
  verification_digit: '',
  business_name: '',
  business_activity: '',
  status: true,
})

const SYSTEM_PROMPT = `Eres un asistente que valida y organiza datos de proveedores para un sistema ERP.
Debes detectar si el documento trae UN solo proveedor o una LISTA de proveedores, y organizar TODOS los registros al formato de alta.

Responde ÚNICAMENTE con JSON válido (sin markdown) con esta forma exacta:
{
  "isList": boolean,
  "providers": [
    {
      "mapped": {
        "code": string,
        "type_person": "Natural person" | "Legal person" | "",
        "document_type": "NIT" | "CC" | "CE" | "Passport" | "",
        "document_number": string,
        "verification_digit": string,
        "business_name": string,
        "business_activity": string,
        "status": boolean
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
- Si hay 2 o más proveedores, isList=true y cada uno va en providers[].
- Si hay uno solo, isList=false y providers tiene exactamente 1 elemento.
- Estructura de cada registro: code, type_person, document_type, document_number, verification_digit, business_name, business_activity, status.
- type_person solo: ${PROVIDER_PERSON_TYPES.join(' | ')}.
- document_type solo: ${PROVIDER_DOCUMENT_TYPES.join(' | ')}.
- Organiza filas de Excel / tablas / listados al mismo esquema aunque los encabezados usen sinónimos (razón social, NIT, etc.).
- Si un valor no encaja, inclúyelo en mismatches del ítem con explicación y sugerencia en español.
- missingRequired del ítem: campos ausentes entre ${REQUIRED_FIELDS.join(', ')}.
- status por defecto true si no se indica.
- summary: mensaje amable en español (menciona si es lista y cuántos registros organizaste).`

function buildUserPrompt(documentText: string, fileName: string): string {
  return `Archivo: ${fileName}

Contenido extraído del documento:
"""
${documentText.slice(0, 14000)}
"""

Detecta si es un proveedor o una lista. Organiza TODOS los registros al formato de alta del proveedor.
Si algo no encaja, detállalo por ítem en mismatches.`
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}

function normalizePersonType(value: string): string {
  const v = value.toLowerCase()
  if (v.includes('natural')) return 'Natural person'
  if (v.includes('jur') || v.includes('legal')) return 'Legal person'
  if (PROVIDER_PERSON_TYPES.includes(value as (typeof PROVIDER_PERSON_TYPES)[number])) return value
  return value
}

function normalizeDocumentType(value: string): string {
  const upper = value.toUpperCase().trim()
  if (PROVIDER_DOCUMENT_TYPES.includes(upper as (typeof PROVIDER_DOCUMENT_TYPES)[number])) return upper
  if (upper.includes('PASAPORTE') || upper.includes('PASSPORT')) return 'Passport'
  if (upper === 'C.C' || upper === 'C.C.') return 'CC'
  if (upper === 'C.E' || upper === 'C.E.') return 'CE'
  return value
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

function mapDraft(mappedRaw: Record<string, unknown>): ProviderFormDraft {
  return {
    ...EMPTY_DRAFT(),
    code: asString(mappedRaw.code),
    type_person: normalizePersonType(asString(mappedRaw.type_person)),
    document_type: normalizeDocumentType(asString(mappedRaw.document_type)),
    document_number: asString(mappedRaw.document_number),
    verification_digit: asString(mappedRaw.verification_digit),
    business_name: asString(mappedRaw.business_name),
    business_activity: asString(mappedRaw.business_activity),
    status:
      typeof mappedRaw.status === 'boolean'
        ? mappedRaw.status
        : String(mappedRaw.status).toLowerCase() !== 'false',
  }
}

function mapMismatches(
  raw: unknown,
  providerIndex?: number,
): ProviderFieldMismatch[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>
    return {
      field: asString(row.field) || 'desconocido',
      foundValue: asString(row.foundValue),
      issue: asString(row.issue) || 'Este dato no encaja con el registro de proveedor.',
      suggestion: asString(row.suggestion) || 'Revisa y corrige este campo.',
      providerIndex,
    }
  })
}

function validateItem(
  rawItem: unknown,
  providerIndex: number,
): ProviderListItemValidation {
  const obj = (rawItem ?? {}) as Record<string, unknown>
  const mapped = mapDraft((obj.mapped ?? obj) as Record<string, unknown>)
  const mismatches = mapMismatches(obj.mismatches, providerIndex)

  if (mapped.type_person && !PROVIDER_PERSON_TYPES.includes(mapped.type_person as never)) {
    mismatches.push({
      field: 'type_person',
      foundValue: mapped.type_person,
      issue: 'El tipo de persona no coincide con los valores permitidos.',
      suggestion: `Usa uno de: ${PROVIDER_PERSON_TYPES.join(', ')}.`,
      providerIndex,
    })
  }
  if (mapped.document_type && !PROVIDER_DOCUMENT_TYPES.includes(mapped.document_type as never)) {
    mismatches.push({
      field: 'document_type',
      foundValue: mapped.document_type,
      issue: 'El tipo de documento no coincide con los valores permitidos.',
      suggestion: `Usa uno de: ${PROVIDER_DOCUMENT_TYPES.join(', ')}.`,
      providerIndex,
    })
  }

  const missingRequired = REQUIRED_FIELDS.filter((field) => !asString(mapped[field]))
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

function toValidationResult(payload: unknown, rawModelText: string): ProviderDocumentValidationResult {
  const obj = (payload ?? {}) as Record<string, unknown>

  let providerItems: unknown[] = []
  if (Array.isArray(obj.providers) && obj.providers.length > 0) {
    providerItems = obj.providers
  } else if (obj.mapped && typeof obj.mapped === 'object') {
    // Backward-compatible single-object response from older prompts.
    providerItems = [obj]
  } else {
    providerItems = [obj]
  }

  const providers = providerItems.map((item, index) => validateItem(item, index + 1))
  const isList = Boolean(obj.isList) || providers.length > 1
  const allMismatches = providers.flatMap((p) => p.mismatches)
  const allMissing = providers.flatMap((p, index) =>
    p.missingRequired.map((field) => (isList ? `[#${index + 1}] ${field}` : field)),
  )
  const isValid = providers.length > 0 && providers.every((p) => p.isValid)
  const first = providers[0]?.mapped ?? EMPTY_DRAFT()

  const defaultSummary = isList
    ? isValid
      ? `Organicé ${providers.length} proveedores con el formato de registro. Ya puedes guardarlos uno por uno.`
      : `Organicé ${providers.length} proveedores, pero algunos campos no encajan del todo. Revisa la lista antes de guardar.`
    : isValid
      ? 'El documento encaja con el registro de proveedor. Puedes aplicarlo al formulario o guardarlo ahora.'
      : 'Encontramos datos que no encajan del todo. Revisa los puntos marcados y completa lo faltante.'

  return {
    isList,
    providers,
    mapped: first,
    isValid,
    mismatches: allMismatches,
    missingRequired: allMissing,
    summary: asString(obj.summary) || defaultSummary,
    rawModelText,
  }
}

export async function validateProviderDocumentWithLlama3(
  documentText: string,
  fileName: string,
): Promise<ProviderDocumentValidationResult> {
  const raw = await chatWithLlama3({
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(documentText, fileName),
    formatJson: true,
    temperature: 0.1,
  })

  const parsed = parseModelJson(raw)
  return toValidationResult(parsed, raw)
}
