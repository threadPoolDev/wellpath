// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface OAuthProfileDto {
  providerId: string
  email: string
  name: string
  authProvider: 'google' | 'microsoft'
  accessToken: string
  refreshToken?: string
  avatarUrl?: string
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface AuthUserResponse {
  id: string
  email: string
  name: string
  onboardingComplete: boolean
  profilePhoto: { url: string; thumbnailUrl: string } | null
}
