import type { StockOrderReference } from '../domain/StockOrderReference'

/**
 * Pure formatter (SRP): "{order_numeric} - {date}".
 */
export function formatOrderReferenceLabel(order: Pick<StockOrderReference, 'order_numeric' | 'date'>): string {
  const numeric = order.order_numeric?.trim() || '—'
  const date = order.date?.trim() || '—'
  return `${numeric} - ${date}`
}
