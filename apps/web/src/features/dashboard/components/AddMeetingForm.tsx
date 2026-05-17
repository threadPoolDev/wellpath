import { useState } from 'react'
import { routineApi, Routine } from '@/features/routine/api'

export function AddMeetingForm({
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
      const updated = await routineApi.addMeeting(routineId, {
        title: title.trim(),
        startTime,
        durationMinutes,
      })
      onAdd(updated)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-sage-200 dark:border-sage-800 bg-sage-50 dark:bg-sage-900/20 p-4 space-y-3">
      <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Add a meeting</p>
      <input
        type="text"
        placeholder="Meeting title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-sage-400 outline-none text-stone-700 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 bg-white dark:bg-stone-900"
      />
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-1">Start time</p>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-sage-400 outline-none text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-1">Duration</p>
          <select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-sage-400 outline-none text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900"
          >
            {[15, 30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!title.trim() || !startTime || isSubmitting}
          className="flex-1 py-2 rounded-xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 disabled:opacity-50 transition-all"
        >
          {isSubmitting ? '...' : 'Add meeting'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
