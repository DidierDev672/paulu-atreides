import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface ShipmentDetail {
  code: string
  product: string
  unit: string
  quantity: number
  unit_cost: number
  subtotal: number
}

export interface SourceDocument {
  entry_ids: string[]
}

export interface Recipient {
  recipient_type: string
  recipient_id: string
}

export interface ShipmentFinancialSummary {
  subtotal: number
  vat: number
  discount: number
  total: number
}

export interface ShipmentResponse {
  id: string
  shipment_number: string
  record_date: string
  movement_type: string
  status: string
  company_id: string
  warehouse_id: string
  responsible_id: string
  source_document: SourceDocument
  recipient: Recipient
  details: ShipmentDetail[]
  financial_summary: ShipmentFinancialSummary
  remarks: string
  createdAt: string
  updatedAt: string
}

export interface CreateShipmentRequest {
  shipment_number: string
  record_date: string
  movement_type: string
  status: string
  company_id: string
  warehouse_id: string
  responsible_id: string
  source_document: SourceDocument
  recipient: Recipient
  details: ShipmentDetail[]
  financial_summary: ShipmentFinancialSummary
  remarks: string
}

export async function getShipments(): Promise<ShipmentResponse[]> {
  const response = await axiosInstance.get<ShipmentResponse[]>('/shipments')
  return response.data
}

export async function getShipmentById(id: string): Promise<ShipmentResponse> {
  const response = await axiosInstance.get<ShipmentResponse>(`/shipments/${id}`)
  return response.data
}

export async function createShipment(data: CreateShipmentRequest): Promise<ShipmentResponse> {
  const response = await axiosInstance.post<ShipmentResponse>('/shipments', data)
  return response.data
}

export async function updateShipment(id: string, data: CreateShipmentRequest): Promise<ShipmentResponse> {
  const response = await axiosInstance.put<ShipmentResponse>(`/shipments/${id}`, data)
  return response.data
}

export async function deleteShipment(id: string): Promise<void> {
  await axiosInstance.delete(`/shipments/${id}`)
}
