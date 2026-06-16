import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface TaxInformationResponse {
  id: string
  user_id: string
  business_id: string
  tax_regime: string
  vat_responsible: boolean
  withholding_taxpayer: boolean
  large_taxpayer: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaxInformationRequest {
  user_id: string
  business_id: string
  tax_regime: string
  vat_responsible: boolean
  withholding_taxpayer: boolean
  large_taxpayer: boolean
}

export async function createTaxInformation(data: CreateTaxInformationRequest): Promise<TaxInformationResponse> {
  const response = await axiosInstance.post<TaxInformationResponse>('/tax-information', data)
  return response.data
}
