/**
 * Port (DIP): stock assistant data access without coupling to Axios services.
 */
export interface StockAssistantContextBundle {
  products: unknown
  productEntries: unknown
  shipments: unknown
  sales: unknown
  stockMovements: unknown
  errors: string[]
}

export interface IStockAssistantContextGateway {
  fetchAllLists(): Promise<StockAssistantContextBundle>
  fetchProductById(id: string): Promise<unknown>
  fetchProductEntryById(id: string): Promise<unknown>
  fetchShipmentById(id: string): Promise<unknown>
  fetchSaleById(id: string): Promise<unknown>
  fetchStockMovementById(id: string): Promise<unknown>
}
