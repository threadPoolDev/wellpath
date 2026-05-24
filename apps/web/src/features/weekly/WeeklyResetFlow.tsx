import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { getWeekPreview, submitReflection, CalendarPreviewDay } from './api'

// ─── Constants ────────────────────────────────────────────────────────────────

const RATING_OPTIONS = [
  { value: 'exhausting', emoji: '😴', label: 'Exhausting' },
  { value: 'tough', emoji: '😕', label: 'Tough' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'great', emoji: '🌟', label: 'Great' },
] as const

const DAY_TYPE_LABELS: Record<string, string> = {
  light: 'Light day',
  moderate: 'Moderate',
  packed: 'Busy',
  very_packed: 'Very busy',
}

const DAY_TYPE_COLORS: Record<string, string> = {
  light: 'text-emerald-600 dark:text-emerald-400',
  moderate: 'text-amber-600 dark:text-amber-400',
  packed: 'text-orange-600 dark:text-orange-400',
  very_packed: 'text-red-600 dark:text-red-400',
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function FlowProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step) / total) * 100)
  return (
    <div className="w-full h-1 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-400 dark:bg-emerald-500 transition-all duration-300 ease-out rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Card 1 — Rating ─────────────────────────────────────────────────────────

function RatingCard({
  value,
  onChange,
  onContinue,
}: {
  value: string
  onChange: (v: string) => void
  onContinue: () => void
}) {
  function handleSelect(v: string) {
    onChange(v)
    setTimeout(onContinue, 600)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Reflection</p>
      <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 leading-snug">
        How did last week feel?
      </h2>
      <div className="flex flex-col gap-2 pt-2">
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all duration-150',
              value === opt.value
                ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                : 'border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:border-stone-300 dark:hover:border-stone-500'
            )}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="text-sm font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Card 2 — One Win ─────────────────────────────────────────────────────────

function WinCard({
  value,
  onChange,
  onContinue,
  onSkip,
}: {
  value: string
  onChange: (v: string) => void
  onContinue: () => void
  onSkip: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Reflection</p>
      <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 leading-snug">
        What's one thing that went well?
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Even small wins count — a good night's sleep, a lunch break you actually took...
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Something that felt good..."
        rows={4}
        className="w-full rounded-2xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700 placeholder-stone-400 dark:placeholder-stone-500"
        autoFocus
      />
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-2.5 text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
        >
          ← Skip
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-2.5 bg-emerald-500 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

// ─── Card 3 — One Intention ───────────────────────────────────────────────────

function IntentionCard({
  value,
  onChange,
  onContinue,
  onSkip,
}: {
  value: string
  onChange: (v: string) => void
  onContinue: () => void
  onSkip: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Intention</p>
      <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 leading-snug">
        What's your one intention for this week?
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Not a resolution — just a gentle intention.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="This week I want to..."
        rows={4}
        className="w-full rounded-2xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700 placeholder-stone-400 dark:placeholder-stone-500"
        autoFocus
      />
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-2.5 text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
        >
          ← Skip
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-2.5 bg-emerald-500 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

// ─── Card 4 — Week Ahead Preview ─────────────────────────────────────────────

function PreviewCard({ onContinue }: { onContinue: () => void }) {
  const [preview, setPreview] = useState<CalendarPreviewDay[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWeekPreview()
      .then(setPreview)
      .catch(() => setPreview([]))
      .finally(() => setLoading(false))

    // Auto-advance after 4 seconds
    const timer = setTimeout(onContinue, 4000)
    return () => clearTimeout(timer)
  }, [onContinue])

  const veryPackedDays = (preview ?? [])
    .filter((d) => d.dayType === 'very_packed' || d.dayType === 'packed')
    .map((d) => format(new Date(d.date + 'T00:00:00'), 'EEEE'))

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Week Ahead</p>
      <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 leading-snug">
        Here's what your week looks like
      </h2>

      {loading ? (
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-10 bg-stone-100 dark:bg-stone-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 pt-2">
          {(preview ?? []).map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700"
            >
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                {format(new Date(day.date + 'T00:00:00'), 'EEEE')}
              </span>
              <div className="flex items-center gap-2">
                {/* Density dots */}
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(day.meetingCount, 5) }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500" />
                  ))}
                </div>
                <span className={cn('text-xs font-medium', DAY_TYPE_COLORS[day.dayType])}>
                  {DAY_TYPE_LABELS[day.dayType]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {veryPackedDays.length > 0 && (
        <p className="text-sm text-stone-500 dark:text-stone-400 italic">
          {veryPackedDays[0]} looks heavy. We'll plan something restorative around it.
        </p>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="w-full py-2.5 bg-emerald-500 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
      >
        Continue →
      </button>
    </div>
  )
}

// ─── Card 5 — AI Intention ────────────────────────────────────────────────────

function AIIntentionCard({
  lastWeekRating,
  oneWin,
  oneIntention,
  onDone,
}: {
  lastWeekRating: string
  oneWin: string
  oneIntention: string
  onDone: () => void
}) {
  const [intention, setIntention] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    submitReflection({
      lastWeekRating,
      oneWin: oneWin || undefined,
      oneIntention: oneIntention || undefined,
    })
      .then((data) => setIntention(data.reflection.aiWeeklyIntention))
      .catch(() => setIntention('Show up for yourself this week, one day at a time.'))
      .finally(() => setLoading(false))
  }, [lastWeekRating, oneWin, oneIntention])

  return (
    <div className="space-y-6">
      <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Your Week</p>
      <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 leading-snug">
        Your intention for the week
      </h2>

      <div className="min-h-[80px] flex items-center">
        {loading ? (
          <p className="text-stone-400 dark:text-stone-500 text-sm animate-pulse">
            Thinking about your week...
          </p>
        ) : (
          <p className="text-xl font-medium text-stone-700 dark:text-stone-200 leading-relaxed italic">
            "{intention}"
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onDone}
        disabled={loading}
        className="w-full py-3 bg-emerald-500 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
      >
        Start the week →
      </button>
    </div>
  )
}

// ─── Main flow ────────────────────────────────────────────────────────────────

interface WeeklyResetFlowProps {
  onDone: () => void
}

export function WeeklyResetFlow({ onDone }: WeeklyResetFlowProps) {
  const [step, setStep] = useState(0)
  const [rating, setRating] = useState('')
  const [win, setWin] = useState('')
  const [intention, setIntention] = useState('')

  const TOTAL_STEPS = 5

  const next = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), [])

  function handleClose() {
    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-50 dark:bg-stone-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <p className="text-sm text-stone-400 dark:text-stone-500">Weekly reset</p>
        <button
          type="button"
          onClick={handleClose}
          className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4 shrink-0">
        <FlowProgress step={step} total={TOTAL_STEPS} />
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{step + 1} of {TOTAL_STEPS}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-8 flex items-start justify-center pt-2">
        <div className="w-full max-w-md bg-white dark:bg-stone-800 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-700 p-8">
          {step === 0 && (
            <RatingCard
              value={rating}
              onChange={setRating}
              onContinue={next}
            />
          )}
          {step === 1 && (
            <WinCard
              value={win}
              onChange={setWin}
              onContinue={next}
              onSkip={next}
            />
          )}
          {step === 2 && (
            <IntentionCard
              value={intention}
              onChange={setIntention}
              onContinue={next}
              onSkip={next}
            />
          )}
          {step === 3 && (
            <PreviewCard onContinue={next} />
          )}
          {step === 4 && (
            <AIIntentionCard
              lastWeekRating={rating || 'okay'}
              oneWin={win}
              oneIntention={intention}
              onDone={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}
