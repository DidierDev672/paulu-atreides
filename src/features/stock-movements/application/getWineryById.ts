import type { IWineryLookup } from '../domain/IWineryLookup'
import type { StockWineryReference } from '../domain/StockWineryReference'

/**
 * Use case (SRP): load one winery reference by id.
 */
export async function getWineryById(
  lookup: IWineryLookup,
  id: string,
): Promise<StockWineryReference> {
  return lookup.findById(id)
}
