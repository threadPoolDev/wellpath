import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authRepository } from './auth.repository.js'
import { ConflictError, UnauthorizedError, ValidationError } from '../../lib/errors.js'
import type { RegisterDto, LoginDto, OAuthProfileDto, AuthUserResponse } from './auth.types.js'
import type { IUser } from '../user/user.model.js'

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'ymail.com',
  'mail.com',
  'gmx.com',
  'zoho.com',
  'rediffmail.com',
])

function detectWorkEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return !!domain && !FREE_EMAIL_DOMAINS.has(domain)
}

function generateToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn']
  return jwt.sign({ userId, email }, secret, { expiresIn })
}

function formatUser(user: IUser): AuthUserResponse {
  return {
    id: (user._id as { toString(): string }).toString(),
    email: user.email,
    name: user.name,
    onboardingComplete: user.onboardingComplete,
    profilePhoto: user.profilePhoto
      ? { url: user.profilePhoto.url, thumbnailUrl: user.profilePhoto.thumbnailUrl }
      : null,
  }
}

export const authService = {
  async register(dto: RegisterDto): Promise<{ user: AuthUserResponse; token: string }> {
    if (!dto.name?.trim()) throw new ValidationError('Name is required')
    if (!dto.email?.trim()) throw new ValidationError('Email is required')
    if (!dto.password || dto.password.length < 8)
      throw new ValidationError('Password must be at least 8 characters')

    const existing = await authRepository.findByEmail(dto.email)
    if (existing) throw new ConflictError('An account with this email already exists')

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const isWorkEmail = detectWorkEmail(dto.email)

    const user = await authRepository.createEmailUser({ ...dto, passwordHash, isWorkEmail })
    const token = generateToken(
      (user._id as { toString(): string }).toString(),
      user.email
    )

    return { user: formatUser(user), token }
  },

  async login(dto: LoginDto): Promise<{ user: AuthUserResponse; token: string }> {
    const user = await authRepository.findByEmail(dto.email)

    const isValid = user?.passwordHash
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false

    if (!isValid) {
      throw new UnauthorizedError(
        "We couldn't find an account with those details. Double-check and try again."
      )
    }

    const token = generateToken(
      (user!._id as { toString(): string }).toString(),
      user!.email
    )

    return { user: formatUser(user!), token }
  },

  async handleOAuthUser(dto: OAuthProfileDto): Promise<{ userId: string; email: string; onboardingComplete: boolean }> {
    if (!dto.email) throw new ValidationError('OAuth account has no email address')

    const isWorkEmail = detectWorkEmail(dto.email)
    const user = await authRepository.findOrCreateOAuthUser({ ...dto, isWorkEmail })

    return {
      userId: (user._id as { toString(): string }).toString(),
      email: user.email,
      onboardingComplete: user.onboardingComplete,
    }
  },

  async getById(userId: string): Promise<AuthUserResponse> {
    const user = await authRepository.findById(userId)
    if (!user) throw new UnauthorizedError()
    return formatUser(user)
  },

  generateToken,
}
