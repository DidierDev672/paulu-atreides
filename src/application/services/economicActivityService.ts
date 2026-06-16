import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface EconomicActivityResponse {
  id: string
  user_id: string
  company_id: string
  code: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface CreateEconomicActivityRequest {
  user_id: string
  company_id: string
  code: string
  description: string
}

export async function createEconomicActivity(data: CreateEconomicActivityRequest): Promise<EconomicActivityResponse> {
  const response = await axiosInstance.post<EconomicActivityResponse>('/economic-activities', data)
  return response.data
}
