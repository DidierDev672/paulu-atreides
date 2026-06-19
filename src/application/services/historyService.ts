import { axiosInstance } from '@/infrastructure/http/axiosInstance'
import type { HistoryEntry } from '@/domain/entities/HistoryEntry'

export interface HistoryApiResponse {
  history_id: string
  event_date: string
  user_id: string
  event_type: string
  company_id?: string
  document_id: string
  document_type: string
  previous_data?: string | null
  new_data?: string | null
  description: string
  ip_address?: string
  result?: string
  created_at: string
}

export interface CreateHistoryRequest {
  entity_type: string
  entity_id: string
  action: string
  changes?: Record<string, { old: unknown; new: unknown }> | null
  user_id: string
  user_name: string
  details: string
}

function extractDocumentName(api: HistoryApiResponse): string | undefined {
  const raw = api.new_data ?? api.previous_data
  if (!raw) return undefined
  try {
    let data = JSON.parse(raw)
    if (typeof data === 'string') data = JSON.parse(data)
    if (api.document_type === 'product') return data.name
    if (data.details?.length > 0) return data.details[0].product
    return undefined
  } catch {
    return undefined
  }
}

function mapToHistoryEntry(api: HistoryApiResponse): HistoryEntry {
  return {
    id: api.history_id,
    entityType: api.document_type,
    entityId: api.document_id,
    documentName: extractDocumentName(api),
    action: api.event_type as HistoryEntry['action'],
    changes: null,
    userId: api.user_id,
    userName: api.user_id,
    details: api.description,
    timestamp: api.event_date,
    result: api.result,
    companyId: api.company_id,
    ipAddress: api.ip_address,
  }
}

export async function createHistoryEntry(data: CreateHistoryRequest): Promise<HistoryEntry> {
  const response = await axiosInstance.post<HistoryApiResponse>('/history', data)
  return mapToHistoryEntry(response.data)
}

export async function getHistoryEntries(params?: {
  limit?: number
  offset?: number
  entityType?: string
  entityId?: string
}): Promise<HistoryEntry[]> {
  const queryParams: Record<string, string> = {}
  if (params?.limit) queryParams.limit = String(params.limit)
  if (params?.offset) queryParams.offset = String(params.offset)
  if (params?.entityType) queryParams.entity_type = params.entityType
  if (params?.entityId) queryParams.entity_id = params.entityId

  const query = new URLSearchParams(queryParams).toString()
  const endpoint = query ? '/history?' : '/history'
  const response = await axiosInstance.get<HistoryApiResponse[]>(endpoint)
  return response.data.map(mapToHistoryEntry)
}

export async function getHistoryEntriesByEntity(
  entityType: string,
  entityId: string
): Promise<HistoryEntry[]> {
  const response = await axiosInstance.get<HistoryApiResponse[]>(
    '/history/'
  )
  return response.data.map(mapToHistoryEntry)
}
