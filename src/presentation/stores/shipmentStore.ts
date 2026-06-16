import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ShipmentResponse, CreateShipmentRequest } from '@/application/services/shipmentService'
import {
  getShipments as apiGetShipments,
  getShipmentById as apiGetShipmentById,
  createShipment as apiCreateShipment,
  updateShipment as apiUpdateShipment,
  deleteShipment as apiDeleteShipment,
} from '@/application/services/shipmentService'

export const useShipmentStore = defineStore('shipment', () => {
  const shipments = ref<ShipmentResponse[]>([])
  const currentShipment = ref<ShipmentResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchShipments(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      shipments.value = (await apiGetShipments()) ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener despachos.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchShipmentById(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      currentShipment.value = await apiGetShipmentById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener el despacho.'
    } finally {
      isLoading.value = false
    }
  }

  async function createShipment(data: CreateShipmentRequest): Promise<ShipmentResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const created = await apiCreateShipment(data)
      shipments.value.push(created)
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear el despacho.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateShipment(id: string, data: CreateShipmentRequest): Promise<ShipmentResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await apiUpdateShipment(id, data)
      const index = shipments.value.findIndex((s) => s.id === id)
      if (index !== -1) shipments.value[index] = updated
      if (currentShipment.value?.id === id) currentShipment.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar el despacho.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function removeShipment(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await apiDeleteShipment(id)
      shipments.value = shipments.value.filter((s) => s.id !== id)
      if (currentShipment.value?.id === id) currentShipment.value = null
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar el despacho.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    shipments,
    currentShipment,
    isLoading,
    error,
    fetchShipments,
    fetchShipmentById,
    createShipment,
    updateShipment,
    removeShipment,
    clearError,
  }
})
