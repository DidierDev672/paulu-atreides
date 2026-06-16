import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface ProductEntryDetail {
  code: string
  product: string
  unit: string
  quantity: number
  unit_cost: number
  subtotal: number
  commercial_policy: string
  profit_margin: number
  fixed_markup: number
  suggested_selling_price: number
}

export interface FinancialSummary {
  purchase_subtotal: number
  vat: number
  discount: number
  purchase_total: number
}

export interface ProductEntryResponse {
  id: string
  entry_number: string
  registered_date: string
  movement_type: string
  warehouse: string
  responsible_party: string
  company_id: string
  details: ProductEntryDetail[]
  financial_summary: FinancialSummary
  observations: string
  createdAt: string
  updatedAt: string
}

export interface CreateProductEntryRequest {
  entry_number: string
  registered_date: string
  movement_type: string
  warehouse: string
  responsible_party: string
  company_id: string
  details: ProductEntryDetail[]
  financial_summary: FinancialSummary
  observations: string
}

export async function getProductEntries(): Promise<ProductEntryResponse[]> {
  const response = await axiosInstance.get<ProductEntryResponse[]>('/product-entries')
  return response.data
}

export async function getProductEntryById(id: string): Promise<ProductEntryResponse> {
  const response = await axiosInstance.get<ProductEntryResponse>(`/product-entries/${id}`)
  return response.data
}

export async function createProductEntry(data: CreateProductEntryRequest): Promise<ProductEntryResponse> {
  const response = await axiosInstance.post<ProductEntryResponse>('/product-entries', data)
  return response.data
}

export async function updateProductEntry(id: string, data: CreateProductEntryRequest): Promise<ProductEntryResponse> {
  const response = await axiosInstance.put<ProductEntryResponse>(`/product-entries/${id}`, data)
  return response.data
}

export async function deleteProductEntry(id: string): Promise<void> {
  await axiosInstance.delete(`/product-entries/${id}`)
}

export async function getProductEntriesByCodes(codes: string[], companyId: string): Promise<ProductEntryResponse[]> {
  const response = await axiosInstance.get<ProductEntryResponse[]>('/product-entries/by-product-codes', {
    params: { codes: codes.join(','), company_id: companyId },
  })
  return response.data
}
