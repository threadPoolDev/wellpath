import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { routineApi, Routine, RoutineTask, RoutineMeeting } from '@/features/routine/api'
import { checkinApi } from '@/features/checkin/api'
import { groupsApi } from '@/features/groups/api'
import { EveningSummary } from '@/features/checkin/EveningSummary'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants'

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isTaskActionable(taskTime: string): boolean {
  const now = new Date()
  const [h, m] = taskTime.split(':').map(Number)
  return now.getHours() * 60 + now.getMinutes() >= h * 60 + m
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
        isDone && 'border-sage-200 bg-sage-50 opacity-70',
        isMissed && 'border-stone-200 bg-stone-50 opacity-60',
        isSkipped && 'border-stone-100 bg-stone-50 opacity-50',
        isPending && actionable && 'border-stone-200 bg-white',
        isPending && !actionable && 'border-stone-100 bg-stone-50'
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
            {isPending && !actionable && (
              <span className="text-xs text-stone-300 ml-auto">Upcoming</span>
            )}
          </div>
          <p className="font-medium text-stone-800 mt-0.5">{task.title}</p>
          {isPending && (
            <p className="text-sm text-stone-500 mt-0.5 leading-snug">{task.description}</p>
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
            className="flex-1 py-2 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 disabled:opacity-50 transition-all">
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
            className="flex-1 py-2 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-all">
            Missed
          </button>
          <button type="button" onClick={markSkipped} disabled={isUpdating}
            className="px-3 py-2 rounded-xl border-2 border-stone-100 text-stone-400 text-sm font-medium hover:bg-stone-50 disabled:opacity-50 transition-all">
            Skip
          </button>
        </div>
      )}

      {isPending && actionable && showMissed && (
        <div className="mt-3 space-y-2">
          <input type="text" placeholder="What got in the way? (optional)"
            value={missedReason} onChange={(e) => setMissedReason(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 focus:border-sage-400 outline-none text-stone-700 placeholder:text-stone-300" />
          <input type="text" placeholder="What did you do instead? (optional)"
            value={didInstead} onChange={(e) => setDidInstead(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 focus:border-sage-400 outline-none text-stone-700 placeholder:text-stone-300" />
          <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
            <p className="text-xs text-stone-500 mb-2">Share this with your group?</p>
            <div className="flex gap-2">
              {([{ label: 'Yes', value: true }, { label: 'No', value: false }] as const).map(({ label, value }) => (
                <button key={label} type="button" onClick={() => setShareWithGroup(value)}
                  className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all',
                    shareWithGroup === value
                      ? 'border-sage-400 bg-sage-50 text-sage-700'
                      : 'border-stone-200 text-stone-500 hover:bg-stone-100')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={markMissed} disabled={isUpdating}
            className="w-full py-2 rounded-xl bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 disabled:opacity-50 transition-all">
            {isUpdating ? '...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Meeting card ─────────────────────────────────────────────────────────────

function MeetingCard({
  meeting,
  routineId,
  onUpdate,
  onFreeTime,
}: {
  meeting: RoutineMeeting
  routineId: string
  onUpdate: (updated: Routine) => void
  onFreeTime: (minutes: number, meetingTitle: string) => void
}) {
  const [showEndEarly, setShowEndEarly] = useState(false)
  const [actualEndTime, setActualEndTime] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleEndEarly = async () => {
    if (!actualEndTime) return
    setIsUpdating(true)
    try {
      const { routine, freeMinutesGained } = await routineApi.endMeetingEarly(
        routineId, meeting._id, actualEndTime
      )
      onUpdate(routine)
      if (freeMinutesGained > 0) onFreeTime(freeMinutesGained, meeting.title)
      setShowEndEarly(false)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className={cn(
      'rounded-2xl border-2 p-4 transition-all',
      meeting.endedEarly ? 'border-stone-100 bg-stone-50 opacity-70' : 'border-amber-100 bg-amber-50'
    )}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5 shrink-0">📅</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-400 font-medium">{meeting.startTime}</span>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-xs text-stone-400">{meeting.durationMinutes} min</span>
            {meeting.isAdHoc && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Ad-hoc</span>
            )}
            {meeting.endedEarly && (
              <span className="text-xs text-stone-400 ml-auto">
                Ended early · {meeting.freeMinutesGained} min freed
              </span>
            )}
          </div>
          <p className="font-medium text-stone-800 mt-0.5">{meeting.title}</p>
        </div>
      </div>

      {!meeting.endedEarly && (
        <div className="mt-3">
          {!showEndEarly ? (
            <button type="button" onClick={() => setShowEndEarly(true)}
              className="w-full py-2 rounded-xl border-2 border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-all">
              Ended early?
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-stone-500">When did it actually end?</p>
              <input type="time" value={actualEndTime} onChange={(e) => setActualEndTime(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 focus:border-sage-400 outline-none text-stone-700" />
              <div className="flex gap-2">
                <button type="button" onClick={handleEndEarly} disabled={!actualEndTime || isUpdating}
                  className="flex-1 py-2 rounded-xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 disabled:opacity-50 transition-all">
                  {isUpdating ? '...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowEndEarly(false)}
                  className="flex-1 py-2 rounded-xl border-2 border-stone-200 text-stone-500 text-sm font-medium hover:bg-stone-50 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Quick-add meeting form ───────────────────────────────────────────────────

function AddMeetingForm({
  routineId,
  onAdd,
  onClose,
}: {
  routineId: string
  onAdd: (updated: Routine) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !startTime) return
    setIsSubmitting(true)
    try {
      const updated = await routineApi.addMeeting(routineId, { title: title.trim(), startTime, durationMinutes })
      onAdd(updated)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-sage-200 bg-sage-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-stone-700">Add a meeting</p>
      <input type="text" placeholder="Meeting title" value={title} onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 focus:border-sage-400 outline-none text-stone-700 placeholder:text-stone-300 bg-white" />
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="text-xs text-stone-400 mb-1">Start time</p>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 focus:border-sage-400 outline-none text-stone-700 bg-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-stone-400 mb-1">Duration</p>
          <select value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 focus:border-sage-400 outline-none text-stone-700 bg-white">
            {[15, 30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={!title.trim() || !startTime || isSubmitting}
          className="flex-1 py-2 rounded-xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 disabled:opacity-50 transition-all">
          {isSubmitting ? '...' : 'Add meeting'}
        </button>
        <button type="button" onClick={onClose}
          className="flex-1 py-2 rounded-xl border-2 border-stone-200 text-stone-500 text-sm font-medium hover:bg-stone-50 transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [checkinSubmitted, setCheckinSubmitted] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showAddMeeting, setShowAddMeeting] = useState(false)
  const [freeTimeSuggestion, setFreeTimeSuggestion] = useState<{ minutes: number; meetingTitle: string } | null>(null)
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
      // Show evening summary after 8pm if checkin was submitted and routine exists
      const hour = new Date().getHours()
      if (r && status.submitted && hour >= 20) setShowEveningSummary(true)
    }).catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  const handleTaskUpdate = useCallback((updated: Routine) => setRoutine(updated), [])
  const handleMeetingUpdate = useCallback((updated: Routine) => setRoutine(updated), [])

  const handleFreeTime = useCallback((minutes: number, meetingTitle: string) => {
    setFreeTimeSuggestion({ minutes, meetingTitle })
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

  const meetings = routine?.meetings ?? []

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
        <div className="flex items-center gap-2">
          {routine && (
            <button type="button" onClick={() => setShowAddMeeting((v) => !v)}
              className="text-xs font-semibold text-sage-600 border border-sage-200 rounded-lg px-3 py-1.5 hover:bg-sage-50 dark:border-sage-700 dark:text-sage-400 dark:hover:bg-sage-900/20 transition-colors">
              + Meeting
            </button>
          )}
          <ThemeToggle />
          <button type="button" onClick={logout}
            className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Reclaimed time suggestion */}
        {freeTimeSuggestion && (
          <div className="rounded-2xl bg-sage-50 border border-sage-200 px-4 py-3 flex items-start gap-3">
            <span className="text-xl">🚶</span>
            <div className="flex-1">
              <p className="text-sm text-stone-700">
                Your <span className="font-medium">{freeTimeSuggestion.meetingTitle}</span> ended{' '}
                {freeTimeSuggestion.minutes} min early — want to use that for a quick stretch or catch up on water?
              </p>
            </div>
            <button type="button" onClick={() => setFreeTimeSuggestion(null)}
              className="text-stone-300 hover:text-stone-500 text-lg leading-none">×</button>
          </div>
        )}

        {/* Morning check-in banner */}
        {!checkinSubmitted && (
          <button type="button" onClick={() => navigate('/checkin/morning')}
            className="w-full rounded-2xl bg-sage-500 text-white px-5 py-4 text-left flex items-center gap-3 shadow-sm hover:bg-sage-600 transition-all">
            <span className="text-2xl">☀️</span>
            <div>
              <p className="font-semibold">Start your morning check-in</p>
              <p className="text-sage-100 text-sm">3 quick questions · builds your routine for today</p>
            </div>
            <span className="ml-auto text-sage-200 text-lg">→</span>
          </button>
        )}

        {/* Group invite banner */}
        {pendingInviteCount > 0 && (
          <button type="button" onClick={() => navigate(ROUTES.GROUPS)}
            className="w-full rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 px-5 py-4 text-left flex items-center gap-3 hover:border-amber-300 transition-all">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-semibold">
                {pendingInviteCount === 1 ? '1 group invite' : `${pendingInviteCount} group invites`} waiting
              </p>
              <p className="text-amber-600 text-sm">Tap to view and respond</p>
            </div>
            <span className="ml-auto text-amber-400 text-lg">→</span>
          </button>
        )}

        {/* Evening summary */}
        {showEveningSummary && routine && (
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <EveningSummary
              routineId={routine._id}
              onDone={() => setShowEveningSummary(false)}
            />
          </div>
        )}

        {/* Quick-add meeting form */}
        {showAddMeeting && routine && (
          <AddMeetingForm
            routineId={routine._id}
            onAdd={(updated) => { setRoutine(updated); setShowAddMeeting(false) }}
            onClose={() => setShowAddMeeting(false)}
          />
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

        {/* Meetings section */}
        {meetings.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Meetings</p>
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
                routineId={routine!._id}
                onUpdate={handleMeetingUpdate}
                onFreeTime={handleFreeTime}
              />
            ))}
          </div>
        )}

        {/* Routine tasks */}
        {routine && routine.tasks.length > 0 ? (
          <div className="space-y-3">
            {meetings.length > 0 && (
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Your routine</p>
            )}
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
