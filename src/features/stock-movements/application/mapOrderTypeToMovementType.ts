import type { StockMovementType } from '../domain/StockMovement'

/**
 * Maps order_type (form value or Spanish label) → stock movement_type.
 * Incoming inventory: Compra / Reabastecimiento / Producción → "in"
 * Outgoing inventory: Transferencia → "out"
 */
const ORDER_TYPE_TO_MOVEMENT: Record<string, StockMovementType> = {
  PURCHASE: 'in',
  REPLENISHMENT: 'in',
  PRODUCTION: 'in',
  TRANSFER: 'out',
  Compra: 'in',
  Reabastecimiento: 'in',
  Producción: 'in',
  Transferencia: 'out',
}

export function mapOrderTypeToMovementType(orderType: string): StockMovementType {
  const mapped = ORDER_TYPE_TO_MOVEMENT[orderType]
  if (mapped) return mapped

  const normalized = orderType.trim().toLowerCase()
  if (normalized === 'in' || normalized === 'out') return normalized

  // Safe default for unknown purchase-like types: inventory enters.
  return 'in'
}
