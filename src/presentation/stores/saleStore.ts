import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SaleResponse } from '@/application/services/saleService'
import {
  getSales as apiGetSales,
  getSaleById as apiGetSaleById,
  updateSaleStatus as apiUpdateSaleStatus,
  updateSaleDiscount as apiUpdateSaleDiscount,
  createSale as apiCreateSale,
  updateSale as apiUpdateSale,
  deleteSale as apiDeleteSale,
  type CreateSaleRequest,
} from '@/application/services/saleService'

export const useSaleStore = defineStore('sale', () => {
  const sales = ref<SaleResponse[]>([])
  const currentSale = ref<SaleResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const limit = ref(20)
  const totalCount = ref(0)

  async function fetchSales(params?: {
    client_id?: string
    status?: string
    payment_method?: string
    date_from?: string
    date_to?: string
    company_id?: string
    page?: number
    limit?: number
  }): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const resp = await apiGetSales(params)
      sales.value = resp.data ?? []
      page.value = resp.page
      limit.value = resp.limit
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener ventas.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSaleById(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      currentSale.value = await apiGetSaleById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener la venta.'
    } finally {
      isLoading.value = false
    }
  }

  async function updateStatus(id: string, status: string): Promise<boolean> {
    error.value = null
    try {
      const updated = await apiUpdateSaleStatus(id, status)
      const idx = sales.value.findIndex((s) => s.sale_id === id)
      if (idx !== -1) sales.value[idx] = updated
      if (currentSale.value?.sale_id === id) currentSale.value = updated
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar estado.'
      return false
    }
  }

  async function updateDiscount(id: string, discount: number): Promise<boolean> {
    error.value = null
    try {
      const updated = await apiUpdateSaleDiscount(id, discount)
      const idx = sales.value.findIndex((s) => s.sale_id === id)
      if (idx !== -1) sales.value[idx] = updated
      if (currentSale.value?.sale_id === id) currentSale.value = updated
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar descuento.'
      return false
    }
  }

  async function updateSale(saleId: string, data: Partial<CreateSaleRequest>): Promise<boolean> {
    error.value = null
    try {
      const updated = await apiUpdateSale(saleId, data)
      const idx = sales.value.findIndex((s) => s.sale_id === saleId)
      if (idx !== -1) sales.value[idx] = updated
      if (currentSale.value?.sale_id === saleId) currentSale.value = updated
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar la venta.'
      return false
    }
  }

  async function removeSale(saleId: string): Promise<boolean> {
    error.value = null
    try {
      await apiDeleteSale(saleId)
      sales.value = sales.value.filter((s) => s.sale_id !== saleId)
      if (currentSale.value?.sale_id === saleId) currentSale.value = null
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar la venta.'
      return false
    }
  }

  async function create(data: CreateSaleRequest): Promise<SaleResponse | null> {
    error.value = null
    try {
      const sale = await apiCreateSale(data)
      sales.value.unshift(sale)
      return sale
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear la venta.'
      return null
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    sales,
    currentSale,
    isLoading,
    error,
    page,
    limit,
    fetchSales,
    fetchSaleById,
    updateStatus,
    updateDiscount,
    updateSale,
    removeSale,
    create,
    clearError,
  }
})
