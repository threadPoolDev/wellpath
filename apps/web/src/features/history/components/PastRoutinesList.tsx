import { useEffect, useState } from 'react'
import { historyApi, PastRoutineSummary } from '../api'

const DAY_TYPE_STYLES = {
  light:    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  moderate: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  packed:   'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
} as const

const ENERGY_ICONS: Record<string, string> = {
  low: '🔋',
  medium: '⚡',
  high: '🚀',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const monday = new Date(d)
  monday.setDate(d.getDate() - d.getDay() + 1)
  return `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function groupByWeek(routines: PastRoutineSummary[]): { label: string; items: PastRoutineSummary[] }[] {
  const groups = new Map<string, PastRoutineSummary[]>()
  for (const r of routines) {
    const label = formatWeekLabel(r.date)
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(r)
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
}

export function PastRoutinesList() {
  const [routines, setRoutines] = useState<PastRoutineSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    historyApi.getPastRoutines()
      .then(setRoutines)
      .catch(() => setRoutines([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-stone-100 dark:bg-stone-800 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (routines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 gap-2 text-center">
        <p className="text-3xl">📋</p>
        <p className="text-sm font-medium text-stone-600 dark:text-stone-300">No past routines yet</p>
        <p className="text-xs text-stone-400 dark:text-stone-500">Check back after your first day</p>
      </div>
    )
  }

  const groups = groupByWeek(routines)

  return (
    <div className="space-y-6 pt-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-2 px-1">
            {group.label}
          </p>
          <div className="space-y-2">
            {group.items.map((r) => (
              <div
                key={r._id}
                className="flex items-center gap-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                    {formatDate(r.date)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${DAY_TYPE_STYLES[r.dayType] ?? ''}`}>
                      {r.dayType}
                    </span>
                    {r.morningCheckin?.energyLevel && (
                      <span className="text-xs text-stone-400 dark:text-stone-500">
                        {ENERGY_ICONS[r.morningCheckin.energyLevel] ?? ''} {r.morningCheckin.energyLevel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Completion bar */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                    {r.completionPercentage}%
                  </p>
                  <div className="w-20 h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#84a98c] rounded-full"
                      style={{ width: `${r.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
