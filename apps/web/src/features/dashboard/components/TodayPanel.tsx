import { useState, useCallback } from 'react'
import { Routine } from '@/features/routine/api'
import { cn } from '@/lib/utils'
import { TaskCard } from './TaskCard'
import { MeetingCard } from './MeetingCard'
import { AddMeetingForm } from './AddMeetingForm'

const DAY_TYPE_LABELS: Record<string, string> = {
  light: 'Light day',
  moderate: 'Moderate day',
  packed: 'Packed day',
}

interface TodayPanelProps {
  routine: Routine | null
  checkinSubmitted: boolean
  onRoutineUpdate: (updated: Routine) => void
}

export function TodayPanel({ routine, checkinSubmitted, onRoutineUpdate }: TodayPanelProps) {
  const [showAddMeeting, setShowAddMeeting] = useState(false)
  const [freeTimeSuggestion, setFreeTimeSuggestion] = useState<{ minutes: number; meetingTitle: string } | null>(null)

  const handleFreeTime = useCallback((minutes: number, meetingTitle: string) => {
    setFreeTimeSuggestion({ minutes, meetingTitle })
  }, [])

  const meetings = routine?.meetings ?? []

  return (
    <div className="space-y-4">
      {/* Add meeting form trigger */}
      {routine && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowAddMeeting((v) => !v)}
            className="text-xs font-semibold text-sage-600 border border-sage-200 dark:border-sage-700 rounded-lg px-3 py-1.5 hover:bg-sage-50 dark:text-sage-400 dark:hover:bg-sage-900/20 transition-colors"
          >
            + Meeting
          </button>
        </div>
      )}

      {/* Reclaimed time suggestion */}
      {freeTimeSuggestion && (
        <div className="rounded-2xl bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-800 px-4 py-3 flex items-start gap-3">
          <span className="text-xl">🚶</span>
          <div className="flex-1">
            <p className="text-sm text-stone-700 dark:text-stone-300">
              Your <span className="font-medium">{freeTimeSuggestion.meetingTitle}</span> ended{' '}
              {freeTimeSuggestion.minutes} min early — want to use that for a quick stretch or catch up on water?
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFreeTimeSuggestion(null)}
            className="text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Quick-add meeting form */}
      {showAddMeeting && routine && (
        <AddMeetingForm
          routineId={routine._id}
          onAdd={(updated) => { onRoutineUpdate(updated); setShowAddMeeting(false) }}
          onClose={() => setShowAddMeeting(false)}
        />
      )}

      {/* Day type badge */}
      {routine && (
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-semibold px-3 py-1 rounded-full',
            routine.dayType === 'light' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            routine.dayType === 'moderate' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
            routine.dayType === 'packed' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
          )}>
            {DAY_TYPE_LABELS[routine.dayType]}
          </span>
          <span className="text-xs text-stone-400 dark:text-stone-500">
            {routine.totalMeetingMinutes > 0
              ? `${routine.totalMeetingMinutes} min in meetings`
              : 'No meetings'}
          </span>
        </div>
      )}

      {/* Meetings */}
      {meetings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide">Meetings</p>
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting._id}
              meeting={meeting}
              routineId={routine!._id}
              onUpdate={onRoutineUpdate}
              onFreeTime={handleFreeTime}
            />
          ))}
        </div>
      )}

      {/* Tasks */}
      {routine && routine.tasks.length > 0 ? (
        <div className="space-y-3">
          {meetings.length > 0 && (
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide">Your routine</p>
          )}
          {routine.tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              routineId={routine._id}
              onUpdate={onRoutineUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-700 p-8 text-center space-y-2">
          {checkinSubmitted ? (
            <>
              <p className="text-2xl">⏳</p>
              <p className="text-stone-600 dark:text-stone-300 font-medium">Building your routine...</p>
              <p className="text-sm text-stone-400 dark:text-stone-500">This takes a moment — refresh in a few seconds.</p>
            </>
          ) : (
            <>
              <p className="text-2xl">☀️</p>
              <p className="text-stone-600 dark:text-stone-300 font-medium">Complete your morning check-in</p>
              <p className="text-sm text-stone-400 dark:text-stone-500">Your routine for today will appear here.</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
