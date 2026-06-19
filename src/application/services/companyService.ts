import axios from 'axios'
import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface CompanyRequest {
  user_id: string
  nit: string
  social_reason: string
  business_name: string
  type_person: string
  company_type: string
  status: string
  constitution_date: string
  email: string
  phone: string
  cellphone: string
}

export interface CompanyResponse {
  id: string
  user_id: string
  nit: string
  social_reason: string
  business_name: string
  type_person: string
  company_type: string
  status: string
  constitution_date: string
  email: string
  phone: string
  cellphone: string
  createdAt: string
  updatedAt: string
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
    return (err.response.data as Record<string, string>).error
  }
  if (err instanceof Error) return err.message
  return 'Error al procesar la solicitud.'
}

export async function getCompanyById(id: string): Promise<CompanyResponse> {
  const response = await axiosInstance.get<CompanyResponse>(`/companies/${id}`)
  return response.data
}

export async function getCompanyByUser(userId: string): Promise<CompanyResponse[]> {
  try {
    const response = await axiosInstance.get<CompanyResponse[]>(`/companies/user/${userId}`)
    return response.data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return []
    throw err
  }
}

export async function createCompany(data: CompanyRequest): Promise<CompanyResponse> {
  const response = await axiosInstance.post<CompanyResponse>('/companies', data)
  return response.data
}

export async function updateCompany(id: string, data: Partial<CompanyRequest>): Promise<CompanyResponse> {
  const response = await axiosInstance.put<CompanyResponse>(`/companies/${id}`, data)
  return response.data
}
