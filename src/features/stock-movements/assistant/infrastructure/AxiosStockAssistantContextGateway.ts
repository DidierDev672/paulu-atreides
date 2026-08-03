import { getProductById, getProducts } from '@/application/services/productService'
import {
  getProductEntries,
  getProductEntryById,
} from '@/application/services/productEntryService'
import { getSaleById, getSales } from '@/application/services/saleService'
import { getShipmentById, getShipments } from '@/application/services/shipmentService'
import type {
  IStockAssistantContextGateway,
  StockAssistantContextBundle,
} from '../domain/IStockAssistantContextGateway'
import { stockMovementRepository } from '../../infrastructure/AxiosStockMovementRepository'

async function safeCall<T>(label: string, fn: () => Promise<T>, errors: string[]): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[stock-assistant] Error al cargar ${label}:`, err)
    errors.push(`${label}: ${message}`)
    return null
  }
}

/**
 * Infrastructure adapter — loads stock-related lists/details via Axios services (DIP).
 */
export class AxiosStockAssistantContextGateway implements IStockAssistantContextGateway {
  async fetchAllLists(): Promise<StockAssistantContextBundle> {
    const errors: string[] = []

    const [products, productEntries, shipments, salesResult, stockMovements] = await Promise.all([
      safeCall('products', () => getProducts(), errors),
      safeCall('product-entries', () => getProductEntries(), errors),
      safeCall('shipments', () => getShipments(), errors),
      safeCall('sales', () => getSales({ limit: 50, page: 1 }), errors),
      safeCall('stock_movements', () => stockMovementRepository.findAll(), errors),
    ])

    return {
      products: products ?? [],
      productEntries: productEntries ?? [],
      shipments: shipments ?? [],
      sales: salesResult?.data ?? salesResult ?? [],
      stockMovements: stockMovements ?? [],
      errors,
    }
  }

  async fetchProductById(id: string): Promise<unknown> {
    try {
      return await getProductById(id)
    } catch (err) {
      console.error('[stock-assistant] Error GET /products/{id}:', err)
      throw err
    }
  }

  async fetchProductEntryById(id: string): Promise<unknown> {
    try {
      return await getProductEntryById(id)
    } catch (err) {
      console.error('[stock-assistant] Error GET /product-entries/{id}:', err)
      throw err
    }
  }

  async fetchShipmentById(id: string): Promise<unknown> {
    try {
      return await getShipmentById(id)
    } catch (err) {
      console.error('[stock-assistant] Error GET /shipments/{id}:', err)
      throw err
    }
  }

  async fetchSaleById(id: string): Promise<unknown> {
    try {
      return await getSaleById(id)
    } catch (err) {
      console.error('[stock-assistant] Error GET /sales/{id}:', err)
      throw err
    }
  }

  async fetchStockMovementById(id: string): Promise<unknown> {
    try {
      return await stockMovementRepository.findById(id)
    } catch (err) {
      console.error('[stock-assistant] Error GET /stock_movements/{id}:', err)
      throw err
    }
  }
}

export const stockAssistantContextGateway = new AxiosStockAssistantContextGateway()
