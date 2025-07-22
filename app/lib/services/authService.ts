import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { RegisterDto, RegisterSchema } from '@/lib/dto/auth/register.dto'
import { LoginDto, LoginSchema } from '@/lib/dto/auth/login.dto'
import { UserRepository } from '@/lib/repositories/userRepository'
import { ConflictException, UnauthorizedException, ValidationError } from '@/lib/errors'
import { config } from '@/lib/config'
import type { User } from '@prisma/client'

export interface AuthTokenPayload {
  userId: number
  email: string
  username: string
  role: string
}

export interface AuthResponse {
  user: {
    id: number
    email: string
    username: string
    role: string
    level: number
    experience: number
  }
  token: string
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(data: RegisterDto): Promise<AuthResponse> {
    // 1. 입력값 검증
    const validated = RegisterSchema.parse(data)

    // 2. 이메일 중복 확인 (이메일이 제공된 경우에만)
    if (validated.email && validated.email !== '') {
      const existingEmailUser = await this.userRepository.findByEmail(validated.email)
      if (existingEmailUser) {
        throw new ConflictException('이미 사용 중인 이메일입니다')
      }
    }

    // 3. 사용자명 중복 확인
    const existingUsernameUser = await this.userRepository.findByUsername(validated.username)
    if (existingUsernameUser) {
      throw new ConflictException('이미 사용 중인 사용자명입니다')
    }

    // 4. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // 5. 사용자 생성
    const user = await this.userRepository.create({
      email: validated.email || undefined,
      username: validated.username,
      passwordHash: hashedPassword
    })

    // 6. JWT 토큰 생성
    const token = this.generateToken(user)

    return {
      user: this.formatUser(user),
      token
    }
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    // 1. 입력값 검증
    const validated = LoginSchema.parse(data)

    // 2. 사용자 조회 (username으로 조회)
    const user = await this.userRepository.findByUsername(validated.username)
    if (!user) {
      throw new UnauthorizedException('사용자명 또는 비밀번호가 올바르지 않습니다')
    }

    // 3. 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(validated.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('사용자명 또는 비밀번호가 올바르지 않습니다')
    }

    // 4. 계정 활성 상태 확인
    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다')
    }

    // 5. 마지막 로그인 시간 업데이트
    await this.userRepository.updateLastLogin(user.id)

    // 6. JWT 토큰 생성
    const token = this.generateToken(user)

    return {
      user: this.formatUser(user),
      token
    }
  }

  async validateToken(token: string): Promise<AuthTokenPayload> {
    try {
      const payload = jwt.verify(token, config.JWT_SECRET!) as AuthTokenPayload
      return payload
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다')
    }
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id)
  }

  private generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    }

    return jwt.sign(payload, config.JWT_SECRET!, {
      expiresIn: '7d'
    })
  }

  private formatUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      level: user.level,
      experience: user.experience
    }
  }
}