/** Domain contract for importing provider(s) from Word/Excel via Llama 3. */

export const PROVIDER_DOCUMENT_TYPES = ['NIT', 'CC', 'CE', 'Passport'] as const
export const PROVIDER_PERSON_TYPES = ['Natural person', 'Legal person'] as const

export type ProviderDocumentType = (typeof PROVIDER_DOCUMENT_TYPES)[number]
export type ProviderPersonType = (typeof PROVIDER_PERSON_TYPES)[number]

export interface ProviderFormDraft {
  code: string
  type_person: string
  document_type: string
  document_number: string
  verification_digit: string
  business_name: string
  business_activity: string
  status: boolean
}

export interface ProviderFieldMismatch {
  field: keyof ProviderFormDraft | string
  foundValue: string
  issue: string
  suggestion: string
  /** 1-based index when the mismatch belongs to an item in a list. */
  providerIndex?: number
}

export interface ProviderListItemValidation {
  mapped: ProviderFormDraft
  isValid: boolean
  mismatches: ProviderFieldMismatch[]
  missingRequired: string[]
}

export interface ProviderDocumentValidationResult {
  /** True when Llama 3 detected more than one provider in the document. */
  isList: boolean
  /** All providers organized to the registration schema (1..N). */
  providers: ProviderListItemValidation[]
  /** Convenience: first provider mapped (single-record UX / form apply). */
  mapped: ProviderFormDraft
  isValid: boolean
  mismatches: ProviderFieldMismatch[]
  missingRequired: string[]
  summary: string
  rawModelText?: string
}

export type SupportedProviderDocumentKind = 'docx' | 'xlsx' | 'xls'

export interface ExtractedDocumentText {
  fileName: string
  kind: SupportedProviderDocumentKind
  text: string
}

export interface ProviderBatchSaveProgress {
  current: number
  total: number
  isList: boolean
  currentName: string
  phase: 'saving' | 'done' | 'error'
  message: string
  savedCount: number
  failedCount: number
}
