import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { router } from 'expo-router'
import { ApiError } from '@wellpath/api-client'
import { mobileAuthApi } from '../api'
import { useAuthStore } from '../../../store/authStore'
import { AUTH_STRINGS } from '../constants/auth.constants'

WebBrowser.maybeCompleteAuthSession()

export function RegisterScreen() {
  const setUser = useAuthStore((s) => s.setUser)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOAuthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRegister() {
    if (!name.trim()) { setError(AUTH_STRINGS.ERROR_NAME_REQUIRED); return }
    if (!email.trim()) { setError(AUTH_STRINGS.ERROR_EMAIL_REQUIRED); return }
    if (!password) { setError(AUTH_STRINGS.ERROR_PASSWORD_REQUIRED); return }

    setError(null)
    setLoading(true)
    try {
      const user = await mobileAuthApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      setUser(user)
      router.replace('/(onboarding)')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('An account with this email already exists.')
      } else {
        setError(AUTH_STRINGS.ERROR_GENERIC)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider: 'google' | 'microsoft') {
    setOAuthLoading(true)
    setError(null)
    try {
      const url = mobileAuthApi.getOAuthUrl(provider)
      const result = await WebBrowser.openAuthSessionAsync(url, 'wellpath://auth/callback')
      if (result.type === 'success' && result.url) {
        const parsed = new URL(result.url)
        const token = parsed.searchParams.get('token')
        if (token) {
          router.replace({ pathname: '/(auth)/callback', params: { token } })
        }
      }
    } catch {
      setError(AUTH_STRINGS.ERROR_GENERIC)
    } finally {
      setOAuthLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-stone-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 px-6 justify-center">
        <Text className="text-3xl font-bold text-stone-900 mb-1">
          {AUTH_STRINGS.REGISTER_TITLE}
        </Text>
        <Text className="text-base text-stone-500 mb-8">
          {AUTH_STRINGS.REGISTER_SUBTITLE}
        </Text>

        {error && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
            <Text className="text-amber-800 text-sm">{error}</Text>
          </View>
        )}

        <TextInput
          className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-stone-900 text-base mb-3"
          placeholder={AUTH_STRINGS.NAME_PLACEHOLDER}
          placeholderTextColor="#a8a29e"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          textContentType="name"
          returnKeyType="next"
        />

        <TextInput
          className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-stone-900 text-base mb-3"
          placeholder={AUTH_STRINGS.EMAIL_PLACEHOLDER}
          placeholderTextColor="#a8a29e"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />

        <TextInput
          className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-stone-900 text-base mb-5"
          placeholder={AUTH_STRINGS.PASSWORD_PLACEHOLDER}
          placeholderTextColor="#a8a29e"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleRegister}
        />

        <TouchableOpacity
          className="bg-stone-800 rounded-xl py-4 items-center mb-4"
          onPress={handleRegister}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={AUTH_STRINGS.REGISTER_BUTTON}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {AUTH_STRINGS.REGISTER_BUTTON}
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-px bg-stone-200" />
          <Text className="text-stone-400 text-sm px-3">or</Text>
          <View className="flex-1 h-px bg-stone-200" />
        </View>

        <TouchableOpacity
          className="bg-white border border-stone-200 rounded-xl py-3.5 items-center mb-3"
          onPress={() => handleOAuth('google')}
          disabled={oauthLoading}
          accessibilityRole="button"
          accessibilityLabel={AUTH_STRINGS.GOOGLE_BUTTON}
        >
          {oauthLoading ? (
            <ActivityIndicator color="#78716c" />
          ) : (
            <Text className="text-stone-800 font-medium text-base">
              {AUTH_STRINGS.GOOGLE_BUTTON}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white border border-stone-200 rounded-xl py-3.5 items-center"
          onPress={() => handleOAuth('microsoft')}
          disabled={oauthLoading}
          accessibilityRole="button"
          accessibilityLabel={AUTH_STRINGS.MICROSOFT_BUTTON}
        >
          <Text className="text-stone-800 font-medium text-base">
            {AUTH_STRINGS.MICROSOFT_BUTTON}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-8">
          <Text className="text-stone-500 text-sm">{AUTH_STRINGS.HAVE_ACCOUNT} </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            accessibilityRole="link"
          >
            <Text className="text-stone-800 font-semibold text-sm">
              {AUTH_STRINGS.SIGN_IN}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
