import type { AuthSession } from '@/domain/entities/AuthSession'
import type { IAuthRepository } from '@/domain/repositories/IAuthRepository'
import type { LoginDto } from '../dtos/LoginDto'

export class LoginUseCase {
  private readonly authRepository: IAuthRepository

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository
  }

  async execute(dto: LoginDto): Promise<AuthSession> {
    const email = dto.email.trim().toLowerCase()

    return this.authRepository.login({ email, password: dto.password })
  }
}
