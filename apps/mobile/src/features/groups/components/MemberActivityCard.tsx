import { View, Text } from 'react-native'
import type { GroupActivity, GroupMember } from '../api'

interface MemberActivityCardProps {
  member: GroupMember
  activity?: GroupActivity
  isMe: boolean
}

export function MemberActivityCard({ member, activity, isMe }: MemberActivityCardProps) {
  const pct = activity?.summary.completionPercentage ?? null
  const perfect = pct === 100

  return (
    <View
      className={`mx-4 mb-3 p-4 rounded-2xl border ${
        isMe ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'
      }`}
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Text className={`text-sm font-semibold ${isMe ? 'text-white' : 'text-stone-900'}`}>
            {member.displayName}
            {isMe ? ' (you)' : ''}
          </Text>
          {perfect && <Text className="text-sm">⭐</Text>}
        </View>
        {pct !== null && (
          <Text className={`text-xs font-medium ${isMe ? 'text-stone-300' : 'text-stone-500'}`}>
            {pct}%
          </Text>
        )}
      </View>

      {/* Completion bar */}
      {pct !== null ? (
        <View className={`h-1.5 rounded-full overflow-hidden ${isMe ? 'bg-stone-600' : 'bg-stone-100'}`}>
          <View
            className={`h-full rounded-full ${perfect ? 'bg-emerald-400' : isMe ? 'bg-stone-300' : 'bg-stone-600'}`}
            style={{ width: `${pct}%` }}
          />
        </View>
      ) : (
        <Text className={`text-xs ${isMe ? 'text-stone-400' : 'text-stone-300'}`}>
          No activity today
        </Text>
      )}

      {/* Task detail — if sharing preference allows */}
      {activity && activity.sharingPreference !== 'completion_only' && (
        <View className="mt-3 gap-1">
          {activity.summary.tasks.map((t, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <Text className="text-xs">
                {t.status === 'done' ? '✓' : '·'}
              </Text>
              <Text
                className={`text-xs flex-1 ${
                  t.status === 'missed'
                    ? isMe ? 'text-stone-400' : 'text-rose-400/70'
                    : isMe ? 'text-stone-300' : 'text-stone-500'
                }`}
              >
                {t.title}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
