import type { StockCompanyReference } from './StockCompanyReference'

/**
 * Port (DIP): resolve company display name without coupling to Axios.
 */
export interface ICompanyLookup {
  findById(id: string): Promise<StockCompanyReference>
}
