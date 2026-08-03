import type { IStockMovementRepository } from '../domain/IStockMovementRepository'
import type { StockMovement } from '../domain/StockMovement'

/**
 * Use case (SRP): fetch a single movement for the detail view.
 */
export async function getStockMovementById(
  repository: IStockMovementRepository,
  id: string,
): Promise<StockMovement> {
  return repository.findById(id)
}
