import { apiClient } from '../../lib/apiClient'
import { secureStore } from '../../lib/secureStore'
import type { AuthUser } from '@wellpath/types'

// Backend wraps all responses in { success: boolean, data: T }
interface BackendResponse<T> {
  success: boolean
  data: T
}

interface LoginDto {
  email: string
  password: string
}

interface RegisterDto {
  name: string
  email: string
  password: string
}

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001') + '/api'

export const mobileAuthApi = {
  login: async (dto: LoginDto): Promise<AuthUser> => {
    const res = await apiClient.post<BackendResponse<{ user: AuthUser; token: string }>>(
      '/auth/login',
      dto,
    )
    await secureStore.setToken(res.data.token)
    return res.data.user
  },

  register: async (dto: RegisterDto): Promise<AuthUser> => {
    const res = await apiClient.post<BackendResponse<{ user: AuthUser; token: string }>>(
      '/auth/register',
      dto,
    )
    await secureStore.setToken(res.data.token)
    return res.data.user
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await apiClient.get<BackendResponse<{ user: AuthUser }>>('/auth/me')
    return res.data.user
  },

  logout: async (): Promise<void> => {
    await secureStore.clearToken()
  },

  getOAuthUrl: (provider: 'google' | 'microsoft'): string =>
    `${API_BASE.replace(/\/api$/, '')}/api/auth/${provider}?mobile=true`,
}
