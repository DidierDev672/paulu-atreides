import type { IStockAssistantContextGateway } from '../domain/IStockAssistantContextGateway'
import { detectStockAssistantIntent } from './detectStockAssistantIntent'

/**
 * Builds context focused on the user's intent; larger slices when a list/summary is requested.
 */
export async function buildStockAssistantContext(
  gateway: IStockAssistantContextGateway,
  userQuestion: string,
): Promise<{ context: string; loadErrors: string[]; wantsTable: boolean }> {
  try {
    const { intent, wantsTable, detailIds } = detectStockAssistantIntent(userQuestion)
    const limit = wantsTable ? 40 : 15

    const bundle = await gateway.fetchAllLists()
    const loadErrors = [...bundle.errors]

    const focused = pickFocusedPayload(bundle, intent, limit)

    const detailBlocks: string[] = []
    for (const id of detailIds) {
      try {
        const detail = await resolveDetailById(gateway, id)
        if (detail) detailBlocks.push(detail)
      } catch (err) {
        console.error('[stock-assistant] Error en detalle por id:', id, err)
        loadErrors.push(`detail ${id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    const payload = {
      user_intent: intent,
      wants_list: wantsTable,
      instruction_for_model:
        'Responde con los datos relevantes en texto claro. No uses HTML, CSS ni tablas de marcado.',
      ...focused,
      detail_lookups: detailBlocks,
      load_errors: loadErrors,
    }

    return {
      context: JSON.stringify(payload, null, 2),
      loadErrors,
      wantsTable,
    }
  } catch (err) {
    console.error('[stock-assistant] Falló buildStockAssistantContext:', err)
    return {
      context: JSON.stringify({
        error: 'No se pudo construir el contexto de inventario.',
        detail: err instanceof Error ? err.message : String(err),
      }),
      loadErrors: [err instanceof Error ? err.message : String(err)],
      wantsTable: /\btabla\b/i.test(userQuestion),
    }
  }
}

function pickFocusedPayload(
  bundle: Awaited<ReturnType<IStockAssistantContextGateway['fetchAllLists']>>,
  intent: string,
  limit: number,
): Record<string, unknown> {
  const products = summarizeList(bundle.products, limit)
  const productEntries = summarizeList(bundle.productEntries, limit)
  const shipments = summarizeList(bundle.shipments, limit)
  const sales = summarizeList(bundle.sales, limit)
  const stockMovements = summarizeList(bundle.stockMovements, limit)

  switch (intent) {
    case 'products':
      return { products, counts: { products: count(bundle.products) } }
    case 'product_entries':
      return { product_entries: productEntries, counts: { product_entries: count(bundle.productEntries) } }
    case 'shipments':
      return { shipments, counts: { shipments: count(bundle.shipments) } }
    case 'sales':
      return { sales, counts: { sales: count(bundle.sales) } }
    case 'stock_movements':
      return {
        stock_movements: stockMovements,
        counts: { stock_movements: count(bundle.stockMovements) },
      }
    default:
      return {
        products,
        product_entries: productEntries,
        shipments,
        sales,
        stock_movements: stockMovements,
        counts: {
          products: count(bundle.products),
          product_entries: count(bundle.productEntries),
          shipments: count(bundle.shipments),
          sales: count(bundle.sales),
          stock_movements: count(bundle.stockMovements),
        },
      }
  }
}

async function resolveDetailById(
  gateway: IStockAssistantContextGateway,
  id: string,
): Promise<string | null> {
  const attempts: Array<[string, () => Promise<unknown>]> = [
    ['stock_movement', () => gateway.fetchStockMovementById(id)],
    ['product', () => gateway.fetchProductById(id)],
    ['product_entry', () => gateway.fetchProductEntryById(id)],
    ['shipment', () => gateway.fetchShipmentById(id)],
    ['sale', () => gateway.fetchSaleById(id)],
  ]

  for (const [label, fn] of attempts) {
    try {
      const data = await fn()
      return JSON.stringify({ type: label, data })
    } catch {
      // try next resource
    }
  }
  return null
}

function summarizeList(data: unknown, limit: number): unknown {
  if (!Array.isArray(data)) return data
  return data.slice(0, limit)
}

function count(data: unknown): number {
  return Array.isArray(data) ? data.length : 0
}
