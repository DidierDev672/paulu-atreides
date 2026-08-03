import type { IStockMovementRepository } from '../domain/IStockMovementRepository'
import type {
  CreateStockMovementPayload,
  StockMovement,
  StockMovementProductInput,
  StockMovementType,
} from '../domain/StockMovement'
import { createStockMovement } from './createStockMovement'

/**
 * Reusable: builds the POST payload for one product and creates the stock movement.
 * quantity / unit_cost are coerced with parseFloat for form string values.
 */
export async function createStockMovementForProduct(
  repository: IStockMovementRepository,
  product: StockMovementProductInput,
  movementType: StockMovementType,
  referenceId: string,
): Promise<StockMovement> {
  const payload: CreateStockMovementPayload = {
    product_id: product.product_id,
    movement_type: movementType,
    quantity: parseFloat(String(product.quantity)),
    unit_cost: parseFloat(String(product.unit_cost)),
    reference_id: referenceId,
  }

  return createStockMovement(repository, payload)
}
