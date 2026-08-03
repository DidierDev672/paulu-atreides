import type { IProviderLookup } from '../domain/IProviderLookup'
import type { StockProviderReference } from '../domain/StockProviderReference'

/**
 * Use case (SRP): load one provider reference by id.
 */
export async function getProviderById(
  lookup: IProviderLookup,
  id: string,
): Promise<StockProviderReference> {
  return lookup.findById(id)
}
