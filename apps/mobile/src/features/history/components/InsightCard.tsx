import { View, Text, Pressable } from 'react-native'
import { INSIGHT_TYPE_ICONS } from '../constants/history.constants'
import type { InsightCard as InsightCardType } from '../api'

interface InsightCardProps {
  insight: InsightCardType
  onDismiss: (id: string) => void
}

export function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const icon = INSIGHT_TYPE_ICONS[insight.type] ?? '💡'

  return (
    <View className="bg-white rounded-2xl border border-stone-100 p-4 mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-1">
          <Text className="text-lg">{icon}</Text>
          <Text className="text-xs font-medium text-stone-400 uppercase tracking-wider flex-1">
            {insight.title}
          </Text>
        </View>
        <Pressable
          onPress={() => onDismiss(insight.id)}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          className="active:opacity-50"
        >
          <Text className="text-stone-300 text-base">✕</Text>
        </Pressable>
      </View>

      <Text className="text-sm text-stone-700 leading-5">{insight.body}</Text>
    </View>
  )
}
