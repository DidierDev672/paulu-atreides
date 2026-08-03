import type { ICompanyLookup } from '../domain/ICompanyLookup'
import type { StockCompanyReference } from '../domain/StockCompanyReference'

/**
 * Use case (SRP): load one company reference by id.
 */
export async function getCompanyById(
  lookup: ICompanyLookup,
  id: string,
): Promise<StockCompanyReference> {
  return lookup.findById(id)
}
