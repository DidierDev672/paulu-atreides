import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HistoryEntry } from '@/domain/entities/HistoryEntry'
import {
  getHistoryEntries as apiGetHistoryEntries,
  createHistoryEntry as apiCreateHistoryEntry,
  getHistoryEntriesByEntity as apiGetHistoryEntriesByEntity,
} from '@/application/services/historyService'
import type { CreateHistoryRequest } from '@/application/services/historyService'

export const useHistoryStore = defineStore('history', () => {
  const entries = ref<HistoryEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchEntries(params?: {
    limit?: number
    offset?: number
    entityType?: string
    entityId?: string
  }): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      entries.value = (await apiGetHistoryEntries(params)) ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener el historial.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEntriesByEntity(
    entityType: string,
    entityId: string
  ): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      entries.value = (await apiGetHistoryEntriesByEntity(entityType, entityId)) ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener el historial.'
    } finally {
      isLoading.value = false
    }
  }

  async function addEntry(data: CreateHistoryRequest): Promise<HistoryEntry | null> {
    isLoading.value = true
    error.value = null
    try {
      const created = await apiCreateHistoryEntry(data)
      entries.value.unshift(created)
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar en el historial.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    entries,
    isLoading,
    error,
    fetchEntries,
    fetchEntriesByEntity,
    addEntry,
    clearError,
  }
})
