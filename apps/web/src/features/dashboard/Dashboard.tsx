import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { routineApi, Routine, RoutineTask } from '@/features/routine/api'
import { checkinApi } from '@/features/checkin/api'
import { cn } from '@/lib/utils'

// ─── Category icons ───────────────────────────────────────────────────────────

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

const DAY_TYPE_LABELS: Record<string, string> = {
  light: 'Light day',
  moderate: 'Moderate day',
  packed: 'Packed day',
}

// ─── Task card ────────────────────────────────────────────────────────────────

function TaskCard({
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
        isDone && 'border-sage-200 bg-sage-50 opacity-70',
        isMissed && 'border-stone-200 bg-stone-50 opacity-60',
        isSkipped && 'border-stone-100 bg-stone-50 opacity-50',
        isPending && 'border-stone-200 bg-white'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5 shrink-0">{CATEGORY_ICONS[task.category] ?? '📌'}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-400 font-medium">{task.time}</span>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-xs text-stone-400">{task.durationMinutes} min</span>
            {isDone && <span className="text-xs text-sage-600 font-semibold ml-auto">Done ✓</span>}
            {isMissed && <span className="text-xs text-stone-500 ml-auto">Missed</span>}
            {isSkipped && <span className="text-xs text-stone-400 ml-auto">Skipped</span>}
          </div>
          <p className="font-medium text-stone-800 mt-0.5">{task.title}</p>
          {isPending && (
            <p className="text-sm text-stone-500 mt-0.5 leading-snug">{task.description}</p>
          )}
        </div>
      </div>

      {/* Medicine task actions */}
      {isPending && isMedicine && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={markDone}
            disabled={isUpdating}
            className="flex-1 py-2 rounded-xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 disabled:opacity-50 transition-all"
          >
            {isUpdating ? '...' : 'Done'}
          </button>
          <button
            type="button"
            onClick={remindInTenMinutes}
            disabled={remindScheduled}
            className="flex-1 py-2 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 disabled:opacity-50 transition-all"
          >
            {remindScheduled ? 'Reminder set ✓' : 'Remind in 10 min'}
          </button>
        </div>
      )}

      {/* Non-medicine task actions */}
      {isPending && !isMedicine && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={markDone}
            disabled={isUpdating}
            className="flex-1 py-2 rounded-xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 disabled:opacity-50 transition-all"
          >
            {isUpdating ? '...' : 'Done'}
          </button>
          <button
            type="button"
            onClick={() => setShowMissed((v) => !v)}
            className="flex-1 py-2 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-all"
          >
            Missed
          </button>
          <button
            type="button"
            onClick={markSkipped}
            disabled={isUpdating}
            className="px-3 py-2 rounded-xl border-2 border-stone-100 text-stone-400 text-sm font-medium hover:bg-stone-50 disabled:opacity-50 transition-all"
          >
            Skip
          </button>
        </div>
      )}

      {/* Missed detail form */}
      {showMissed && (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            placeholder="What got in the way? (optional)"
            value={missedReason}
            onChange={(e) => setMissedReason(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 focus:border-sage-400 outline-none text-stone-700 placeholder:text-stone-300"
          />
          <input
            type="text"
            placeholder="What did you do instead? (optional)"
            value={didInstead}
            onChange={(e) => setDidInstead(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 focus:border-sage-400 outline-none text-stone-700 placeholder:text-stone-300"
          />

          {/* Group sharing override */}
          <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
            <p className="text-xs text-stone-500 mb-2">Share this with your group?</p>
            <div className="flex gap-2">
              {[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setShareWithGroup(value)}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all',
                    shareWithGroup === value
                      ? 'border-sage-400 bg-sage-50 text-sage-700'
                      : 'border-stone-200 text-stone-500 hover:bg-stone-100'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={markMissed}
            disabled={isUpdating}
            className="w-full py-2 rounded-xl bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 disabled:opacity-50 transition-all"
          >
            {isUpdating ? '...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [checkinSubmitted, setCheckinSubmitted] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      routineApi.getToday(),
      checkinApi.getMorningStatus(),
    ]).then(([r, status]) => {
      setRoutine(r)
      setCheckinSubmitted(status.submitted)
    }).catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  const handleTaskUpdate = useCallback((updated: Routine) => {
    setRoutine(updated)
  }, [])

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-sage-400 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-400">{today}</p>
          <h1 className="text-lg font-semibold text-stone-800">
            {user?.name ? `Hey, ${user.name.split(' ')[0]}` : 'Good morning'}
          </h1>
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Morning check-in banner */}
        {!checkinSubmitted && (
          <button
            type="button"
            onClick={() => navigate('/checkin/morning')}
            className="w-full rounded-2xl bg-sage-500 text-white px-5 py-4 text-left flex items-center gap-3 shadow-sm hover:bg-sage-600 transition-all"
          >
            <span className="text-2xl">☀️</span>
            <div>
              <p className="font-semibold">Start your morning check-in</p>
              <p className="text-sage-100 text-sm">3 quick questions · builds your routine for today</p>
            </div>
            <span className="ml-auto text-sage-200 text-lg">→</span>
          </button>
        )}

        {/* Day type badge */}
        {routine && (
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs font-semibold px-3 py-1 rounded-full',
              routine.dayType === 'light' && 'bg-green-100 text-green-700',
              routine.dayType === 'moderate' && 'bg-amber-100 text-amber-700',
              routine.dayType === 'packed' && 'bg-red-100 text-red-700',
            )}>
              {DAY_TYPE_LABELS[routine.dayType]}
            </span>
            <span className="text-xs text-stone-400">
              {routine.totalMeetingMinutes > 0
                ? `${routine.totalMeetingMinutes} min in meetings`
                : 'No meetings'}
            </span>
          </div>
        )}

        {/* Routine tasks */}
        {routine && routine.tasks.length > 0 ? (
          <div className="space-y-3">
            {routine.tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                routineId={routine._id}
                onUpdate={handleTaskUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center space-y-2">
            {checkinSubmitted ? (
              <>
                <p className="text-2xl">⏳</p>
                <p className="text-stone-600 font-medium">Building your routine...</p>
                <p className="text-sm text-stone-400">This takes a moment — refresh in a few seconds.</p>
              </>
            ) : (
              <>
                <p className="text-2xl">☀️</p>
                <p className="text-stone-600 font-medium">Complete your morning check-in</p>
                <p className="text-sm text-stone-400">Your routine for today will appear here.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
