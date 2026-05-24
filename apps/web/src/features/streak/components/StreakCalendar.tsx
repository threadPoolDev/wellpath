import type { StreakDay, StreakDayStatus } from '../api'

interface Props {
  days: StreakDay[]
}

// Sage green using Tailwind custom or standard approximation
function dotStyle(status: StreakDayStatus): string {
  switch (status) {
    case 'complete': return 'w-2.5 h-2.5 rounded-full bg-emerald-500 border-transparent'
    case 'grace':    return 'w-2.5 h-2.5 rounded-full border-2 border-emerald-400 bg-transparent'
    case 'missed':   return 'w-2.5 h-2.5 rounded-full border-2 border-stone-300 dark:border-stone-600 bg-transparent'
    case 'future':   return 'w-2.5 h-2.5 rounded-full border border-stone-200 dark:border-stone-700 bg-transparent opacity-40'
    case 'pending':  return 'w-2.5 h-2.5 rounded-full bg-emerald-200 dark:bg-emerald-900 border-transparent animate-pulse'
  }
}

function formatDateLabel(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function StreakCalendar({ days }: Props) {
  // Pad to exactly 30 days so we always render 5 rows × 7 cols (show last 35 slots)
  const display = (days ?? []).slice(-30)

  return (
    <div className="mt-4">
      <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">Last 30 days</p>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 35 - display.length }).map((_, i) => (
          <div key={`pad-${i}`} className="w-2.5 h-2.5" />
        ))}
        {display.map((day) => (
          <div
            key={day.date}
            className={dotStyle(day.status)}
            role="img"
            aria-label={`${formatDateLabel(day.date)}: ${day.status}`}
            title={`${formatDateLabel(day.date)}: ${day.status}`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-stone-500 dark:text-stone-400">Complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-400" />
          <span className="text-xs text-stone-500 dark:text-stone-400">Grace</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-stone-300 dark:border-stone-600" />
          <span className="text-xs text-stone-500 dark:text-stone-400">Missed</span>
        </div>
      </div>
    </div>
  )
}
