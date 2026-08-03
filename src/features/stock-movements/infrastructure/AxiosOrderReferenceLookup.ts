import { axiosInstance } from '@/infrastructure/http/axiosInstance'
import type { IOrderReferenceLookup } from '../domain/IOrderReferenceLookup'
import type { StockOrderReference } from '../domain/StockOrderReference'

const BASE = '/orders'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function toStockOrderReference(raw: unknown): StockOrderReference | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const id = asString(obj.id)
  if (!id) return null

  return {
    id,
    order_numeric: asString(obj.order_numeric),
    date: asString(obj.date),
  }
}

/**
 * Infrastructure adapter — GET /orders/{id} via Axios (DIP).
 */
export class AxiosOrderReferenceLookup implements IOrderReferenceLookup {
  async findById(id: string): Promise<StockOrderReference> {
    const response = await axiosInstance.get<unknown>(`${BASE}/${encodeURIComponent(id)}`)
    const order = toStockOrderReference(response.data)
    if (!order) {
      throw new Error(`Orden no encontrada: ${id}`)
    }
    return order
  }
}

export const orderReferenceLookup = new AxiosOrderReferenceLookup()
