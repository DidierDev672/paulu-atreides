import type { IStockMovementRepository } from '../domain/IStockMovementRepository'
import type { StockMovementProductInput } from '../domain/StockMovement'
import { createStockMovementForProduct } from './createStockMovementForProduct'
import { mapOrderTypeToMovementType } from './mapOrderTypeToMovementType'

export interface RegisterStockMovementsResult {
  attempted: number
  succeeded: number
  failed: number
}

/**
 * Iterates order products and registers each stock movement independently.
 * Failures do not cancel sibling requests (Promise.allSettled).
 */
export async function registerStockMovementsForOrder(
  repository: IStockMovementRepository,
  products: StockMovementProductInput[],
  orderType: string,
  referenceId: string,
): Promise<RegisterStockMovementsResult> {
  const movementType = mapOrderTypeToMovementType(orderType)

  const results = await Promise.allSettled(
    products.map((product) =>
      createStockMovementForProduct(repository, product, movementType, referenceId),
    ),
  )

  const failed = results.filter((r) => r.status === 'rejected').length
  const succeeded = results.length - failed

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[stock-movements] Falló el registro de un movimiento:', result.reason)
    }
  }

  return { attempted: results.length, succeeded, failed }
}
