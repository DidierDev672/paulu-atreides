import type { AuthSession } from '../entities/AuthSession'
import type { LoginCredentials } from '../value-objects/LoginCredentials'
import type { RegisterData } from '../value-objects/RegisterData'

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>
  register(data: RegisterData): Promise<AuthSession>
}
