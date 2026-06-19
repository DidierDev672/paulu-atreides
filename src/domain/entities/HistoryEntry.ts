export interface HistoryChange {
  old: unknown
  new: unknown
}

export type HistoryAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'APPROVE' | 'DEDUCT'
  | 'LOGIN' | 'LOGOUT' | 'REGISTER'
  | 'SHIPMENT_CREATED' | 'ORDER_CREATED'
  | 'ENTRY_CREATED' | 'RELATION_CREATED'

export interface HistoryEntry {
  id: string
  entityType: string
  entityId: string
  documentName?: string
  action: HistoryAction
  changes: Record<string, HistoryChange> | null
  userId: string
  userName: string
  details: string
  timestamp: string
  result?: string
  companyId?: string
  ipAddress?: string
}
