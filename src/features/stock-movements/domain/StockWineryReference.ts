/**
 * Winery facts used to label product.winery_id in stock movement detail.
 * Display name comes from API field `area`.
 */
export interface StockWineryReference {
  id: string
  area: string
}
