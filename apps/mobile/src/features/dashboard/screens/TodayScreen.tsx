import { View, Text, ActivityIndicator } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { dashboardApi, type RoutineTask, type TodayRoutine, type UpdateTaskStatusDto } from '../api'
import { DayBanner } from '../components/DayBanner'
import { TaskCard } from '../components/TaskCard'
import { MorningCheckin } from '../components/MorningCheckin'
import { EveningSummary } from '../components/EveningSummary'
import {
  DASHBOARD_QUERY_KEYS,
  EVENING_SUMMARY_HOUR,
  DASHBOARD_STRINGS,
} from '../constants/dashboard.constants'
import { SafeScrollView } from '../../../components/SafeScrollView'
import { OfflineBanner } from '../../../components/OfflineBanner'
import { useMedicineNotifications, type MedicineReminder } from '../../../hooks/useMedicineNotifications'
import { useMemo } from 'react'

function useIsEveningTime(): boolean {
  const hour = new Date().getHours()
  return hour >= EVENING_SUMMARY_HOUR
}

export function TodayScreen() {
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const isEvening = useIsEveningTime()

  // Queries
  const routineQuery = useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.TODAY_ROUTINE],
    queryFn: dashboardApi.getTodayRoutine,
    staleTime: 2 * 60 * 1000, // 2 min
  })

  const morningStatusQuery = useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.MORNING_STATUS],
    queryFn: dashboardApi.getMorningStatus,
    staleTime: 5 * 60 * 1000,
  })

  const eveningStatusQuery = useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.EVENING_STATUS],
    queryFn: dashboardApi.getEveningStatus,
    enabled: isEvening,
    staleTime: 5 * 60 * 1000,
  })

  // Mutations
  const morningCheckinMutation = useMutation({
    mutationFn: dashboardApi.submitMorningCheckin,
    onSuccess: (routine) => {
      queryClient.setQueryData([DASHBOARD_QUERY_KEYS.TODAY_ROUTINE], routine)
      queryClient.setQueryData([DASHBOARD_QUERY_KEYS.MORNING_STATUS], {
        submitted: true,
        date: routine.date,
      })
    },
  })

  const taskStatusMutation = useMutation({
    mutationFn: ({
      taskId,
      dto,
    }: {
      taskId: string
      dto: UpdateTaskStatusDto
    }) => {
      const routine = routineQuery.data
      if (!routine) return Promise.resolve()
      return dashboardApi.updateTaskStatus(routine._id, taskId, dto)
    },
    onSuccess: (_, variables) => {
      // Optimistically update task in cache
      queryClient.setQueryData(
        [DASHBOARD_QUERY_KEYS.TODAY_ROUTINE],
        (old: TodayRoutine | null | undefined) => {
          if (!old) return old
          const { status, missedReason, didInstead } = variables.dto
          return {
            ...old,
            tasks: old.tasks.map((t: RoutineTask) =>
              t._id === variables.taskId
                ? { ...t, status, missedReason, didInstead }
                : t,
            ),
          }
        },
      )
    },
  })

  const eveningCheckinMutation = useMutation({
    mutationFn: dashboardApi.submitEveningCheckin,
    onSuccess: () => {
      queryClient.setQueryData([DASHBOARD_QUERY_KEYS.EVENING_STATUS], {
        submitted: true,
        date: new Date().toISOString().split('T')[0],
      })
    },
  })

  function handleUpdateTaskStatus(
    taskId: string,
    status: 'done' | 'missed' | 'skipped',
    opts?: { missedReason?: string; didInstead?: string },
  ) {
    taskStatusMutation.mutate({ taskId, dto: { status, ...opts } })
  }

  function handleEveningSkip() {
    eveningCheckinMutation.mutate({ skipped: true, overallRating: 0 })
  }

  // Derived state
  const morningSubmitted = morningStatusQuery.data?.submitted ?? false
  const eveningSubmitted = eveningStatusQuery.data?.submitted ?? false
  const showMorningCheckin = !morningSubmitted
  const showEveningSummary = isEvening && !eveningSubmitted && morningSubmitted
  const routine = routineQuery.data

  // Schedule local medicine notifications whenever routine loads
  const medicineReminders = useMemo<MedicineReminder[]>(() => {
    if (!routine) return []
    return routine.tasks
      .filter((t) => t.category === 'medicine')
      .map((t) => ({
        id: t._id,
        time: t.time,
        isCritical: true, // treat all medicine as critical for notification purposes
      }))
  }, [routine])
  useMedicineNotifications(medicineReminders)

  // Loading
  if (morningStatusQuery.isLoading || routineQuery.isLoading) {
    return (
      <View className="flex-1 bg-stone-50 items-center justify-center">
        <ActivityIndicator size="large" color="#44403c" />
      </View>
    )
  }

  // Morning check-in not done — show the check-in flow
  if (showMorningCheckin) {
    return (
      <View className="flex-1 bg-stone-50" style={{ paddingTop: insets.top }}>
        <View className="px-6 pt-6 pb-4 border-b border-stone-100">
          <Text className="text-xl font-bold text-stone-900">
            {DASHBOARD_STRINGS.MORNING_CHECKIN_PROMPT}
          </Text>
          <Text className="text-stone-400 text-sm mt-0.5">
            {DASHBOARD_STRINGS.MORNING_CHECKIN_SUBTEXT}
          </Text>
        </View>
        <MorningCheckin
          onComplete={(dto) => morningCheckinMutation.mutate(dto)}
          loading={morningCheckinMutation.isPending}
        />
      </View>
    )
  }

  // Evening summary — full-screen replacement
  if (showEveningSummary) {
    return (
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <EveningSummary
          onComplete={(dto) => eveningCheckinMutation.mutate(dto)}
          onSkip={handleEveningSkip}
          loading={eveningCheckinMutation.isPending}
        />
      </View>
    )
  }

  // Routine not yet generated
  if (!routine || routine.tasks.length === 0) {
    return (
      <View className="flex-1 bg-stone-50">
        <DayBanner />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">✨</Text>
          <Text className="text-lg font-semibold text-stone-800 text-center mb-2">
            {DASHBOARD_STRINGS.NO_ROUTINE_YET}
          </Text>
          <Text className="text-stone-500 text-sm text-center">
            {DASHBOARD_STRINGS.NO_ROUTINE_SUBTEXT}
          </Text>
        </View>
      </View>
    )
  }

  // Main dashboard — task list
  return (
    <SafeScrollView className="bg-stone-50">
      <OfflineBanner />
      <DayBanner dayType={routine.dayType} date={routine.date} />

      {/* Completion summary strip */}
      <CompletionStrip tasks={routine.tasks} />

      {/* Task list */}
      <View className="pt-2 pb-4">
        {routine.tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            routineId={routine._id}
            onUpdateStatus={handleUpdateTaskStatus}
          />
        ))}
      </View>
    </SafeScrollView>
  )
}

function CompletionStrip({ tasks }: { tasks: RoutineTask[] }) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <View className="mx-4 mb-2 px-4 py-3 bg-white rounded-2xl border border-stone-100">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-xs text-stone-500">Today's progress</Text>
        <Text className="text-xs font-semibold text-stone-700">{done}/{total} done</Text>
      </View>
      <View className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <View
          className="h-full bg-stone-700 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  )
}
