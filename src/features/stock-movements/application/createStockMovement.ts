import type { IStockMovementRepository } from '../domain/IStockMovementRepository'
import type { CreateStockMovementPayload, StockMovement } from '../domain/StockMovement'

/**
 * Use case (SRP): register one stock movement.
 */
export async function createStockMovement(
  repository: IStockMovementRepository,
  payload: CreateStockMovementPayload,
): Promise<StockMovement> {
  return repository.create(payload)
}
