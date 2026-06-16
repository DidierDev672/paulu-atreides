import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ProviderResponse, CreateProviderRequest, UpdateProviderRequest } from '@/application/services/providerService'
import {
  getProviders as apiGetProviders,
  getProviderById as apiGetProviderById,
  createProvider as apiCreateProvider,
  updateProvider as apiUpdateProvider,
  deleteProvider as apiDeleteProvider,
} from '@/application/services/providerService'

export const useProviderStore = defineStore('provider', () => {
  const providers = ref<ProviderResponse[]>([])
  const currentProvider = ref<ProviderResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProviders(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      providers.value = (await apiGetProviders()) ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener proveedores.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProviderById(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      currentProvider.value = await apiGetProviderById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener el proveedor.'
    } finally {
      isLoading.value = false
    }
  }

  async function createProvider(data: CreateProviderRequest): Promise<ProviderResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const created = await apiCreateProvider(data)
      providers.value.push(created)
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear el proveedor.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateProvider(id: string, data: UpdateProviderRequest): Promise<ProviderResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await apiUpdateProvider(id, data)
      const index = providers.value.findIndex((p) => p.id === id)
      if (index !== -1) providers.value[index] = updated
      if (currentProvider.value?.id === id) currentProvider.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar el proveedor.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function removeProvider(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await apiDeleteProvider(id)
      providers.value = providers.value.filter((p) => p.id !== id)
      if (currentProvider.value?.id === id) currentProvider.value = null
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar el proveedor.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    providers,
    currentProvider,
    isLoading,
    error,
    fetchProviders,
    fetchProviderById,
    createProvider,
    updateProvider,
    removeProvider,
    clearError,
  }
})
