import { View, Text, ScrollView } from 'react-native'
import { ENERGY_DOT_HEIGHT, HISTORY_STRINGS } from '../constants/history.constants'
import type { MoodGraphPoint } from '../api'

interface MoodGraphProps {
  data: MoodGraphPoint[]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function MoodGraph({ data }: MoodGraphProps) {
  if (!data || data.length === 0) return null

  const maxEnergy = 3
  const maxCompletion = 100

  return (
    <View className="mx-4 mb-4 bg-white rounded-2xl border border-stone-100 p-4">
      <Text className="text-sm font-semibold text-stone-700 mb-4">Energy & Completion</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          {data.map((point, i) => {
            const energyH =
              point.energyLevel !== null
                ? (point.energyLevel / maxEnergy) * ENERGY_DOT_HEIGHT
                : 0
            const completionH =
              point.completionPercentage !== null
                ? (point.completionPercentage / maxCompletion) * ENERGY_DOT_HEIGHT
                : 0

            return (
              <View key={i} style={{ alignItems: 'center', width: 36 }}>
                {/* Bars */}
                <View
                  style={{
                    height: ENERGY_DOT_HEIGHT,
                    width: 36,
                    justifyContent: 'flex-end',
                    position: 'relative',
                  }}
                >
                  {/* Completion bar (amber, behind) */}
                  {completionH > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: completionH,
                        backgroundColor: '#fbbf24',
                        opacity: 0.3,
                        borderRadius: 4,
                      }}
                    />
                  )}
                  {/* Energy bar (sage green, front) */}
                  {energyH > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 6,
                        right: 6,
                        height: energyH,
                        backgroundColor: '#44403c',
                        borderRadius: 4,
                        opacity: 0.9,
                      }}
                    />
                  )}
                  {/* No data */}
                  {energyH === 0 && completionH === 0 && (
                    <View
                      style={{
                        height: 4,
                        backgroundColor: '#e7e5e4',
                        borderRadius: 2,
                        marginBottom: 0,
                      }}
                    />
                  )}
                </View>

                {/* Date label */}
                <Text
                  style={{
                    fontSize: 9,
                    color: '#a8a29e',
                    marginTop: 4,
                    textAlign: 'center',
                  }}
                >
                  {formatDate(point.date)}
                </Text>
              </View>
            )
          })}
        </View>
      </ScrollView>

      {/* Legend */}
      <View className="flex-row gap-4 mt-3">
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-sm bg-stone-700 opacity-90" />
          <Text className="text-xs text-stone-400">Energy</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-sm bg-amber-400 opacity-40" />
          <Text className="text-xs text-stone-400">Completion</Text>
        </View>
      </View>

      <Text className="text-xs text-stone-400 mt-2 italic">{HISTORY_STRINGS.MOOD_GRAPH_CAPTION}</Text>
    </View>
  )
}
