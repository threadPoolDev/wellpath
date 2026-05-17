import { useState } from 'react'
import { routineApi, Routine, RoutineTask } from '@/features/routine/api'
import { cn } from '@/lib/utils'

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  const hLabel = hrs === 1 ? '1 hr' : `${hrs} hrs`
  return mins === 0 ? hLabel : `${hLabel} ${mins} min`
}

const CATEGORY_ICONS: Record<string, string> = {
  hydration: '💧',
  exercise: '🏃',
  nutrition: '🍱',
  focus_work: '🎯',
  break: '☕',
  commute: '🚌',
  family: '🏠',
  medicine: '💊',
  wind_down: '🌙',
  learning: '📚',
  social: '👥',
  mindfulness: '🧘',
}

export function isTaskActionable(taskTime: string): boolean {
  const now = new Date()
  const [h, m] = taskTime.split(':').map(Number)
  return now.getHours() * 60 + now.getMinutes() >= h * 60 + m
}

export function TaskCard({
  task,
  routineId,
  onUpdate,
}: {
  task: RoutineTask
  routineId: string
  onUpdate: (updated: Routine) => void
}) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showMissed, setShowMissed] = useState(false)
  const [missedReason, setMissedReason] = useState('')
  const [didInstead, setDidInstead] = useState('')
  const [shareWithGroup, setShareWithGroup] = useState<boolean | null>(null)
  const [remindScheduled, setRemindScheduled] = useState(false)

  const isDone = task.status === 'done'
  const isMissed = task.status === 'missed'
  const isSkipped = task.status === 'skipped'
  const isPending = task.status === 'pending'
  const isMedicine = task.category === 'medicine'
  const actionable = isTaskActionable(task.time)

  const markDone = async () => {
    setIsUpdating(true)
    try {
      const updated = await routineApi.updateTaskStatus(routineId, task._id, 'done')
      onUpdate(updated)
    } finally {
      setIsUpdating(false)
    }
  }

  const markSkipped = async () => {
    setIsUpdating(true)
    try {
      const updated = await routineApi.updateTaskStatus(routineId, task._id, 'skipped')
      onUpdate(updated)
    } finally {
      setIsUpdating(false)
    }
  }

  const markMissed = async () => {
    setIsUpdating(true)
    try {
      const updated = await routineApi.updateTaskStatus(routineId, task._id, 'missed', {
        missedReason: missedReason || undefined,
        didInstead: didInstead || undefined,
        shareWithGroup: shareWithGroup ?? undefined,
      })
      onUpdate(updated)
      setShowMissed(false)
    } finally {
      setIsUpdating(false)
    }
  }

  const remindInTenMinutes = () => {
    setRemindScheduled(true)
    if ('Notification' in window) {
      const fire = () =>
        new Notification('Medicine reminder 💊', {
          body: 'Your medicine reminder from 10 minutes ago.',
          icon: '/favicon.ico',
        })
      if (Notification.permission === 'granted') {
        setTimeout(fire, 10 * 60 * 1000)
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') setTimeout(fire, 10 * 60 * 1000)
        })
      }
    }
  }

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-4 transition-all duration-150',
        isDone && 'border-sage-200 bg-sage-50 dark:bg-sage-900/20 opacity-70',
        isMissed && 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 opacity-60',
        isSkipped && 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 opacity-50',
        isPending && actionable && 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800',
        isPending && !actionable && 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5 shrink-0">{CATEGORY_ICONS[task.category] ?? '📌'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">{task.time}</span>
            <span className="text-xs text-stone-300 dark:text-stone-600">·</span>
            <span className="text-xs text-stone-400 dark:text-stone-500">{formatDuration(task.durationMinutes)}</span>
            {isDone && <span className="text-xs text-sage-600 font-semibold ml-auto">Done ✓</span>}
            {isMissed && <span className="text-xs text-stone-500 dark:text-stone-400 ml-auto">Missed</span>}
            {isSkipped && <span className="text-xs text-stone-400 dark:text-stone-500 ml-auto">Skipped</span>}
            {isPending && !actionable && (
              <span className="text-xs text-stone-300 dark:text-stone-600 ml-auto">Upcoming</span>
            )}
          </div>
          <p className="font-medium text-stone-800 dark:text-stone-100 mt-0.5">{task.title}</p>
          {isPending && (
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">{task.description}</p>
          )}
        </div>
      </div>

      {isPending && actionable && isMedicine && (
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={markDone} disabled={isUpdating}
            className="flex-1 py-2 rounded-xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 disabled:opacity-50 transition-all">
            {isUpdating ? '...' : 'Done'}
          </button>
          <button type="button" onClick={remindInTenMinutes} disabled={remindScheduled}
            className="flex-1 py-2 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 transition-all">
            {remindScheduled ? 'Reminder set ✓' : 'Remind in 10 min'}
          </button>
        </div>
      )}

      {isPending && actionable && !isMedicine && (
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={markDone} disabled={isUpdating}
            className="flex-1 py-2 rounded-xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 disabled:opacity-50 transition-all">
            {isUpdating ? '...' : 'Done'}
          </button>
          <button type="button" onClick={() => setShowMissed((v) => !v)}
            className="flex-1 py-2 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-all">
            Missed
          </button>
          <button type="button" onClick={markSkipped} disabled={isUpdating}
            className="px-3 py-2 rounded-xl border-2 border-stone-100 dark:border-stone-800 text-stone-400 dark:text-stone-500 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 transition-all">
            Skip
          </button>
        </div>
      )}

      {isPending && actionable && showMissed && (
        <div className="mt-3 space-y-2">
          <input type="text" placeholder="What got in the way? (optional)"
            value={missedReason} onChange={(e) => setMissedReason(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-sage-400 outline-none text-stone-700 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 bg-white dark:bg-stone-900" />
          <input type="text" placeholder="What did you do instead? (optional)"
            value={didInstead} onChange={(e) => setDidInstead(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-sage-400 outline-none text-stone-700 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 bg-white dark:bg-stone-900" />
          <div className="rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 px-3 py-2">
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">Share this with your group?</p>
            <div className="flex gap-2">
              {([{ label: 'Yes', value: true }, { label: 'No', value: false }] as const).map(({ label, value }) => (
                <button key={label} type="button" onClick={() => setShareWithGroup(value)}
                  className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all',
                    shareWithGroup === value
                      ? 'border-sage-400 bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400'
                      : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={markMissed} disabled={isUpdating}
            className="w-full py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-600 disabled:opacity-50 transition-all">
            {isUpdating ? '...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}
