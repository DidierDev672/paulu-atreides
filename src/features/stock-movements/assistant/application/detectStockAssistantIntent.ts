/**
 * Detects what inventory resource the user wants and whether they asked for a table (SRP).
 */
export type StockAssistantIntent =
  | 'products'
  | 'product_entries'
  | 'shipments'
  | 'sales'
  | 'stock_movements'
  | 'mixed'

export interface StockAssistantIntentResult {
  intent: StockAssistantIntent
  wantsTable: boolean
  detailIds: string[]
}

const ID_PATTERN = /\b(20\d{12,}[A-Z0-9.]*)\b/g

export function detectStockAssistantIntent(raw: string): StockAssistantIntentResult {
  const q = raw.toLowerCase()
  const wantsTable = /\b(tabla|table|cuadro|listado|resumen en tabla|en formato tabla)\b/i.test(q)
  const detailIds = [...raw.matchAll(ID_PATTERN)].map((m) => m[1]).slice(0, 5)

  const hits: StockAssistantIntent[] = []
  if (/\b(producto|productos|cat[aá]logo|c[oó]digo de producto)\b/i.test(q)) hits.push('products')
  if (/\b(entrada|entradas|product[- ]?entr|ingreso|ingresos)\b/i.test(q)) hits.push('product_entries')
  if (/\b(despacho|despachos|shipment|env[ií]o|env[ií]os|salida|salidas)\b/i.test(q)) {
    hits.push('shipments')
  }
  if (/\b(venta|ventas|sale|sales)\b/i.test(q)) hits.push('sales')
  if (/\b(movimiento|movimientos|stock_movement|inventario|existencias|rotaci[oó]n)\b/i.test(q)) {
    hits.push('stock_movements')
  }

  let intent: StockAssistantIntent = 'mixed'
  if (hits.length === 1) intent = hits[0]
  else if (hits.length === 0) intent = wantsTable ? 'stock_movements' : 'mixed'

  return { intent, wantsTable, detailIds }
}
