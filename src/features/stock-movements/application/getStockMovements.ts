import type { IStockMovementRepository } from '../domain/IStockMovementRepository'
import type { StockMovement } from '../domain/StockMovement'

/**
 * Use case (SRP): obtain the stock movement list.
 * Depends on the repository interface (DIP), not the HTTP client.
 */
export async function getStockMovements(
  repository: IStockMovementRepository,
): Promise<StockMovement[]> {
  return repository.findAll()
}
