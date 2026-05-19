import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SafeScrollView } from '../../../components/SafeScrollView'
import { useAuthStore } from '../../../store/authStore'
import { settingsApi } from '../api'
import {
  SETTINGS_QUERY_KEYS,
  SETTINGS_STRINGS,
  TRAVEL_MODE_OPTIONS,
} from '../constants/settings.constants'

export function SettingsScreen() {
  const { user, logout } = useAuthStore()
  const queryClient = useQueryClient()
  const [showTravelSheet, setShowTravelSheet] = useState(false)
  const [savedName, setSavedName] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState('')

  const profileQuery = useQuery({
    queryKey: [SETTINGS_QUERY_KEYS.PROFILE],
    queryFn: settingsApi.getProfile,
    staleTime: 2 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData([SETTINGS_QUERY_KEYS.PROFILE], updated)
    },
  })

  const profile = profileQuery.data

  function handleSignOut() {
    Alert.alert(SETTINGS_STRINGS.SIGN_OUT, SETTINGS_STRINGS.SIGN_OUT_CONFIRM, [
      { text: SETTINGS_STRINGS.SIGN_OUT_CANCEL, style: 'cancel' },
      {
        text: SETTINGS_STRINGS.SIGN_OUT,
        style: 'destructive',
        onPress: () => {
          Haptics.selectionAsync()
          logout()
        },
      },
    ])
  }

  function toggleInsights(value: boolean) {
    Haptics.selectionAsync()
    updateMutation.mutate({ insightsEnabled: value })
  }

  function toggleGroupSharing(value: boolean) {
    Haptics.selectionAsync()
    updateMutation.mutate({
      groupSharingDefaults: {
        ...profile?.groupSharingDefaults,
        shareWithGroups: value,
      },
    })
  }

  return (
    <>
      <SafeScrollView className="bg-stone-50">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-stone-900">{SETTINGS_STRINGS.TITLE}</Text>
        </View>

        {/* Account section */}
        <SectionHeader title={SETTINGS_STRINGS.ACCOUNT_SECTION} />
        <View className="mx-4 mb-4 bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <View className="px-4 py-4 border-b border-stone-50">
            <Text className="text-xs text-stone-400 uppercase tracking-wider mb-0.5">Name</Text>
            {savedName ? (
              <Text className="text-sm text-stone-700">{savedName}</Text>
            ) : (
              <Text className="text-sm text-stone-700">{user?.name}</Text>
            )}
          </View>
          <View className="px-4 py-4">
            <Text className="text-xs text-stone-400 uppercase tracking-wider mb-0.5">Email</Text>
            <Text className="text-sm text-stone-700">{user?.email}</Text>
          </View>
        </View>

        {/* Trends section */}
        <SectionHeader title="Trends & Insights" />
        <View className="mx-4 mb-4 bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <ToggleRow
            label="Show Trends tab"
            sublabel="Pattern analysis from your check-ins"
            value={profile?.insightsEnabled ?? true}
            onToggle={toggleInsights}
          />
        </View>

        {/* Sharing section */}
        <SectionHeader title={SETTINGS_STRINGS.SHARING_SECTION} />
        <View className="mx-4 mb-4 bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <ToggleRow
            label="Share with groups"
            sublabel="Master switch — off hides you from all groups"
            value={profile?.groupSharingDefaults?.shareWithGroups ?? true}
            onToggle={toggleGroupSharing}
          />
        </View>

        {/* Travel mode */}
        <SectionHeader title={SETTINGS_STRINGS.TRAVEL_SECTION} />
        <Pressable
          onPress={() => setShowTravelSheet(true)}
          className="mx-4 mb-4 bg-white rounded-2xl border border-stone-100 px-4 py-4 flex-row items-center justify-between active:opacity-75"
        >
          <View className="flex-1">
            <Text className="text-sm font-medium text-stone-700">Activate travel mode</Text>
            <Text className="text-xs text-stone-400 mt-0.5">
              Adapt today's routine when you're away
            </Text>
          </View>
          <Text className="text-stone-300 text-lg ml-2">›</Text>
        </Pressable>

        {/* Sign out */}
        <View className="mx-4 mb-10">
          <Pressable
            onPress={handleSignOut}
            className="bg-stone-100 rounded-2xl py-4 items-center active:opacity-75"
            accessibilityRole="button"
            accessibilityLabel={SETTINGS_STRINGS.SIGN_OUT}
          >
            <Text className="text-stone-700 font-medium">{SETTINGS_STRINGS.SIGN_OUT}</Text>
          </Pressable>
        </View>
      </SafeScrollView>

      {/* Travel Mode Bottom Sheet */}
      {showTravelSheet && (
        <TravelModeSheet onClose={() => setShowTravelSheet(false)} />
      )}
    </>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-medium text-stone-400 uppercase tracking-wider px-6 mb-2">
      {title}
    </Text>
  )
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  sublabel,
  value,
  onToggle,
}: {
  label: string
  sublabel?: string
  value: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <View className="flex-row items-center px-4 py-3.5">
      <View className="flex-1 mr-4">
        <Text className="text-sm font-medium text-stone-700">{label}</Text>
        {sublabel && <Text className="text-xs text-stone-400 mt-0.5">{sublabel}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e7e5e4', true: '#44403c' }}
        thumbColor="#ffffff"
      />
    </View>
  )
}

// ─── Travel Mode Sheet ────────────────────────────────────────────────────────

function TravelModeSheet({ onClose }: { onClose: () => void }) {
  return (
    <View className="absolute inset-0 bg-black/40 justify-end" style={{ zIndex: 50 }}>
      <Pressable className="flex-1" onPress={onClose} />
      <View className="bg-white rounded-t-3xl px-6 pt-6 pb-12">
        <Text className="text-lg font-bold text-stone-900 mb-1">Travel mode</Text>
        <Text className="text-stone-500 text-sm mb-6">
          {SETTINGS_STRINGS.TRAVEL_COMING_SOON_SUBTEXT}
        </Text>

        {TRAVEL_MODE_OPTIONS.map((opt) => (
          <View
            key={opt.value}
            className="flex-row items-center gap-3 py-3 border-b border-stone-50"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-stone-800">{opt.label}</Text>
              <Text className="text-xs text-stone-400 mt-0.5">{opt.description}</Text>
            </View>
            <View className="bg-stone-100 rounded-lg px-2 py-1">
              <Text className="text-xs text-stone-400">Soon</Text>
            </View>
          </View>
        ))}

        <Pressable
          onPress={onClose}
          className="mt-5 py-3 bg-stone-100 rounded-2xl items-center active:opacity-75"
        >
          <Text className="text-stone-600 font-medium">Close</Text>
        </Pressable>
      </View>
    </View>
  )
}
