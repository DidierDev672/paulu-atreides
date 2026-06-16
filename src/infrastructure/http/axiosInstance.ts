import axios from 'axios'
import { getStoredToken } from '@/shared/auth/tokenStorage'
import { API_BASE_URL } from '@/shared/config/api'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
