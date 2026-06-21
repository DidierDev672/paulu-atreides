import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface SaleProduct {
  code: string
  product: string
  unit: string
  quantity: number
  price: number
  subtotal: number
}

export interface SaleResponse {
  sale_id: string
  sale_number: string
  order_id: string
  client_id: string
  warehouse_id: string
  order_type: string
  products: SaleProduct[]
  subtotal: number
  vat: number
  discount: number
  total: number
  payment_method: string
  status: 'PENDING' | 'PAID' | 'CANCELED'
  created_at: string
  created_by: string
  company_id: string
}

export interface SaleListResponse {
  data: SaleResponse[]
  page: number
  limit: number
}

export async function getSales(params?: {
  client_id?: string
  status?: string
  payment_method?: string
  date_from?: string
  date_to?: string
  company_id?: string
  page?: number
  limit?: number
}): Promise<SaleListResponse> {
  const queryParams: Record<string, string> = {}
  if (params?.client_id) queryParams.client_id = params.client_id
  if (params?.status) queryParams.status = params.status
  if (params?.payment_method) queryParams.payment_method = params.payment_method
  if (params?.date_from) queryParams.date_from = params.date_from
  if (params?.date_to) queryParams.date_to = params.date_to
  if (params?.company_id) queryParams.company_id = params.company_id
  if (params?.page) queryParams.page = String(params.page)
  if (params?.limit) queryParams.limit = String(params.limit)

  const query = new URLSearchParams(queryParams).toString()
  const endpoint = query ? `/sales?${query}` : '/sales'
  const response = await axiosInstance.get<SaleListResponse>(endpoint)
  return response.data
}

export async function getSaleById(saleId: string): Promise<SaleResponse> {
  const response = await axiosInstance.get<SaleResponse>(`/sales/${saleId}`)
  return response.data
}

export async function updateSaleStatus(saleId: string, status: string): Promise<SaleResponse> {
  const response = await axiosInstance.patch<SaleResponse>(`/sales/${saleId}/status`, { status })
  return response.data
}

export async function updateSaleDiscount(saleId: string, discount: number): Promise<SaleResponse> {
  const response = await axiosInstance.patch<SaleResponse>(`/sales/${saleId}/discount`, { discount })
  return response.data
}

export interface CreateSaleRequest {
  sale_number: string
  order_id: string
  order_type: string
  provider_id?: string
  warehouse_id: string
  products: SaleProduct[]
  subtotal: number
  vat: number
  discount: number
  total: number
  payment_method: string
  created_by: string
  company_id: string
}

export async function createSale(data: CreateSaleRequest): Promise<SaleResponse> {
  const response = await axiosInstance.post<SaleResponse>('/sales', data)
  return response.data
}

export async function updateSale(id: string, data: Partial<CreateSaleRequest>): Promise<SaleResponse> {
  const response = await axiosInstance.put<SaleResponse>(`/sales/${id}`, data)
  return response.data
}

export async function deleteSale(id: string): Promise<void> {
  await axiosInstance.delete(`/sales/${id}`)
}
