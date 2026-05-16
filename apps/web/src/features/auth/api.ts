import { apiClient } from '../../lib/apiClient'
import type { AuthUser } from '../../store/authStore'
import type { LoginPayload, RegisterPayload } from './types'

interface AuthResponse {
  data: { user: AuthUser }
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await apiClient.post<AuthResponse>('/auth/register', payload)
    return res.data.data.user
  },

  async login(payload: LoginPayload): Promise<AuthUser> {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload)
    return res.data.data.user
  },

  async getMe(): Promise<AuthUser> {
    const res = await apiClient.get<AuthResponse>('/auth/me')
    return res.data.data.user
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  getOAuthUrl(provider: 'google' | 'microsoft'): string {
    const base = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/api$/, '')
    return `${base}/api/auth/${provider}`
  },
}
