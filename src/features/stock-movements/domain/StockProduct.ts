/**
 * Product facts used to enrich stock movement UI (pure domain, no HTTP).
 * Shape aligns with GET /products response fields.
 */
export interface StockProduct {
  id: string
  company_id: string
  supplier_id: string
  name: string
  product_code: string
  categories: string[]
  unit: string
  quantity: number
  minimum_stock: number
  winery_id: string
}
