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
  const raw = getStoredToken()

  if (raw) {
    const cleaned = raw.trim().replace(/[\r\n]/g, '')
    if (cleaned) {
      config.headers.Authorization = `Bearer ${cleaned}`
    }
  }

  return config
})
