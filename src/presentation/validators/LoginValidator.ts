import type { LoginDto } from '@/application/dtos/LoginDto'
import type { ILoginValidator, LoginValidationResult } from './ILoginValidator'

const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/
const PASSWORD_LOWERCASE_REGEX = /[a-z]/
const PASSWORD_NUMBER_REGEX = /\d/
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/

export class LoginValidator implements ILoginValidator {
  validate(dto: LoginDto): LoginValidationResult {
    const emailError = this.validateEmail(dto.email)
    const passwordError = this.validatePassword(dto.password)

    return {
      isValid: !emailError && !passwordError,
      errors: {
        email: emailError,
        password: passwordError,
      },
    }
  }

  private validateEmail(email: string): string | null {
    if (!email.trim()) {
      return 'El correo electrónico es obligatorio.'
    }

    if (/\s/.test(email)) {
      return 'El correo no debe contener espacios.'
    }

    if (!EMAIL_FORMAT_REGEX.test(email)) {
      return 'Ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).'
    }

    return null
  }

  private validatePassword(password: string): string | null {
    if (!password) {
      return 'La contraseña es obligatoria.'
    }

    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
      return 'La contraseña debe incluir al menos una letra mayúscula.'
    }

    if (!PASSWORD_LOWERCASE_REGEX.test(password)) {
      return 'La contraseña debe incluir al menos una letra minúscula.'
    }

    if (!PASSWORD_NUMBER_REGEX.test(password)) {
      return 'La contraseña debe incluir al menos un número.'
    }

    if (!PASSWORD_SPECIAL_REGEX.test(password)) {
      return 'La contraseña debe incluir al menos un carácter especial (!, @, #, $, etc.).'
    }

    return null
  }
}

export const loginValidator = new LoginValidator()
