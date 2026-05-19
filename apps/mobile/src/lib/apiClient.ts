import { createApiClient } from '@wellpath/api-client'
import { secureStore } from './secureStore'

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001') + '/api'

export const apiClient = createApiClient({
  baseUrl: BASE_URL,
  getToken: () => secureStore.getToken(),
})
