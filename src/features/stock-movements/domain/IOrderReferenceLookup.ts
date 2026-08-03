import type { StockOrderReference } from './StockOrderReference'

/**
 * Port (DIP): resolve order labels for movement.reference_id without coupling to Axios.
 */
export interface IOrderReferenceLookup {
  findById(id: string): Promise<StockOrderReference>
}
