/**
 * Lightweight guard (SRP): rejects obvious off-topic questions before calling the model.
 * Allows inventory/stock vocabulary; blocks clear non-domain asks.
 */
const STOCK_HINTS =
  /\b(stock|inventario|producto|productos|entrada|entradas|despacho|despachos|venta|ventas|movimiento|movimientos|bodega|almacen|almacén|existencias|abastecimiento|rotaci[oó]n|cantidad|costo|merma|ajuste|shipment|sale|warehouse|winery|tabla|table|listado|cuadro)\b/i

const OFF_TOPIC_HINTS =
  /\b(clima|futbol|fútbol|chiste|receta|pol[ií]tica|elecciones|pel[ií]cula|m[uú]sica|novela|poes[ií]a|programaci[oó]n|javascript|python|react)\b/i

export function isStockDomainQuestion(text: string): boolean {
  const q = text.trim()
  if (!q) return false

  // Clear non-inventory topics without stock vocabulary → reject early.
  if (OFF_TOPIC_HINTS.test(q) && !STOCK_HINTS.test(q)) return false

  // Inventory vocabulary → accept.
  if (STOCK_HINTS.test(q)) return true

  // Short follow-ups / clarifications stay allowed; system prompt still constrains Paulu.
  return q.length <= 80
}
