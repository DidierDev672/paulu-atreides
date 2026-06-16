import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface WineryResponse {
  id: string
  registered_date: string
  user_id: string
  company_id: string
  area: string
  units: string
  createdAt: string
  updatedAt: string
}

export interface CreateWineryRequest {
  registered_date: string
  user_id: string
  company_id: string
  area: string
  units: string
}

export interface UpdateWineryRequest {
  registered_date: string
  user_id: string
  company_id: string
  area: string
  units: string
}

export async function getWineries(): Promise<WineryResponse[]> {
  const response = await axiosInstance.get<WineryResponse[]>('/wineries')
  return response.data
}

export async function getWineriesByCompany(companyId: string): Promise<WineryResponse[]> {
  const response = await axiosInstance.get<WineryResponse[]>(`/wineries?company_id=${encodeURIComponent(companyId)}`)
  return response.data
}

export async function getWineryById(id: string): Promise<WineryResponse> {
  const response = await axiosInstance.get<WineryResponse>(`/wineries/${id}`)
  return response.data
}

export async function createWinery(data: CreateWineryRequest): Promise<WineryResponse> {
  const response = await axiosInstance.post<WineryResponse>('/wineries', data)
  return response.data
}

export async function updateWinery(id: string, data: UpdateWineryRequest): Promise<WineryResponse> {
  const response = await axiosInstance.put<WineryResponse>(`/wineries/${id}`, data)
  return response.data
}

export async function deleteWinery(id: string): Promise<void> {
  await axiosInstance.delete(`/wineries/${id}`)
}
