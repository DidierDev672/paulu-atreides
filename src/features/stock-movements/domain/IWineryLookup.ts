import type { StockWineryReference } from './StockWineryReference'

/**
 * Port (DIP): resolve winery display name without coupling to Axios.
 */
export interface IWineryLookup {
  findById(id: string): Promise<StockWineryReference>
}
