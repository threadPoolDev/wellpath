import { View, Text, TouchableOpacity, Linking } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Haptics from 'expo-haptics'
import { mobileAuthApi } from '../../../../features/auth/api'
import { ONBOARDING_STRINGS } from '../../constants/onboarding.constants'

interface CalendarConnectAnswerProps {
  value: string | undefined   // 'google' | 'microsoft' | 'skipped'
  onChange: (value: string) => void
}

export function CalendarConnectAnswer({ value, onChange }: CalendarConnectAnswerProps) {
  async function connectProvider(provider: 'google' | 'microsoft') {
    Haptics.selectionAsync()
    // Calendar OAuth uses the same mobile flow as auth OAuth
    const url = mobileAuthApi.getOAuthUrl(provider).replace('/auth/', '/calendar/connect/')
    await WebBrowser.openBrowserAsync(url)
    // Mark as attempted — Settings will show full connection status
    onChange(provider)
  }

  function skip() {
    Haptics.selectionAsync()
    onChange('skipped')
  }

  const connected = value && value !== 'skipped'

  return (
    <View className="mt-2 gap-3">
      <TouchableOpacity
        className={`rounded-xl px-5 py-4 border flex-row items-center ${
          value === 'google' ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}
        onPress={() => connectProvider('google')}
        accessibilityRole="button"
        accessibilityLabel="Connect Google Calendar"
      >
        <Text className="text-xl mr-3">📅</Text>
        <View className="flex-1">
          <Text className={`font-semibold text-base ${value === 'google' ? 'text-white' : 'text-stone-800'}`}>
            Google Calendar
          </Text>
          {value === 'google' && (
            <Text className="text-stone-300 text-sm">Connected ✓</Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className={`rounded-xl px-5 py-4 border flex-row items-center ${
          value === 'microsoft' ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}
        onPress={() => connectProvider('microsoft')}
        accessibilityRole="button"
        accessibilityLabel="Connect Microsoft Calendar"
      >
        <Text className="text-xl mr-3">📆</Text>
        <View className="flex-1">
          <Text className={`font-semibold text-base ${value === 'microsoft' ? 'text-white' : 'text-stone-800'}`}>
            Microsoft / Outlook
          </Text>
          {value === 'microsoft' && (
            <Text className="text-stone-300 text-sm">Connected ✓</Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className={`rounded-xl px-5 py-3 border items-center ${
          value === 'skipped' ? 'border-stone-300' : 'border-transparent'
        }`}
        onPress={skip}
        accessibilityRole="button"
        accessibilityLabel="Skip calendar connection"
      >
        <Text className="text-stone-400 text-sm">{ONBOARDING_STRINGS.CALENDAR_SKIP}</Text>
      </TouchableOpacity>
    </View>
  )
}
