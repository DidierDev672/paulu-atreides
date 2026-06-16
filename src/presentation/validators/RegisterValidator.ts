import type { RegisterDto } from '@/application/dtos/RegisterDto'
import type { IRegisterValidator, RegisterValidationResult } from './IRegisterValidator'

const REQUIRED_FIELDS: ReadonlyArray<{ key: keyof RegisterDto; message: string }> = [
  { key: 'fullName', message: 'El nombre completo es obligatorio.' },
  { key: 'phoneNumber', message: 'El número de teléfono es obligatorio.' },
  { key: 'idNumber', message: 'El número de identificación es obligatorio.' },
  { key: 'dateOfBirth', message: 'La fecha de nacimiento es obligatoria.' },
  { key: 'email', message: 'El correo electrónico es obligatorio.' },
  { key: 'password', message: 'La contraseña es obligatoria.' },
]

export class RegisterValidator implements IRegisterValidator {
  validate(dto: RegisterDto): RegisterValidationResult {
    for (const { key, message } of REQUIRED_FIELDS) {
      if (this.isEmpty(dto[key])) {
        return { isValid: false, error: message }
      }
    }

    return { isValid: true, error: null }
  }

  private isEmpty(value: string | null | undefined): boolean {
    return value === null || value === undefined || value.trim() === ''
  }
}

export const registerValidator = new RegisterValidator()
