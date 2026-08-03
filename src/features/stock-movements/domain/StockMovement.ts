/**
 * Domain entity — stock movement (pure, no framework deps).
 * Onion core: business facts only.
 */
export type StockMovementType = 'in' | 'out' | string

export interface StockMovement {
  id: string
  product_id: string
  movement_type: StockMovementType
  quantity: number
  unit_cost: number
  reference_id: string
  created_at: string
  updated_at: string
}

/** Payload for POST /stock_movements */
export interface CreateStockMovementPayload {
  product_id: string
  movement_type: StockMovementType
  quantity: number
  unit_cost: number
  reference_id: string
}

/** Minimal product shape accepted when registering a movement from an order line. */
export interface StockMovementProductInput {
  product_id: string
  quantity: number | string
  unit_cost: number | string
}
