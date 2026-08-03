export type StockAssistantRole = 'assistant' | 'user' | 'system'

export interface StockAssistantMessage {
  id: string
  role: StockAssistantRole
  text: string
  createdAt: string
}
