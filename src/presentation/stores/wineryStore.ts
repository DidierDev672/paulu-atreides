import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WineryResponse, CreateWineryRequest, UpdateWineryRequest } from '@/application/services/wineryService'
import {
  getWineries as apiGetWineries,
  getWineriesByCompany as apiGetWineriesByCompany,
  getWineryById as apiGetWineryById,
  createWinery as apiCreateWinery,
  updateWinery as apiUpdateWinery,
  deleteWinery as apiDeleteWinery,
} from '@/application/services/wineryService'

export const useWineryStore = defineStore('winery', () => {
  const wineries = ref<WineryResponse[]>([])
  const currentWinery = ref<WineryResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchWineries(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      wineries.value = (await apiGetWineries()) ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener bodegas.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchWineriesByCompany(companyId: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      wineries.value = await apiGetWineriesByCompany(companyId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener bodegas.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchWineryById(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      currentWinery.value = await apiGetWineryById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener la bodega.'
    } finally {
      isLoading.value = false
    }
  }

  async function createWinery(data: CreateWineryRequest): Promise<WineryResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const created = await apiCreateWinery(data)
      wineries.value.push(created)
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear la bodega.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateWinery(id: string, data: UpdateWineryRequest): Promise<WineryResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await apiUpdateWinery(id, data)
      const index = wineries.value.findIndex((w) => w.id === id)
      if (index !== -1) wineries.value[index] = updated
      if (currentWinery.value?.id === id) currentWinery.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar la bodega.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function removeWinery(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await apiDeleteWinery(id)
      wineries.value = wineries.value.filter((w) => w.id !== id)
      if (currentWinery.value?.id === id) currentWinery.value = null
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar la bodega.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    wineries,
    currentWinery,
    isLoading,
    error,
    fetchWineries,
    fetchWineriesByCompany,
    fetchWineryById,
    createWinery,
    updateWinery,
    removeWinery,
    clearError,
  }
})
