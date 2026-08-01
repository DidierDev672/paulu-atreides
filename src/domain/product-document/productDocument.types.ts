/** Domain contract for importing products (+ inventory entry) from Word/Excel via Llama 3. */

export const PRODUCT_UNITS = [
  'Kg',
  'Litro',
  'Libra',
  'Gramos',
  'Unidad',
  'Caja',
  'Paquete',
  'Metro',
] as const

export const PRODUCT_COMMERCIAL_POLICIES = ['Normal', 'Premium', 'Descuento', 'Mayorista'] as const

export type ProductUnit = (typeof PRODUCT_UNITS)[number]
export type ProductCommercialPolicy = (typeof PRODUCT_COMMERCIAL_POLICIES)[number]

export interface ProductFormDraft {
  name: string
  product_code: string
  categories: string[]
  unit: string
  quantity: number
  minimum_stock: number
  /** Free-text from document; resolved to supplier_id before save. */
  supplier_name: string
  supplier_id: string
  /** Free-text from document (winery area); resolved to winery_id before save. */
  winery_name: string
  winery_id: string
  /** Used when creating the companion product-entry detail. */
  unit_cost: number
  commercial_policy: string
  profit_margin: number
}

export interface ProductFieldMismatch {
  field: keyof ProductFormDraft | string
  foundValue: string
  issue: string
  suggestion: string
  productIndex?: number
}

export interface ProductListItemValidation {
  mapped: ProductFormDraft
  isValid: boolean
  mismatches: ProductFieldMismatch[]
  missingRequired: string[]
}

export interface ProductDocumentValidationResult {
  isList: boolean
  products: ProductListItemValidation[]
  mapped: ProductFormDraft
  isValid: boolean
  mismatches: ProductFieldMismatch[]
  missingRequired: string[]
  summary: string
  rawModelText?: string
}

export interface ProductBatchSaveProgress {
  current: number
  total: number
  isList: boolean
  currentName: string
  phase: 'organizing' | 'saving-products' | 'saving-entry' | 'done' | 'error'
  message: string
  savedCount: number
  failedCount: number
  entryCreated: boolean
}
