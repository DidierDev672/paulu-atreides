import { axiosInstance } from '@/infrastructure/http/axiosInstance'
import type { IProductCatalog } from '../domain/IProductCatalog'
import type { StockProduct } from '../domain/StockProduct'

const BASE = '/products'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function asNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''))
  return Number.isFinite(n) ? n : 0
}

function asCategories(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((c) => asString(c)).filter(Boolean)
}

/**
 * Normalizes one product payload from GET /products (SRP: mapping only).
 */
function toStockProduct(raw: unknown): StockProduct | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const id = asString(obj.id)
  if (!id) return null

  return {
    id,
    company_id: asString(obj.company_id),
    supplier_id: asString(obj.supplier_id),
    name: asString(obj.name),
    product_code: asString(obj.product_code),
    categories: asCategories(obj.categories),
    unit: asString(obj.unit),
    quantity: asNumber(obj.quantity),
    minimum_stock: asNumber(obj.minimum_stock),
    winery_id: asString(obj.winery_id),
  }
}

function normalizeList(data: unknown): StockProduct[] {
  const source = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)
      ? ((data as { data: unknown[] }).data)
      : data && typeof data === 'object' && typeof (data as { id?: unknown }).id === 'string'
        ? [data]
        : []

  return source.map(toStockProduct).filter((p): p is StockProduct => p !== null)
}

/**
 * Infrastructure adapter — Axios implementation of IProductCatalog (DIP).
 */
export class AxiosProductCatalog implements IProductCatalog {
  async findAll(): Promise<StockProduct[]> {
    const response = await axiosInstance.get<unknown>(BASE)
    return normalizeList(response.data)
  }

  async findById(id: string): Promise<StockProduct> {
    const response = await axiosInstance.get<unknown>(`${BASE}/${encodeURIComponent(id)}`)
    const product = toStockProduct(response.data)
    if (!product) {
      throw new Error(`Producto no encontrado: ${id}`)
    }
    return product
  }
}

export const productCatalog = new AxiosProductCatalog()
