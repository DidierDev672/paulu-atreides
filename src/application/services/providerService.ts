import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface ProviderResponse {
  id: string
  code: string
  type_person: string
  document_type: string
  document_number: string
  verification_digit: string
  business_name: string
  business_activity: string
  status: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProviderRequest {
  code: string
  type_person: string
  document_type: string
  document_number: string
  verification_digit: string
  business_name: string
  business_activity: string
  status: boolean
}

export interface UpdateProviderRequest {
  code: string
  type_person: string
  document_type: string
  document_number: string
  verification_digit: string
  business_name: string
  business_activity: string
  status: boolean
}

export async function getProviders(): Promise<ProviderResponse[]> {
  const response = await axiosInstance.get<ProviderResponse[]>('/providers')
  return response.data
}

export async function getProviderById(id: string): Promise<ProviderResponse> {
  const response = await axiosInstance.get<ProviderResponse>(`/providers/${id}`)
  return response.data
}

export async function createProvider(data: CreateProviderRequest): Promise<ProviderResponse> {
  const response = await axiosInstance.post<ProviderResponse>('/providers', data)
  return response.data
}

export async function updateProvider(id: string, data: UpdateProviderRequest): Promise<ProviderResponse> {
  const response = await axiosInstance.put<ProviderResponse>(`/providers/${id}`, data)
  return response.data
}

export async function deleteProvider(id: string): Promise<void> {
  await axiosInstance.delete(`/providers/${id}`)
}
