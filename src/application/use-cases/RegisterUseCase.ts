import type { AuthSession } from '@/domain/entities/AuthSession'
import type { IAuthRepository } from '@/domain/repositories/IAuthRepository'
import type { RegisterDto } from '../dtos/RegisterDto'

export class RegisterUseCase {
  private readonly authRepository: IAuthRepository

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository
  }

  async execute(dto: RegisterDto): Promise<AuthSession> {
    const fullName = dto.fullName.trim()
    const phoneNumber = dto.phoneNumber.trim()
    const idNumber = dto.idNumber.trim()
    const email = dto.email.trim().toLowerCase()

    this.validate(fullName, phoneNumber, idNumber, email, dto.password, dto.dateOfBirth)

    return this.authRepository.register({
      fullName,
      phoneNumber,
      idNumber,
      dateOfBirth: dto.dateOfBirth,
      email,
      password: dto.password,
    })
  }

  private validate(
    fullName: string,
    phoneNumber: string,
    idNumber: string,
    email: string,
    password: string,
    dateOfBirth: string,
  ): void {
    if (!fullName) throw new Error('El nombre completo es obligatorio.')
    if (!phoneNumber) throw new Error('El número de teléfono es obligatorio.')
    if (!/^\d+$/.test(idNumber)) throw new Error('El número de identificación debe ser numérico.')
    if (!dateOfBirth) throw new Error('La fecha de nacimiento es obligatoria.')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Ingresa un correo electrónico válido.')
    }
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres.')
    }
  }
}
