import { View, Text } from 'react-native'
import { DAY_TYPE_LABELS, DASHBOARD_STRINGS } from '../constants/dashboard.constants'
import { useAuthStore } from '../../../store/authStore'

interface DayBannerProps {
  dayType?: 'light' | 'moderate' | 'packed'
  date?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return DASHBOARD_STRINGS.GOOD_MORNING
  if (hour < 17) return DASHBOARD_STRINGS.GOOD_AFTERNOON
  return DASHBOARD_STRINGS.GOOD_EVENING
}

function formatDate(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date()
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const DAY_TYPE_BG: Record<string, string> = {
  light: 'bg-emerald-50',
  moderate: 'bg-amber-50',
  packed: 'bg-rose-50',
}

const DAY_TYPE_TEXT: Record<string, string> = {
  light: 'text-emerald-700',
  moderate: 'text-amber-700',
  packed: 'text-rose-700',
}

export function DayBanner({ dayType, date }: DayBannerProps) {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <View className="px-6 pt-6 pb-3">
      <Text className="text-2xl font-bold text-stone-900 mb-0.5">
        {getGreeting()}, {firstName} 👋
      </Text>
      <View className="flex-row items-center gap-2 mt-1">
        <Text className="text-stone-500 text-sm">{formatDate(date)}</Text>
        {dayType && (
          <View className={`px-2 py-0.5 rounded-full ${DAY_TYPE_BG[dayType]}`}>
            <Text className={`text-xs font-medium ${DAY_TYPE_TEXT[dayType]}`}>
              {DAY_TYPE_LABELS[dayType]}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
