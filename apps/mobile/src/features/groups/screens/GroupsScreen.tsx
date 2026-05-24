import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SafeScrollView } from '../../../components/SafeScrollView'
import { GroupListItem } from '../components/GroupListItem'
import { MemberActivityCard } from '../components/MemberActivityCard'
import { groupsApi, type Group } from '../api'
import { GROUPS_QUERY_KEYS, GROUPS_STRINGS } from '../constants/groups.constants'
import { useAuthStore } from '../../../store/authStore'

type ScreenView = 'list' | 'detail' | 'create'

export function GroupsScreen() {
  const [activeView, setActiveView] = useState<ScreenView>('list')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  // Group list query
  const groupsQuery = useQuery({
    queryKey: [GROUPS_QUERY_KEYS.LIST],
    queryFn: groupsApi.listGroups,
    staleTime: 60_000,
  })

  // Pending invites query
  const invitesQuery = useQuery({
    queryKey: [GROUPS_QUERY_KEYS.INVITES],
    queryFn: groupsApi.listInvites,
    staleTime: 60_000,
  })

  // Group detail query
  const detailQuery = useQuery({
    queryKey: [GROUPS_QUERY_KEYS.DETAIL, selectedGroupId],
    queryFn: () => groupsApi.getGroup(selectedGroupId!),
    enabled: !!selectedGroupId && activeView === 'detail',
    staleTime: 30_000,
  })

  // Accept / decline invite
  const acceptMutation = useMutation({
    mutationFn: groupsApi.acceptInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEYS.LIST] })
      queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEYS.INVITES] })
    },
  })

  const declineMutation = useMutation({
    mutationFn: groupsApi.declineInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEYS.INVITES] })
    },
  })

  // Leave group
  const leaveMutation = useMutation({
    mutationFn: groupsApi.leaveGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEYS.LIST] })
      setActiveView('list')
      setSelectedGroupId(null)
    },
  })

  function handleSelectGroup(groupId: string) {
    Haptics.selectionAsync()
    setSelectedGroupId(groupId)
    setActiveView('detail')
  }

  function handleLeaveGroup(groupId: string) {
    Alert.alert(GROUPS_STRINGS.LEAVE_CONFIRM, GROUPS_STRINGS.LEAVE_CONFIRM_SUBTEXT, [
      { text: GROUPS_STRINGS.LEAVE_CANCEL, style: 'cancel' },
      {
        text: GROUPS_STRINGS.LEAVE_CONFIRM_CTA,
        style: 'destructive',
        onPress: () => leaveMutation.mutate(groupId),
      },
    ])
  }

  // ─── List View ───────────────────────────────────────────────────────────────

  if (activeView === 'list') {
    const pendingInvites = invitesQuery.data?.filter((i) => i.status === 'pending') ?? []

    return (
      <SafeScrollView className="bg-stone-50">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-stone-900">{GROUPS_STRINGS.TITLE}</Text>
          <Pressable
            onPress={() => setActiveView('create')}
            className="bg-stone-800 rounded-xl px-4 py-2 active:opacity-75"
          >
            <Text className="text-white text-sm font-medium">+ New</Text>
          </Pressable>
        </View>

        {/* Pending invites banner */}
        {pendingInvites.length > 0 && (
          <View className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <Text className="text-sm font-semibold text-amber-800 mb-2">
              📨 {pendingInvites.length} pending {pendingInvites.length === 1 ? 'invite' : 'invites'}
            </Text>
            {pendingInvites.map((invite) => (
              <View key={invite._id} className="mb-3">
                <Text className="text-sm text-stone-700 mb-1.5">
                  <Text className="font-medium">{invite.invitedByName}</Text> invited you to{' '}
                  <Text className="font-medium">{invite.groupName}</Text>
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                      acceptMutation.mutate(invite._id)
                    }}
                    className="flex-1 bg-stone-800 rounded-xl py-2 items-center active:opacity-75"
                  >
                    <Text className="text-white text-sm font-medium">{GROUPS_STRINGS.ACCEPT}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => declineMutation.mutate(invite._id)}
                    className="flex-1 border border-stone-200 rounded-xl py-2 items-center active:opacity-70"
                  >
                    <Text className="text-stone-500 text-sm">{GROUPS_STRINGS.DECLINE}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Groups list */}
        {groupsQuery.isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#44403c" />
          </View>
        ) : groupsQuery.data?.length === 0 ? (
          <View className="items-center px-8 py-12">
            <Text className="text-3xl mb-3">👥</Text>
            <Text className="text-lg font-semibold text-stone-800 text-center mb-2">
              {GROUPS_STRINGS.NO_GROUPS}
            </Text>
            <Text className="text-stone-500 text-sm text-center">
              {GROUPS_STRINGS.NO_GROUPS_SUBTEXT}
            </Text>
            <Pressable
              onPress={() => setActiveView('create')}
              className="mt-6 bg-stone-800 rounded-2xl px-6 py-3 active:opacity-80"
            >
              <Text className="text-white font-medium">{GROUPS_STRINGS.CREATE_GROUP}</Text>
            </Pressable>
          </View>
        ) : (
          <View className="pb-6">
            {groupsQuery.data?.map((group) => (
              <GroupListItem
                key={group._id}
                group={group}
                onPress={() => handleSelectGroup(group._id)}
              />
            ))}
          </View>
        )}
      </SafeScrollView>
    )
  }

  // ─── Detail View ─────────────────────────────────────────────────────────────

  if (activeView === 'detail') {
    const { group, todayActivity } = detailQuery.data ?? {}
    const activeMembers = group?.members.filter((m) => m.status === 'active') ?? []

    return (
      <SafeScrollView className="bg-stone-50">
        {/* Back button */}
        <View className="flex-row items-center px-4 pt-4 pb-2">
          <Pressable
            onPress={() => { setActiveView('list'); setSelectedGroupId(null) }}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Text className="text-stone-500 text-sm">‹ Back</Text>
          </Pressable>
        </View>

        {detailQuery.isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#44403c" />
          </View>
        ) : (
          <>
            {/* Group header */}
            <View className="px-6 pb-4">
              <Text className="text-2xl font-bold text-stone-900 mb-0.5">{group?.name}</Text>
              <Text className="text-stone-400 text-sm">
                {activeMembers.length} {activeMembers.length === 1 ? 'member' : 'members'} · Today
              </Text>
            </View>

            {/* Member activity cards */}
            <Text className="text-xs font-medium text-stone-400 uppercase tracking-wider px-6 mb-2">
              {GROUPS_STRINGS.ACTIVITY_TODAY}
            </Text>

            {activeMembers.map((member) => {
              const activity = todayActivity?.find((a) => a.userId === member.userId)
              return (
                <MemberActivityCard
                  key={member.userId}
                  member={member}
                  activity={activity}
                  isMe={member.userId === user?.id}
                />
              )
            })}

            {/* Invite + Leave */}
            <InviteSection groupId={group?._id ?? ''} />

            <Pressable
              onPress={() => handleLeaveGroup(group?._id ?? '')}
              className="mx-4 mb-8 mt-2 py-3 items-center active:opacity-70"
            >
              <Text className="text-stone-400 text-sm">Leave this group</Text>
            </Pressable>
          </>
        )}
      </SafeScrollView>
    )
  }

  // ─── Create View ─────────────────────────────────────────────────────────────

  return (
    <CreateGroupView
      onBack={() => setActiveView('list')}
      onCreated={() => {
        queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEYS.LIST] })
        setActiveView('list')
      }}
    />
  )
}

// ─── Invite Section ───────────────────────────────────────────────────────────

function InviteSection({ groupId }: { groupId: string }) {
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const queryClient = useQueryClient()

  const inviteMutation = useMutation({
    mutationFn: () => groupsApi.inviteMember(groupId, email.trim()),
    onSuccess: () => {
      setEmail('')
      setShowModal(false)
      queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEYS.DETAIL, groupId] })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
  })

  return (
    <>
      <Pressable
        onPress={() => setShowModal(true)}
        className="mx-4 mb-3 border border-stone-200 rounded-2xl py-3 items-center active:opacity-70"
      >
        <Text className="text-stone-600 text-sm">+ {GROUPS_STRINGS.INVITE_LABEL}</Text>
      </Pressable>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowModal(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
              <Text className="text-lg font-semibold text-stone-900 mb-4">
                {GROUPS_STRINGS.INVITE_LABEL}
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={GROUPS_STRINGS.INVITE_EMAIL_PLACEHOLDER}
                placeholderTextColor="#a8a29e"
                autoCapitalize="none"
                keyboardType="email-address"
                className="border border-stone-200 rounded-xl px-3 py-3 text-sm text-stone-800 mb-4"
              />
              <Pressable
                onPress={() => inviteMutation.mutate()}
                disabled={!email.trim() || inviteMutation.isPending}
                className={`py-3 rounded-2xl items-center ${!email.trim() ? 'bg-stone-200' : 'bg-stone-800 active:opacity-80'}`}
              >
                <Text className={`font-medium ${!email.trim() ? 'text-stone-400' : 'text-white'}`}>
                  {inviteMutation.isPending ? 'Sending…' : 'Send invite'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

// ─── Create Group View ────────────────────────────────────────────────────────

function CreateGroupView({
  onBack,
  onCreated,
}: {
  onBack: () => void
  onCreated: (group: Group) => void
}) {
  const [name, setName] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')

  const createMutation = useMutation({
    mutationFn: () => groupsApi.createGroup(name.trim(), emails),
    onSuccess: (group) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onCreated(group)
    },
  })

  function addEmail() {
    const e = emailInput.trim()
    if (e && !emails.includes(e)) setEmails((prev) => [...prev, e])
    setEmailInput('')
  }

  return (
    <SafeScrollView className="bg-stone-50">
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <Pressable onPress={onBack} className="active:opacity-70">
          <Text className="text-stone-500 text-sm">‹ Back</Text>
        </Pressable>
      </View>

      <View className="px-6 pb-4">
        <Text className="text-2xl font-bold text-stone-900 mb-6">Create a group</Text>

        <Text className="text-sm font-medium text-stone-700 mb-1.5">
          {GROUPS_STRINGS.CREATE_TITLE_LABEL}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={GROUPS_STRINGS.CREATE_TITLE_PLACEHOLDER}
          placeholderTextColor="#a8a29e"
          className="border border-stone-200 rounded-xl px-3 py-3 text-sm text-stone-800 mb-5 bg-white"
        />

        <Text className="text-sm font-medium text-stone-700 mb-1.5">
          {GROUPS_STRINGS.INVITE_EMAILS_LABEL}
        </Text>
        <View className="flex-row gap-2 mb-2">
          <TextInput
            value={emailInput}
            onChangeText={setEmailInput}
            placeholder={GROUPS_STRINGS.INVITE_EMAILS_PLACEHOLDER}
            placeholderTextColor="#a8a29e"
            autoCapitalize="none"
            keyboardType="email-address"
            onSubmitEditing={addEmail}
            className="flex-1 border border-stone-200 rounded-xl px-3 py-3 text-sm text-stone-800 bg-white"
          />
          <Pressable
            onPress={addEmail}
            className="border border-stone-200 rounded-xl px-4 items-center justify-center bg-white active:opacity-70"
          >
            <Text className="text-stone-600 text-sm">{GROUPS_STRINGS.INVITE_ADD}</Text>
          </Pressable>
        </View>

        {emails.length > 0 && (
          <View className="gap-1 mb-4">
            {emails.map((e) => (
              <View key={e} className="flex-row items-center justify-between">
                <Text className="text-sm text-stone-600">{e}</Text>
                <Pressable onPress={() => setEmails((prev) => prev.filter((x) => x !== e))}>
                  <Text className="text-stone-400 text-sm">✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => createMutation.mutate()}
          disabled={!name.trim() || createMutation.isPending}
          className={`mt-4 py-4 rounded-2xl items-center ${!name.trim() ? 'bg-stone-200' : 'bg-stone-800 active:opacity-80'}`}
        >
          <Text className={`font-semibold text-base ${!name.trim() ? 'text-stone-400' : 'text-white'}`}>
            {createMutation.isPending ? 'Creating…' : 'Create group'}
          </Text>
        </Pressable>
      </View>
    </SafeScrollView>
  )
}
