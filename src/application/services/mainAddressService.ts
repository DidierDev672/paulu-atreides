import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface MainAddressResponse {
  id: string
  user_id: string
  company_id: string
  country: string
  department: string
  municipio: string
  address: string
  postcode: string
  createdAt: string
  updatedAt: string
}

export interface CreateMainAddressRequest {
  user_id: string
  company_id: string
  country: string
  department: string
  municipio: string
  address: string
  postcode: string
}

export async function createMainAddress(data: CreateMainAddressRequest): Promise<MainAddressResponse> {
  const response = await axiosInstance.post<MainAddressResponse>('/main-addresses', data)
  return response.data
}
