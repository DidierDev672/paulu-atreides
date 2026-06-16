import type { AppAlertVariant } from '@/presentation/components/ui/appAlert.types'

export interface AuthAlertMessage {
  variant: AppAlertVariant
  headline: string
  body: string
  actionLabel?: string
  secondaryActionLabel?: string
  action?: 'dismiss' | 'go-to-register' | 'go-to-login'
  secondaryAction?: 'dismiss' | 'go-to-register' | 'go-to-login'
}

const INVALID_CREDENTIALS_PATTERN =
  /credencial|contraseña|password|unauthorized|invalid|incorrect|no coincide|not found|401/i

const EMAIL_EXISTS_PATTERN =
  /ya existe|ya está|already|registrad|duplicate|conflict|409|en uso|taken/i

const VALIDATION_PATTERN =
  /obligatorio|válido|debe|mínimo|numérico|inválid|required|invalid|must/i

const SERVER_ERROR_PATTERN =
  /servidor|server|timeout|network|conexión|connection|500|502|503|procesar la solicitud/i

function matches(pattern: RegExp, message: string): boolean {
  return pattern.test(message)
}

export function resolveLoginAlertMessage(rawError: string | null): AuthAlertMessage | null {
  if (!rawError) return null

  if (matches(INVALID_CREDENTIALS_PATTERN, rawError)) {
    return {
      variant: 'error',
      headline: 'No pudimos iniciar sesión',
      body: 'El correo o la contraseña no coinciden — revisa ambos e inténtalo otra vez.',
      actionLabel: 'Revisar datos',
      secondaryActionLabel: 'Crear cuenta',
      action: 'dismiss',
      secondaryAction: 'go-to-register',
    }
  }

  if (matches(SERVER_ERROR_PATTERN, rawError)) {
    return {
      variant: 'warning',
      headline: 'Algo no funcionó como esperábamos',
      body: 'Nuestro servidor no respondió a tiempo — espera un momento e inténtalo de nuevo.',
      actionLabel: 'Reintentar',
      action: 'dismiss',
    }
  }

  return {
    variant: 'error',
    headline: 'No pudimos iniciar sesión',
    body: 'Ocurrió un problema inesperado — revisa tus datos e inténtalo de nuevo.',
    actionLabel: 'Intentar de nuevo',
    action: 'dismiss',
  }
}

export function resolveRegisterAlertMessage(rawError: string | null): AuthAlertMessage | null {
  if (!rawError) return null

  if (matches(EMAIL_EXISTS_PATTERN, rawError)) {
    return {
      variant: 'warning',
      headline: 'Este correo ya está registrado',
      body: 'Ya existe una cuenta con ese correo — inicia sesión o usa otro correo.',
      actionLabel: 'Iniciar sesión',
      secondaryActionLabel: 'Usar otro correo',
      action: 'go-to-login',
      secondaryAction: 'dismiss',
    }
  }

  if (matches(VALIDATION_PATTERN, rawError)) {
    return {
      variant: 'info',
      headline: 'Faltan datos por completar',
      body: 'Algunos campos obligatorios están vacíos o son incorrectos — revísalos antes de continuar.',
      actionLabel: 'Revisar formulario',
      action: 'dismiss',
    }
  }

  if (matches(SERVER_ERROR_PATTERN, rawError)) {
    return {
      variant: 'warning',
      headline: 'No pudimos crear tu cuenta',
      body: 'Ocurrió un problema temporal del lado nuestro — inténtalo de nuevo en unos segundos.',
      actionLabel: 'Reintentar',
      action: 'dismiss',
    }
  }

  return {
    variant: 'error',
    headline: 'No pudimos crear tu cuenta',
    body: 'Algo salió mal al registrar tus datos — revisa la información e inténtalo otra vez.',
    actionLabel: 'Intentar de nuevo',
    action: 'dismiss',
  }
}
