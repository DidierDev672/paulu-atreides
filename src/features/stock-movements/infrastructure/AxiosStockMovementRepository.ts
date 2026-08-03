import { axiosInstance } from '@/infrastructure/http/axiosInstance'
import type { IStockMovementRepository } from '../domain/IStockMovementRepository'
import type { CreateStockMovementPayload, StockMovement } from '../domain/StockMovement'

const BASE = '/stock_movements'

/**
 * Normalizes list payloads: array, single object, or { data: [...] }.
 */
function normalizeList(data: unknown): StockMovement[] {
  if (Array.isArray(data)) return data as StockMovement[]
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as StockMovement[]
    if (typeof obj.id === 'string') return [data as StockMovement]
  }
  return []
}

/**
 * Infrastructure adapter — implements the domain port with Axios (OCP/DIP).
 */
export class AxiosStockMovementRepository implements IStockMovementRepository {
  async findAll(): Promise<StockMovement[]> {
    const response = await axiosInstance.get<unknown>(BASE)
    return normalizeList(response.data)
  }

  async findById(id: string): Promise<StockMovement> {
    const response = await axiosInstance.get<StockMovement>(`${BASE}/${encodeURIComponent(id)}`)
    return response.data
  }

  async create(payload: CreateStockMovementPayload): Promise<StockMovement> {
    const response = await axiosInstance.post<StockMovement>(BASE, payload)
    return response.data
  }

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/${encodeURIComponent(id)}`)
  }
}

export const stockMovementRepository = new AxiosStockMovementRepository()
