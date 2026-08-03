import type { IStockMovementRepository } from '../domain/IStockMovementRepository'

/**
 * Use case (SRP): remove one stock movement by id.
 */
export async function deleteStockMovement(
  repository: IStockMovementRepository,
  id: string,
): Promise<void> {
  await repository.remove(id)
}
