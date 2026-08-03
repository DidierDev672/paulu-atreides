import type { StockMovementProductInput } from '../domain/StockMovement'

export interface ProductCodeLookup {
  id: string
  product_code: string
}

export interface OrderLineForStockResolve {
  code: string
  quantity: number | string
  unit_cost: number | string
}

/**
 * Maps order-line product_code → catalog product id for stock_movements.product_id.
 * Returns null if any line cannot be resolved to a real product id.
 */
export function resolveProductIdsFromCodes(
  lines: OrderLineForStockResolve[],
  catalog: ProductCodeLookup[],
): StockMovementProductInput[] | null {
  const codeToId = new Map(
    catalog.map((p) => [p.product_code.trim().toLowerCase(), p.id] as const),
  )

  const resolved: StockMovementProductInput[] = []
  for (const line of lines) {
    const productId = codeToId.get(String(line.code ?? '').trim().toLowerCase())
    if (!productId) return null
    resolved.push({
      product_id: productId,
      quantity: line.quantity,
      unit_cost: line.unit_cost,
    })
  }
  return resolved
}
