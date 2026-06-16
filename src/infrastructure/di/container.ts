import { LoginUseCase } from '@/application/use-cases/LoginUseCase'
import { RegisterUseCase } from '@/application/use-cases/RegisterUseCase'
import { AxiosHttpClient } from '../http/AxiosHttpClient'
import { axiosInstance } from '../http/axiosInstance'
import { AuthRepository } from '../repositories/AuthRepository'

const httpClient = new AxiosHttpClient(axiosInstance)
const authRepository = new AuthRepository(httpClient)

export const container = {
  loginUseCase: new LoginUseCase(authRepository),
  registerUseCase: new RegisterUseCase(authRepository),
} as const
