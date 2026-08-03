import { axiosInstance } from '@/infrastructure/http/axiosInstance'
import type { IWineryLookup } from '../domain/IWineryLookup'
import type { StockWineryReference } from '../domain/StockWineryReference'

const BASE = '/wineries'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function toStockWineryReference(raw: unknown): StockWineryReference | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const id = asString(obj.id)
  if (!id) return null

  return {
    id,
    area: asString(obj.area),
  }
}

/**
 * Infrastructure adapter — GET /wineries/{id} via Axios (DIP).
 */
export class AxiosWineryLookup implements IWineryLookup {
  async findById(id: string): Promise<StockWineryReference> {
    const response = await axiosInstance.get<unknown>(`${BASE}/${encodeURIComponent(id)}`)
    const winery = toStockWineryReference(response.data)
    if (!winery) {
      throw new Error(`Bodega no encontrada: ${id}`)
    }
    return winery
  }
}

export const wineryLookup = new AxiosWineryLookup()
