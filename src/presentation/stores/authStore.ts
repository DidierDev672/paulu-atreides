import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AuthSession } from '@/domain/entities/AuthSession'
import type { LoginDto } from '@/application/dtos/LoginDto'
import type { RegisterDto } from '@/application/dtos/RegisterDto'
import { container } from '@/infrastructure/di/container'
import type { IRegisterValidator } from '@/presentation/validators/IRegisterValidator'
import { registerValidator } from '@/presentation/validators/RegisterValidator'
import {
  clearStoredSession,
  clearStoredToken,
  getStoredSession,
  setStoredSession,
  setStoredToken,
} from '@/shared/auth/tokenStorage'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<AuthSession | null>(getStoredSession<AuthSession>())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function login(dto: LoginDto): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const authSession = await container.loginUseCase.execute(dto)
      session.value = authSession
      setStoredToken(authSession.token)
      setStoredSession(authSession)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al iniciar sesión.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(
    dto: RegisterDto,
    validator: IRegisterValidator = registerValidator,
  ): Promise<void> {
    isLoading.value = true
    error.value = null

    const validation = validator.validate(dto)
    if (!validation.isValid) {
      error.value = validation.error
      isLoading.value = false
      throw new Error(validation.error ?? 'Datos de registro inválidos.')
    }

    try {
      const authSession = await container.registerUseCase.execute(dto)
      session.value = authSession
      setStoredToken(authSession.token)
      setStoredSession(authSession)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar la cuenta.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  function logout(): void {
    session.value = null
    error.value = null
    clearStoredToken()
    clearStoredSession()
  }

  return {
    session,
    isLoading,
    error,
    login,
    register,
    clearError,
    logout,
  }
})
