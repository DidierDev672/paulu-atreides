/**
 * Order facts needed to label stock movement reference_id (pure domain).
 * Aligns with GET /orders/{id} fields used in the UI.
 */
export interface StockOrderReference {
  id: string
  order_numeric: string
  date: string
}
