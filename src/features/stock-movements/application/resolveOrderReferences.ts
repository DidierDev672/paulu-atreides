import type { IOrderReferenceLookup } from '../domain/IOrderReferenceLookup'
import type { StockOrderReference } from '../domain/StockOrderReference'
import { getOrderReferenceById } from './getOrderReferenceById'

/**
 * Resolves unique order ids independently (one failure does not cancel siblings).
 */
export async function resolveOrderReferences(
  lookup: IOrderReferenceLookup,
  orderIds: string[],
): Promise<Record<string, StockOrderReference>> {
  const uniqueIds = [...new Set(orderIds.map((id) => id.trim()).filter(Boolean))]
  const results = await Promise.allSettled(
    uniqueIds.map((id) => getOrderReferenceById(lookup, id)),
  )

  const byId: Record<string, StockOrderReference> = {}
  for (const result of results) {
    if (result.status === 'fulfilled') {
      byId[result.value.id] = result.value
    } else {
      console.error('[stock-movements] No se pudo cargar la orden de referencia:', result.reason)
    }
  }
  return byId
}
