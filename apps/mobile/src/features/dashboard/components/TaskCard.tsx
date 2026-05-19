import { useState } from 'react'
import { View, Text, Pressable, TextInput, Modal } from 'react-native'
import * as Haptics from 'expo-haptics'
import {
  CATEGORY_ICONS,
  TASK_STATUS_COLORS,
  DASHBOARD_STRINGS,
} from '../constants/dashboard.constants'
import type { RoutineTask } from '../api'

interface TaskCardProps {
  task: RoutineTask
  routineId: string
  onUpdateStatus: (taskId: string, status: 'done' | 'missed' | 'skipped', opts?: { missedReason?: string; didInstead?: string }) => void
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h} hr ${m} min` : `${h} hr`
  }
  return `${minutes} min`
}

function isTaskActionable(taskTime: string): boolean {
  const [taskH, taskM] = taskTime.split(':').map(Number)
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const taskMinutes = taskH * 60 + taskM
  return nowMinutes >= taskMinutes
}

const isMedicineTask = (category: string) => category === 'medicine'

export function TaskCard({ task, onUpdateStatus }: TaskCardProps) {
  const [missedModalVisible, setMissedModalVisible] = useState(false)
  const [missedReason, setMissedReason] = useState('')
  const [didInstead, setDidInstead] = useState('')

  const actionable = isTaskActionable(task.time)
  const medicine = isMedicineTask(task.category)
  const icon = CATEGORY_ICONS[task.category] ?? '📌'

  function handleDone() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onUpdateStatus(task._id, 'done')
  }

  function handleMissedPress() {
    Haptics.selectionAsync()
    setMissedModalVisible(true)
  }

  function handleMissedSubmit() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    onUpdateStatus(task._id, 'missed', {
      missedReason: missedReason.trim() || undefined,
      didInstead: didInstead.trim() || undefined,
    })
    setMissedModalVisible(false)
    setMissedReason('')
    setDidInstead('')
  }

  function handleSkip() {
    Haptics.selectionAsync()
    onUpdateStatus(task._id, 'skipped')
  }

  const statusDone = task.status === 'done'
  const statusMissed = task.status === 'missed'
  const statusSkipped = task.status === 'skipped'
  const settled = statusDone || statusMissed || statusSkipped

  return (
    <>
      <View
        className={`mx-4 mb-3 rounded-2xl border ${
          settled ? 'bg-stone-50 border-stone-100' : 'bg-white border-stone-200'
        }`}
        style={{ opacity: statusMissed || statusSkipped ? 0.65 : 1 }}
      >
        <View className="p-4">
          {/* Header row */}
          <View className="flex-row items-start justify-between mb-1">
            <View className="flex-row items-center gap-1.5 flex-1">
              <Text className="text-base">{icon}</Text>
              <Text
                className={`text-base font-semibold flex-1 ${
                  settled ? 'text-stone-400' : 'text-stone-900'
                }`}
                style={{ textDecorationLine: statusDone ? 'line-through' : 'none' }}
              >
                {task.title}
              </Text>
            </View>
            {statusDone && <Text className="text-xs text-stone-400 ml-2">✓ Done</Text>}
            {statusMissed && <Text className="text-xs text-rose-400 ml-2">Missed</Text>}
            {statusSkipped && <Text className="text-xs text-stone-400 ml-2">Skipped</Text>}
            {!actionable && !settled && (
              <Text className="text-xs text-stone-400 ml-2">{DASHBOARD_STRINGS.UPCOMING_LABEL}</Text>
            )}
          </View>

          {/* Time + duration */}
          <Text className="text-xs text-stone-400 mb-2">
            {formatTime(task.time)} · {formatDuration(task.durationMinutes)}
          </Text>

          {/* Description */}
          {!settled && (
            <Text className="text-sm text-stone-500 mb-3">{task.description}</Text>
          )}

          {/* Missed reason shown inline */}
          {statusMissed && task.missedReason && (
            <Text className="text-xs text-stone-400 italic mb-2">"{task.missedReason}"</Text>
          )}

          {/* Action buttons */}
          {!settled && actionable && (
            <View className="flex-row gap-2 mt-1">
              <Pressable
                onPress={handleDone}
                className="flex-1 bg-stone-800 rounded-xl py-2.5 items-center active:opacity-80"
              >
                <Text className="text-white text-sm font-medium">✓ Done</Text>
              </Pressable>

              {medicine ? (
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync()
                    // Remind in 10 min — stub: just mark as pending visually
                  }}
                  className="flex-1 border border-stone-200 rounded-xl py-2.5 items-center active:opacity-70"
                >
                  <Text className="text-stone-600 text-sm">Remind in 10 min</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={handleMissedPress}
                    className="border border-stone-200 rounded-xl py-2.5 px-4 items-center active:opacity-70"
                  >
                    <Text className="text-stone-500 text-sm">Missed</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSkip}
                    className="border border-stone-200 rounded-xl py-2.5 px-4 items-center active:opacity-70"
                  >
                    <Text className="text-stone-400 text-sm">Skip</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Missed reason modal */}
      <Modal
        visible={missedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMissedModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setMissedModalVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
              <Text className="text-lg font-semibold text-stone-900 mb-1">That's okay 🤍</Text>
              <Text className="text-stone-500 text-sm mb-5">
                No pressure — what came up? (optional)
              </Text>

              <Text className="text-xs text-stone-500 mb-1 font-medium">What happened?</Text>
              <TextInput
                value={missedReason}
                onChangeText={setMissedReason}
                placeholder="Running late, didn't have time…"
                placeholderTextColor="#a8a29e"
                multiline
                numberOfLines={2}
                className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 mb-4"
              />

              <Text className="text-xs text-stone-500 mb-1 font-medium">What did you do instead?</Text>
              <TextInput
                value={didInstead}
                onChangeText={setDidInstead}
                placeholder="Had a quick call, caught up on email…"
                placeholderTextColor="#a8a29e"
                multiline
                numberOfLines={2}
                className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 mb-5"
              />

              <Pressable
                onPress={handleMissedSubmit}
                className="bg-stone-800 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-medium">Got it — move on</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}
