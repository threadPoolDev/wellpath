import { User } from '../user/user.model.js'
import type { IUser } from '../user/user.model.js'
import type { RegisterDto, OAuthProfileDto } from './auth.types.js'

export const authRepository = {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase().trim() })
  },

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id)
  },

  async createEmailUser(
    dto: RegisterDto & { passwordHash: string; isWorkEmail: boolean }
  ): Promise<IUser> {
    return User.create({
      email: dto.email.toLowerCase().trim(),
      name: dto.name.trim(),
      passwordHash: dto.passwordHash,
      authProvider: 'email',
      isWorkEmail: dto.isWorkEmail,
    })
  },

  async findOrCreateOAuthUser(dto: OAuthProfileDto & { isWorkEmail: boolean }): Promise<IUser> {
    const existing = await User.findOne({ email: dto.email.toLowerCase().trim() })
    if (existing) return existing

    return User.create({
      email: dto.email.toLowerCase().trim(),
      name: dto.name,
      passwordHash: null,
      authProvider: dto.authProvider,
      isWorkEmail: dto.isWorkEmail,
      ...(dto.avatarUrl
        ? {
            profilePhoto: {
              url: dto.avatarUrl,
              thumbnailUrl: dto.avatarUrl,
              publicId: '',
              uploadedAt: new Date(),
            },
          }
        : {}),
    })
  },
}
