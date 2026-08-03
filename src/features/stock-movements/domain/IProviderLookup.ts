import type { StockProviderReference } from './StockProviderReference'

/**
 * Port (DIP): resolve provider display name without coupling to Axios.
 */
export interface IProviderLookup {
  findById(id: string): Promise<StockProviderReference>
}
