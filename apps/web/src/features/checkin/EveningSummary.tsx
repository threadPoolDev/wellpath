import { useState } from 'react'
import { checkinApi } from './api'

interface EveningSummaryProps {
  routineId: string
  onDone: () => void
}

const RATINGS = [
  { value: 1, label: 'Rough' },
  { value: 2, label: 'Meh' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
]

export function EveningSummary({ routineId, onDone }: EveningSummaryProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [howWasYourDay, setHowWasYourDay] = useState('')
  const [tomorrowNote, setTomorrowNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!rating) return
    setIsSubmitting(true)
    try {
      await checkinApi.submitEvening(routineId, {
        overallRating: rating,
        howWasYourDay: howWasYourDay || undefined,
        tomorrowNote: tomorrowNote || undefined,
      })
      setDone(true)
      setTimeout(onDone, 1200)
    } catch (err) {
      console.error('[evening summary] submit failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-stone-600 dark:text-stone-300">
        <span className="text-4xl">🌙</span>
        <p className="text-lg font-medium">Rest well. Tomorrow's a fresh start.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-stone-400 dark:text-stone-500 font-medium mb-1">Evening wrap-up</p>
        <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-100">How did today go?</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Take a moment to close the loop on your day.</p>
      </div>

      {/* Rating */}
      <div>
        <p className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-3">Overall, how was your day?</p>
        <div className="flex gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRating(r.value)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                rating === r.value
                  ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
              }`}
            >
              <div className="text-lg mb-0.5">
                {r.value === 1 ? '😓' : r.value === 2 ? '😕' : r.value === 3 ? '😐' : r.value === 4 ? '🙂' : '😄'}
              </div>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Free text */}
      <div>
        <label className="text-sm font-medium text-stone-600 dark:text-stone-300 block mb-2">
          Anything worth noting? <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
        </label>
        <textarea
          value={howWasYourDay}
          onChange={(e) => setHowWasYourDay(e.target.value)}
          placeholder="What worked well, what didn't, what surprised you..."
          className="w-full border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm text-stone-700 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-stone-600 h-24 bg-white dark:bg-stone-900"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-stone-600 dark:text-stone-300 block mb-2">
          A note for tomorrow <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
        </label>
        <textarea
          value={tomorrowNote}
          onChange={(e) => setTomorrowNote(e.target.value)}
          placeholder="One thing you want to carry into tomorrow..."
          className="w-full border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm text-stone-700 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-stone-600 h-20 bg-white dark:bg-stone-900"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onDone}
          className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={handleSubmit}
          disabled={!rating || isSubmitting}
          className="flex-1 py-3 rounded-xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-sm font-medium disabled:opacity-40 hover:bg-stone-700 dark:hover:bg-stone-100 transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Done for today'}
        </button>
      </div>
    </div>
  )
}
