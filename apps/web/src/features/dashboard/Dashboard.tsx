import { useEffect, useState, useCallback } from 'react'
import { routineApi, Routine } from '@/features/routine/api'
import { checkinApi } from '@/features/checkin/api'
import { groupsApi } from '@/features/groups/api'
import { EveningSummary } from '@/features/checkin/EveningSummary'
import { DayBanner } from './components/DayBanner'
import { DashboardPanels } from './components/DashboardPanels'

export function Dashboard() {
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [checkinSubmitted, setCheckinSubmitted] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showEveningSummary, setShowEveningSummary] = useState(false)
  const [pendingInviteCount, setPendingInviteCount] = useState(0)

  useEffect(() => {
    Promise.all([
      routineApi.getToday(),
      checkinApi.getMorningStatus(),
      groupsApi.listInvites().catch(() => []),
    ]).then(([r, status, invites]) => {
      setRoutine(r)
      setCheckinSubmitted(status.submitted)
      setPendingInviteCount(invites.length)
      const hour = new Date().getHours()
      if (r && status.submitted && hour >= 20) setShowEveningSummary(true)
    }).catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  const handleRoutineUpdate = useCallback((updated: Routine) => setRoutine(updated), [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-sage-400 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Day date header */}
      <div className="px-4 md:px-6 pt-5 pb-3 shrink-0">
        <p className="text-xs text-stone-400 dark:text-stone-500">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Banner area */}
      <div className="px-4 md:px-6 pb-3 shrink-0 space-y-3">
        <DayBanner checkinSubmitted={checkinSubmitted} pendingInviteCount={pendingInviteCount} />

        {showEveningSummary && routine && (
          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
            <EveningSummary
              routineId={routine._id}
              onDone={() => setShowEveningSummary(false)}
            />
          </div>
        )}
      </div>

      {/* Tabbed panel — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <DashboardPanels
          routine={routine}
          checkinSubmitted={checkinSubmitted}
          onRoutineUpdate={handleRoutineUpdate}
        />
      </div>
    </div>
  )
}
