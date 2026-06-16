import type { RegisterDto } from '@/application/dtos/RegisterDto'

export interface RegisterValidationResult {
  isValid: boolean
  error: string | null
}

export interface IRegisterValidator {
  validate(dto: RegisterDto): RegisterValidationResult
}
