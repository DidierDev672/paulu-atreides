import { axiosInstance } from '@/infrastructure/http/axiosInstance'
import type { IProviderLookup } from '../domain/IProviderLookup'
import type { StockProviderReference } from '../domain/StockProviderReference'

const BASE = '/providers'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function toStockProviderReference(raw: unknown): StockProviderReference | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const id = asString(obj.id)
  if (!id) return null

  return {
    id,
    business_name: asString(obj.business_name),
  }
}

/**
 * Infrastructure adapter — GET /providers/{id} via Axios (DIP).
 */
export class AxiosProviderLookup implements IProviderLookup {
  async findById(id: string): Promise<StockProviderReference> {
    const response = await axiosInstance.get<unknown>(`${BASE}/${encodeURIComponent(id)}`)
    const provider = toStockProviderReference(response.data)
    if (!provider) {
      throw new Error(`Proveedor no encontrado: ${id}`)
    }
    return provider
  }
}

export const providerLookup = new AxiosProviderLookup()
