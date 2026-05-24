import { useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery } from '@tanstack/react-query'
import { SafeScrollView } from '../../../components/SafeScrollView'
import { MoodGraph } from '../components/MoodGraph'
import { InsightCard } from '../components/InsightCard'
import { historyApi } from '../api'
import {
  HISTORY_QUERY_KEYS,
  HISTORY_STRINGS,
  HISTORY_TABS,
  type HistoryTab,
} from '../constants/history.constants'

const DISMISSED_INSIGHTS_KEY = 'wellpath_dismissed_insights'

async function getDismissed(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(DISMISSED_INSIGHTS_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

async function saveDismissed(ids: Set<string>): Promise<void> {
  await AsyncStorage.setItem(DISMISSED_INSIGHTS_KEY, JSON.stringify(Array.from(ids)))
}

export function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('insights')
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  // Load dismissed on mount
  useState(() => {
    getDismissed().then(setDismissedIds)
  })

  const moodGraphQuery = useQuery({
    queryKey: [HISTORY_QUERY_KEYS.MOOD_GRAPH],
    queryFn: historyApi.getMoodGraph,
    staleTime: 5 * 60 * 1000,
  })

  const insightsQuery = useQuery({
    queryKey: [HISTORY_QUERY_KEYS.INSIGHTS],
    queryFn: historyApi.getInsights,
    staleTime: 5 * 60 * 1000,
  })

  async function handleDismiss(id: string) {
    const next = new Set(dismissedIds).add(id)
    setDismissedIds(next)
    await saveDismissed(next)
  }

  const visibleInsights = (insightsQuery.data?.insights ?? []).filter(
    (ins) => !dismissedIds.has(ins.id),
  )

  return (
    <SafeScrollView className="bg-stone-50">
      {/* Header */}
      <View className="px-6 pt-6 pb-2">
        <Text className="text-2xl font-bold text-stone-900">{HISTORY_STRINGS.TITLE}</Text>
      </View>

      {/* Streak teaser */}
      <View className="mx-4 mb-4 mt-2 bg-white rounded-2xl border border-stone-100 p-4">
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl">🔥</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-stone-700">
              {HISTORY_STRINGS.STREAK_COMING_SOON}
            </Text>
            <Text className="text-xs text-stone-400 mt-0.5">
              {HISTORY_STRINGS.STREAK_COMING_SOON_SUBTEXT}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mb-4 gap-1">
        {HISTORY_TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl items-center ${
              activeTab === tab ? 'bg-stone-800' : 'bg-stone-100'
            } active:opacity-75`}
          >
            <Text
              className={`text-sm font-medium ${activeTab === tab ? 'text-white' : 'text-stone-500'}`}
            >
              {tab === 'insights' ? HISTORY_STRINGS.TAB_INSIGHTS : HISTORY_STRINGS.TAB_PAST}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Insights tab */}
      {activeTab === 'insights' && (
        <View className="pb-6">
          {/* Mood graph */}
          {moodGraphQuery.isLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator color="#44403c" />
            </View>
          ) : (
            moodGraphQuery.data && moodGraphQuery.data.length > 0 && (
              <MoodGraph data={moodGraphQuery.data} />
            )
          )}

          {/* Insights disabled */}
          {insightsQuery.data?.disabled && (
            <View className="mx-4 items-center py-8">
              <Text className="text-stone-700 font-medium text-center mb-1">
                {HISTORY_STRINGS.INSIGHTS_DISABLED}
              </Text>
              <Text className="text-stone-400 text-sm text-center">
                {HISTORY_STRINGS.INSIGHTS_DISABLED_SUBTEXT}
              </Text>
            </View>
          )}

          {/* No insights yet */}
          {!insightsQuery.isLoading &&
            !insightsQuery.data?.disabled &&
            visibleInsights.length === 0 && (
              <View className="mx-4 bg-white rounded-2xl border border-stone-100 p-6 items-center">
                <Text className="text-3xl mb-3">🌱</Text>
                <Text className="text-base font-semibold text-stone-700 text-center mb-1">
                  {HISTORY_STRINGS.NO_INSIGHTS}
                </Text>
                <Text className="text-sm text-stone-400 text-center">
                  {HISTORY_STRINGS.NO_INSIGHTS_SUBTEXT}
                </Text>
              </View>
            )}

          {/* Insight cards */}
          {insightsQuery.isLoading ? (
            <>
              <InsightCardSkeleton />
              <InsightCardSkeleton />
            </>
          ) : (
            <View className="mx-4">
              {visibleInsights.map((ins) => (
                <InsightCard key={ins.id} insight={ins} onDismiss={handleDismiss} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Past routines tab */}
      {activeTab === 'past' && (
        <View className="pb-6 items-center px-8 py-12">
          <Text className="text-3xl mb-3">📅</Text>
          <Text className="text-lg font-semibold text-stone-800 text-center mb-2">
            {HISTORY_STRINGS.NO_PAST}
          </Text>
          <Text className="text-stone-400 text-sm text-center">{HISTORY_STRINGS.NO_PAST_SUBTEXT}</Text>
        </View>
      )}
    </SafeScrollView>
  )
}

function InsightCardSkeleton() {
  return (
    <View className="mx-4 mb-3 bg-stone-100 rounded-2xl h-20 animate-pulse" />
  )
}
