import type { LoginDto } from '@/application/dtos/LoginDto'

export interface LoginFieldErrors {
  email: string | null
  password: string | null
}

export interface LoginValidationResult {
  isValid: boolean
  errors: LoginFieldErrors
}

export interface ILoginValidator {
  validate(dto: LoginDto): LoginValidationResult
}
