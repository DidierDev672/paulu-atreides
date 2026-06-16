import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OrderResponse, CreateOrderRequest } from '@/application/services/orderService'
import {
  getOrders as apiGetOrders,
  getOrderById as apiGetOrderById,
  createOrder as apiCreateOrder,
  updateOrder as apiUpdateOrder,
  deleteOrder as apiDeleteOrder,
  approveOrder as apiApproveOrder,
} from '@/application/services/orderService'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<OrderResponse[]>([])
  const currentOrder = ref<OrderResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrders(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      orders.value = (await apiGetOrders()) ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener órdenes.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchOrderById(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      currentOrder.value = await apiGetOrderById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener la orden.'
    } finally {
      isLoading.value = false
    }
  }

  async function createOrder(data: CreateOrderRequest): Promise<OrderResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const created = await apiCreateOrder(data)
      orders.value.push(created)
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear la orden.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateOrder(id: string, data: CreateOrderRequest): Promise<OrderResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await apiUpdateOrder(id, data)
      const index = orders.value.findIndex((o) => o.id === id)
      if (index !== -1) orders.value[index] = updated
      if (currentOrder.value?.id === id) currentOrder.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar la orden.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function removeOrder(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await apiDeleteOrder(id)
      orders.value = orders.value.filter((o) => o.id !== id)
      if (currentOrder.value?.id === id) currentOrder.value = null
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar la orden.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function approveOrder(id: string): Promise<OrderResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await apiApproveOrder(id)
      const index = orders.value.findIndex((o) => o.id === id)
      if (index !== -1) orders.value[index] = updated
      if (currentOrder.value?.id === id) currentOrder.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al aprobar la orden.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    removeOrder,
    approveOrder,
    clearError,
  }
})
