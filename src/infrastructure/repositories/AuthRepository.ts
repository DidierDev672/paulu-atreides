import type { AuthSession } from '@/domain/entities/AuthSession'
import type { IAuthRepository } from '@/domain/repositories/IAuthRepository'
import type { LoginCredentials } from '@/domain/value-objects/LoginCredentials'
import type { RegisterData } from '@/domain/value-objects/RegisterData'
import type { IHttpClient } from '../http/IHttpClient'

interface AuthApiUser {
  id: string
  name_full: string
  phone: string
  id_number: string
  date_of_birth: string
  email: string
  createdAt?: string
  updatedAt?: string
}

interface AuthApiResponse {
  token: string
  user: AuthApiUser
}

export class AuthRepository implements IAuthRepository {
  private readonly httpClient: IHttpClient

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient
  }

  login(credentials: LoginCredentials): Promise<AuthSession> {
    return this.httpClient
      .request<AuthApiResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
      })
      .then(this.mapToSession)
  }

  register(data: RegisterData): Promise<AuthSession> {
    return this.httpClient
      .request<AuthApiResponse>('/auth/register', {
        method: 'POST',
        body: {
          name_full: data.fullName,
          phone: data.phoneNumber,
          id_number: data.idNumber,
          date_of_birth: data.dateOfBirth,
          email: data.email,
          password: data.password,
        },
      })
      .then(this.mapToSession)
  }

  private mapToSession(response: AuthApiResponse): AuthSession {
    return {
      token: response.token,
      user: {
        id: response.user.id,
        fullName: response.user.name_full,
        phoneNumber: response.user.phone,
        idNumber: response.user.id_number,
        dateOfBirth: response.user.date_of_birth,
        email: response.user.email,
      },
    }
  }
}
