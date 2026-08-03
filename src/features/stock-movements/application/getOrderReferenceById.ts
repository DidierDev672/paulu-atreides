import type { IOrderReferenceLookup } from '../domain/IOrderReferenceLookup'
import type { StockOrderReference } from '../domain/StockOrderReference'

/**
 * Use case (SRP): load one order reference by id.
 */
export async function getOrderReferenceById(
  lookup: IOrderReferenceLookup,
  id: string,
): Promise<StockOrderReference> {
  return lookup.findById(id)
}
