import type { StockMovement } from '../domain/StockMovement'
import type { StockProduct } from '../domain/StockProduct'
import { matchProductSearchQuery } from './matchProductSearchQuery'

/**
 * Filters stock movements by product name in real time (SRP).
 * Looks up the catalog name via product_id; falls back to product_id string.
 */
export function filterMovementsByProductQuery(
  movements: StockMovement[],
  productsById: Record<string, StockProduct>,
  rawQuery: string,
): StockMovement[] {
  const query = rawQuery.trim()
  if (!query) return movements

  return movements.filter((movement) => {
    const product = productsById[movement.product_id]
    const productName = product?.name?.trim() || ''
    if (productName && matchProductSearchQuery(productName, query)) return true

    // Fallback when catalog name is not yet available
    return matchProductSearchQuery(movement.product_id, query)
  })
}
