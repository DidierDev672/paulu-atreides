import type { CreateStockMovementPayload, StockMovement } from './StockMovement'

/**
 * Repository port (DIP) — domain depends on this abstraction, never on Axios.
 */
export interface IStockMovementRepository {
  findAll(): Promise<StockMovement[]>
  findById(id: string): Promise<StockMovement>
  create(payload: CreateStockMovementPayload): Promise<StockMovement>
  remove(id: string): Promise<void>
}
