import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'wellpath_auth_token'

export const secureStore = {
  getToken: (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string): Promise<void> => SecureStore.setItemAsync(TOKEN_KEY, token),
  clearToken: (): Promise<void> => SecureStore.deleteItemAsync(TOKEN_KEY),
}
