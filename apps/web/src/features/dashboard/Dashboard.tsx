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
      checkinApi.getEveningStatus(),
      groupsApi.listInvites().catch(() => []),
    ]).then(([r, morningStatus, eveningStatus, invites]) => {
      setRoutine(r)
      setCheckinSubmitted(morningStatus.submitted)
      setPendingInviteCount(invites.length)

      // Show evening summary only when: after 8 PM AND morning was submitted AND not already done/skipped today
      const hour = new Date().getHours()
      const isAfterEvening = hour >= 20
      if (r && morningStatus.submitted && isAfterEvening && !eveningStatus.submitted) {
        setShowEveningSummary(true)
      }
    }).catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  const handleRoutineUpdate = useCallback((updated: Routine) => setRoutine(updated), [])

  // Called after a successful rating submit — optimistic hide before API response
  function handleEveningDone() {
    setShowEveningSummary(false)
  }

  // Called when user clicks "Skip for now" — EveningSummary records skip to backend first
  function handleEveningSkip() {
    setShowEveningSummary(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Day date header — always visible */}
      <div className="px-4 md:px-6 pt-5 pb-3 shrink-0">
        <p className="text-xs text-stone-400 dark:text-stone-500">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* BUG-02: Evening summary takes over the full content area — nothing visible behind it */}
      {showEveningSummary && routine ? (
        <div className="flex-1 overflow-y-auto flex items-start justify-center px-4 pt-6 bg-stone-50 dark:bg-stone-900">
          <div className="w-full max-w-lg bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
            <EveningSummary
              routineId={routine._id}
              onDone={handleEveningDone}
              onSkip={handleEveningSkip}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Banner area */}
          <div className="px-4 md:px-6 pb-3 shrink-0">
            <DayBanner checkinSubmitted={checkinSubmitted} pendingInviteCount={pendingInviteCount} />
          </div>

          {/* Tabbed panels — fill remaining height */}
          <div className="flex-1 overflow-hidden">
            <DashboardPanels
              routine={routine}
              checkinSubmitted={checkinSubmitted}
              onRoutineUpdate={handleRoutineUpdate}
            />
          </div>
        </>
      )}
    </div>
  )
}
