import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchStreak } from './api'
import { StreakCalendar } from './components/StreakCalendar'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function StreakPanel({ isOpen, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['streak'],
    queryFn: fetchStreak,
    enabled: isOpen,
    // Refresh every 5 minutes while panel is open
    refetchInterval: isOpen ? 5 * 60 * 1000 : false,
    staleTime: 60_000,
  })

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } bg-stone-900/40`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-full w-80 z-50 bg-white dark:bg-stone-800 border-l border-stone-200 dark:border-stone-700 shadow-xl flex flex-col transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Your Streak"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h2 className="font-semibold text-stone-800 dark:text-stone-100 text-base">
            Your Streak 🔥
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close streak panel"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <StreakPanelSkeleton />
          ) : data && Array.isArray(data.last30Days) ? (
            <StreakPanelContent data={data} />
          ) : data ? (
            <StreakPanelSkeleton />
          ) : (
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              Couldn't load streak data. Try again later.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

function StreakPanelContent({ data }: { data: NonNullable<ReturnType<typeof fetchStreak> extends Promise<infer T> ? T : never> }) {
  return (
    <div className="space-y-4">
      {/* Current streak — hero number */}
      <div className="text-center py-2">
        <div className="text-5xl font-bold text-stone-800 dark:text-stone-100">
          {data.current}
        </div>
        <div className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          {data.current === 1 ? 'day' : 'days'} in a row
        </div>
      </div>

      {/* Stats row */}
      <div className="space-y-2">
        <StatRow
          label="Personal best"
          value={`${data.personalBest} day${data.personalBest === 1 ? '' : 's'}`}
        />
        <StatRow
          label="Grace days this week"
          value={`${data.graceRemaining} remaining`}
          dim={data.graceRemaining === 0}
        />
        <StatRow
          label="Total days completed"
          value={`${data.totalDaysCompleted} day${data.totalDaysCompleted === 1 ? '' : 's'}`}
        />
      </div>

      {/* Calendar */}
      <StreakCalendar days={data.last30Days} />
    </div>
  )
}

function StatRow({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-stone-600 dark:text-stone-300">{label}</span>
      <span
        className={`text-sm font-medium ${
          dim ? 'text-stone-400 dark:text-stone-500' : 'text-stone-800 dark:text-stone-100'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function StreakPanelSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="text-center py-2">
        <div className="h-12 w-16 bg-stone-200 dark:bg-stone-700 rounded mx-auto" />
        <div className="h-4 w-24 bg-stone-200 dark:bg-stone-700 rounded mx-auto mt-2" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-28 bg-stone-200 dark:bg-stone-700 rounded" />
          <div className="h-4 w-16 bg-stone-200 dark:bg-stone-700 rounded" />
        </div>
      ))}
      <div className="mt-4">
        <div className="h-3 w-20 bg-stone-200 dark:bg-stone-700 rounded mb-2" />
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-stone-200 dark:bg-stone-700" />
          ))}
        </div>
      </div>
    </div>
  )
}
