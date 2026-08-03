import { axiosInstance } from '@/infrastructure/http/axiosInstance'
import type { ICompanyLookup } from '../domain/ICompanyLookup'
import type { StockCompanyReference } from '../domain/StockCompanyReference'

const BASE = '/companies'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function toStockCompanyReference(raw: unknown): StockCompanyReference | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const id = asString(obj.id)
  if (!id) return null

  // Prefer business_name (API field); tolerate common typo key if present.
  const businessName =
    asString(obj.business_name) || asString(obj.bussiness_name) || asString(obj.social_reason)

  return {
    id,
    business_name: businessName,
  }
}

/**
 * Infrastructure adapter — GET /companies/{id} via Axios (DIP).
 */
export class AxiosCompanyLookup implements ICompanyLookup {
  async findById(id: string): Promise<StockCompanyReference> {
    const response = await axiosInstance.get<unknown>(`${BASE}/${encodeURIComponent(id)}`)
    const company = toStockCompanyReference(response.data)
    if (!company) {
      throw new Error(`Compañía no encontrada: ${id}`)
    }
    return company
  }
}

export const companyLookup = new AxiosCompanyLookup()
