import { useState } from 'react'
import { routineApi, Routine, RoutineMeeting } from '@/features/routine/api'
import { cn } from '@/lib/utils'

export function MeetingCard({
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
      meeting.endedEarly
        ? 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 opacity-70'
        : 'border-amber-100 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/20'
    )}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5 shrink-0">📅</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">{meeting.startTime}</span>
            <span className="text-xs text-stone-300 dark:text-stone-600">·</span>
            <span className="text-xs text-stone-400 dark:text-stone-500">{meeting.durationMinutes} min</span>
            {meeting.isAdHoc && (
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">Ad-hoc</span>
            )}
            {meeting.endedEarly && (
              <span className="text-xs text-stone-400 dark:text-stone-500 ml-auto">
                Ended early · {meeting.freeMinutesGained} min freed
              </span>
            )}
          </div>
          <p className="font-medium text-stone-800 dark:text-stone-100 mt-0.5">{meeting.title}</p>
        </div>
      </div>

      {!meeting.endedEarly && (
        <div className="mt-3">
          {!showEndEarly ? (
            <button type="button" onClick={() => setShowEndEarly(true)}
              className="w-full py-2 rounded-xl border-2 border-amber-200 dark:border-amber-700/30 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all">
              Ended early?
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-stone-500 dark:text-stone-400">When did it actually end?</p>
              <input type="time" value={actualEndTime} onChange={(e) => setActualEndTime(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-sage-400 outline-none text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900" />
              <div className="flex gap-2">
                <button type="button" onClick={handleEndEarly} disabled={!actualEndTime || isUpdating}
                  className="flex-1 py-2 rounded-xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 disabled:opacity-50 transition-all">
                  {isUpdating ? '...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowEndEarly(false)}
                  className="flex-1 py-2 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-all">
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
