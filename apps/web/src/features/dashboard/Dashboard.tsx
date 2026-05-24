import { useEffect, useState, useCallback } from 'react'
import { routineApi, Routine } from '@/features/routine/api'
import { checkinApi } from '@/features/checkin/api'
import { groupsApi } from '@/features/groups/api'
import { getCurrentReflection } from '@/features/weekly/api'
import { EveningSummary } from '@/features/checkin/EveningSummary'
import { WeeklyResetFlow } from '@/features/weekly/WeeklyResetFlow'
import { DayBanner } from './components/DayBanner'
import { DashboardPanels } from './components/DashboardPanels'

/** Returns the ISO date string (yyyy-MM-dd) for the Monday of the given date's week. */
function getWeekStartDate(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday = start
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

export function Dashboard() {
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [checkinSubmitted, setCheckinSubmitted] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showEveningSummary, setShowEveningSummary] = useState(false)
  const [pendingInviteCount, setPendingInviteCount] = useState(0)
  const [showMondayBanner, setShowMondayBanner] = useState(false)
  const [showWeeklyFlow, setShowWeeklyFlow] = useState(false)

  useEffect(() => {
    Promise.all([
      routineApi.getToday(),
      checkinApi.getMorningStatus(),
      checkinApi.getEveningStatus(),
      groupsApi.listInvites().catch(() => []),
      getCurrentReflection().catch(() => null),
    ]).then(([r, morningStatus, eveningStatus, invites, weeklyStatus]) => {
      setRoutine(r)
      setCheckinSubmitted(morningStatus.submitted)
      setPendingInviteCount(invites.length)

      // Show evening summary only when: after 8 PM AND morning was submitted AND not already done/skipped today
      const now = new Date()
      const hour = now.getHours()
      const isAfterEvening = hour >= 20
      if (r && morningStatus.submitted && isAfterEvening && !eveningStatus.submitted) {
        setShowEveningSummary(true)
      }

      // Show Monday banner when: it is Monday AND weekly reflection not yet submitted this week
      // AND not already dismissed by the user today
      const isMonday = now.getDay() === 1
      // weeklyStatus is { exists: false } when no reflection exists, or WeeklyReflectionData (no exists prop) otherwise
      if (isMonday && weeklyStatus && !('weekStartDate' in weeklyStatus)) {
        const mondayKey = `weekly_reflection_dismissed:${getWeekStartDate(now)}`
        const dismissed = localStorage.getItem(mondayKey)
        if (!dismissed) {
          setShowMondayBanner(true)
        }
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

  function dismissMondayBanner() {
    const mondayKey = `weekly_reflection_dismissed:${getWeekStartDate(new Date())}`
    localStorage.setItem(mondayKey, '1')
    setShowMondayBanner(false)
  }

  function handleWeeklyFlowDone() {
    setShowWeeklyFlow(false)
    setShowMondayBanner(false)
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
      {/* Weekly reset flow — full-screen overlay, rendered on top of everything */}
      {showWeeklyFlow && (
        <WeeklyResetFlow onDone={handleWeeklyFlowDone} />
      )}

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
          <div className="px-4 md:px-6 pb-3 shrink-0 space-y-2">
            <DayBanner checkinSubmitted={checkinSubmitted} pendingInviteCount={pendingInviteCount} />

            {/* Monday weekly reflection banner */}
            {showMondayBanner && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">📅</span>
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium truncate">
                    Quick 2-minute week check-in?
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowWeeklyFlow(true)}
                    className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors whitespace-nowrap"
                  >
                    Let's go →
                  </button>
                  <button
                    onClick={dismissMondayBanner}
                    aria-label="Dismiss"
                    className="text-amber-400 dark:text-amber-600 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
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
