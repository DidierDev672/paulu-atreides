import { axiosInstance } from '@/infrastructure/http/axiosInstance'

export interface UpdateUserRequest {
  name_full: string
  phone: string
  id_number: string
  date_of_birth: string
  email: string
}

export interface UserResponse {
  id: string
  name_full: string
  phone: string
  id_number: string
  date_of_birth: string
  email: string
  createdAt: string
  updatedAt: string
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
  const response = await axiosInstance.put<UserResponse>(`/users/${id}`, data)
  return response.data
}
