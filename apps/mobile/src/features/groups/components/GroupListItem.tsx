import { View, Text, Pressable } from 'react-native'
import type { Group } from '../api'

interface GroupListItemProps {
  group: Group
  onPress: () => void
}

function groupInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function avatarBg(name: string): string {
  const colors = [
    'bg-stone-700', 'bg-amber-600', 'bg-emerald-600',
    'bg-sky-600', 'bg-violet-600', 'bg-rose-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function GroupListItem({ group, onPress }: GroupListItemProps) {
  const activeCount = group.members.filter((m) => m.status === 'active').length

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 mx-4 mb-3 p-4 bg-white rounded-2xl border border-stone-100 active:opacity-75"
    >
      {/* Avatar */}
      <View className={`w-10 h-10 rounded-full ${avatarBg(group.name)} items-center justify-center`}>
        <Text className="text-white text-sm font-bold">{groupInitials(group.name)}</Text>
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-stone-900">{group.name}</Text>
        <Text className="text-xs text-stone-400">
          {activeCount} {activeCount === 1 ? 'member' : 'members'}
        </Text>
      </View>

      <Text className="text-stone-300 text-lg">›</Text>
    </Pressable>
  )
}
