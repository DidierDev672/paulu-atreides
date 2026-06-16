import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface ProductResponse {
  id: string
  company_id: string
  supplier_id: string
  name: string
  product_code: string
  categories: string[]
  unit: string
  quantity: number
  minimum_stock: number
  winery_id: string
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  company_id: string
  supplier_id: string
  name: string
  product_code: string
  categories: string[]
  unit: string
  quantity: number
  minimum_stock: number
  winery_id: string
}

export interface UpdateProductRequest {
  supplier_id: string
  name: string
  product_code: string
  categories: string[]
  unit: string
  quantity: number
  minimum_stock: number
  winery_id: string
}

export async function getProducts(): Promise<ProductResponse[]> {
  const response = await axiosInstance.get<ProductResponse[]>('/products')
  return response.data
}

export async function getProductsByCompany(companyId: string): Promise<ProductResponse[]> {
  const response = await axiosInstance.get<ProductResponse[]>(`/products?company_id=${encodeURIComponent(companyId)}`)
  return response.data
}

export async function getProductById(id: string): Promise<ProductResponse> {
  const response = await axiosInstance.get<ProductResponse>(`/products/${id}`)
  return response.data
}

export async function createProduct(data: CreateProductRequest): Promise<ProductResponse> {
  const response = await axiosInstance.post<ProductResponse>('/products', data)
  return response.data
}

export async function updateProduct(id: string, data: UpdateProductRequest): Promise<ProductResponse> {
  const response = await axiosInstance.put<ProductResponse>(`/products/${id}`, data)
  return response.data
}

export async function deleteProduct(id: string): Promise<void> {
  await axiosInstance.delete(`/products/${id}`)
}
