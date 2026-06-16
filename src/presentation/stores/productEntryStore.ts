import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ProductEntryResponse, CreateProductEntryRequest } from '@/application/services/productEntryService'
import {
  getProductEntries as apiGetProductEntries,
  getProductEntryById as apiGetProductEntryById,
  createProductEntry as apiCreateProductEntry,
  updateProductEntry as apiUpdateProductEntry,
  deleteProductEntry as apiDeleteProductEntry,
} from '@/application/services/productEntryService'

export const useProductEntryStore = defineStore('productEntry', () => {
  const entries = ref<ProductEntryResponse[]>([])
  const currentEntry = ref<ProductEntryResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchEntries(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      entries.value = (await apiGetProductEntries()) ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener entradas.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEntryById(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      currentEntry.value = await apiGetProductEntryById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener la entrada.'
    } finally {
      isLoading.value = false
    }
  }

  async function createEntry(data: CreateProductEntryRequest): Promise<ProductEntryResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const created = await apiCreateProductEntry(data)
      entries.value.push(created)
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear la entrada.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateEntry(id: string, data: CreateProductEntryRequest): Promise<ProductEntryResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await apiUpdateProductEntry(id, data)
      const index = entries.value.findIndex((e) => e.id === id)
      if (index !== -1) entries.value[index] = updated
      if (currentEntry.value?.id === id) currentEntry.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar la entrada.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function removeEntry(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await apiDeleteProductEntry(id)
      entries.value = entries.value.filter((e) => e.id !== id)
      if (currentEntry.value?.id === id) currentEntry.value = null
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar la entrada.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    entries,
    currentEntry,
    isLoading,
    error,
    fetchEntries,
    fetchEntryById,
    createEntry,
    updateEntry,
    removeEntry,
    clearError,
  }
})
