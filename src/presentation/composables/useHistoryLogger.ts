import { useHistoryStore } from '@/presentation/stores/historyStore'
import { useAuthStore } from '@/presentation/stores/authStore'
import type { CreateHistoryRequest } from '@/application/services/historyService'

export function useHistoryLogger() {
  const historyStore = useHistoryStore()
  const authStore = useAuthStore()

  function getUserInfo(): { userId: string; userName: string } {
    const user = authStore.session?.user
    return {
      userId: user?.id ?? '',
      userName: user?.fullName ?? 'Usuario desconocido',
    }
  }

  async function logCreate(params: {
    entityType: string
    entityId: string
    details: string
    changes?: Record<string, { old: unknown; new: unknown }>
  }): Promise<void> {
    const { userId, userName } = getUserInfo()
    const data: CreateHistoryRequest = {
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: 'CREATE',
      details: params.details,
      user_id: userId,
      user_name: userName,
      changes: params.changes ?? null,
    }
    await historyStore.addEntry(data)
  }

  async function logUpdate(params: {
    entityType: string
    entityId: string
    details: string
    changes?: Record<string, { old: unknown; new: unknown }>
  }): Promise<void> {
    const { userId, userName } = getUserInfo()
    const data: CreateHistoryRequest = {
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: 'UPDATE',
      details: params.details,
      user_id: userId,
      user_name: userName,
      changes: params.changes ?? null,
    }
    await historyStore.addEntry(data)
  }

  async function logDelete(params: {
    entityType: string
    entityId: string
    details: string
  }): Promise<void> {
    const { userId, userName } = getUserInfo()
    const data: CreateHistoryRequest = {
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: 'DELETE',
      details: params.details,
      user_id: userId,
      user_name: userName,
      changes: null,
    }
    await historyStore.addEntry(data)
  }

  async function logApprove(params: {
    entityType: string
    entityId: string
    details: string
  }): Promise<void> {
    const { userId, userName } = getUserInfo()
    const data: CreateHistoryRequest = {
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: 'APPROVE',
      details: params.details,
      user_id: userId,
      user_name: userName,
      changes: null,
    }
    await historyStore.addEntry(data)
  }

  async function logDeduct(params: {
    entityType: string
    entityId: string
    details: string
    changes?: Record<string, { old: unknown; new: unknown }>
  }): Promise<void> {
    const { userId, userName } = getUserInfo()
    const data: CreateHistoryRequest = {
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: 'DEDUCT',
      details: params.details,
      user_id: userId,
      user_name: userName,
      changes: params.changes ?? null,
    }
    await historyStore.addEntry(data)
  }

  return {
    logCreate,
    logUpdate,
    logDelete,
    logApprove,
    logDeduct,
  }
}
