import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface OrderDetail {
  code: string
  product: string
  unit: string
  quantity_requested: number
  estimated_cost: number
  subtotal: number
}

export interface FinancialSummary {
  purchase_subtotal: number
  vat: number
  discount: number
  purchase_total: number
}

export interface OrderResponse {
  id: string
  order_numeric: string
  order_type: string
  date: string
  company_id: string
  user_id: string
  requested_by: string
  details: OrderDetail[]
  financial_summary: FinancialSummary
  status: string
  reason_for_order: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  order_numeric: string
  order_type: string
  date: string
  company_id: string
  user_id: string
  requested_by: string
  details: OrderDetail[]
  financial_summary: FinancialSummary
  status: string
  reason_for_order: string
}

export async function getOrders(): Promise<OrderResponse[]> {
  const response = await axiosInstance.get<OrderResponse[]>('/orders')
  return response.data
}

export async function getOrderById(id: string): Promise<OrderResponse> {
  const response = await axiosInstance.get<OrderResponse>(`/orders/${id}`)
  return response.data
}

export async function createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
  const response = await axiosInstance.post<OrderResponse>('/orders', data)
  return response.data
}

export async function updateOrder(id: string, data: CreateOrderRequest): Promise<OrderResponse> {
  const response = await axiosInstance.put<OrderResponse>(`/orders/${id}`, data)
  return response.data
}

export async function deleteOrder(id: string): Promise<void> {
  await axiosInstance.delete(`/orders/${id}`)
}

export async function approveOrder(id: string): Promise<OrderResponse> {
  const response = await axiosInstance.patch<OrderResponse>(`/orders/${id}/approve`)
  return response.data
}
