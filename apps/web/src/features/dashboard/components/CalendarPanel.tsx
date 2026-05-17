import { useEffect, useState } from 'react'
import { Routine } from '@/features/routine/api'
import { getEventsForDay, syncCalendar, CalendarEvent } from '@/features/calendar/api'

interface CalendarPanelProps {
  routine: Routine | null
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  const hLabel = hrs === 1 ? '1 hr' : `${hrs} hrs`
  return mins === 0 ? hLabel : `${hLabel} ${mins} min`
}

export function CalendarPanel({ routine }: CalendarPanelProps) {
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    syncCalendar()
      .catch(() => { setSyncError(true) })
      .then(() => getEventsForDay(today))
      .then((r) => setCalEvents(r.events))
      .catch(() => setCalEvents([]))
      .finally(() => setLoading(false))
  }, [])

  // Ad-hoc meetings manually added during the day (stored in routine)
  const adHocMeetings = (routine?.meetings ?? []).filter((m) => m.isAdHoc)

  const hasCalEvents = calEvents.length > 0
  const hasAdHoc = adHocMeetings.length > 0

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((n) => (
          <div key={n} className="h-16 bg-stone-100 dark:bg-stone-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!hasCalEvents && !hasAdHoc) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-700 p-8 text-center space-y-2">
        <p className="text-2xl">📅</p>
        <p className="text-stone-600 dark:text-stone-300 font-medium">No meetings today</p>
        <p className="text-sm text-stone-400 dark:text-stone-500">
          Connect your calendar in Settings to see events here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {syncError && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          Could not sync your calendar — your connection may need to be refreshed in Settings.
        </div>
      )}
      {/* Events synced from Google / Microsoft */}
      {hasCalEvents && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide">
            From your calendar
          </p>
          {calEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">
                  {event.provider === 'google' ? '🗓️' : '📆'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 dark:text-stone-100 truncate">{event.title}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                    {formatTime(event.startTime)} – {formatTime(event.endTime)}
                    <span className="mx-1.5">·</span>
                    {formatDuration(event.durationMinutes)}
                    {event.isRecurring && (
                      <span className="ml-2 text-stone-300 dark:text-stone-600">↻ recurring</span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-stone-300 dark:text-stone-600 shrink-0 capitalize">
                  {event.provider}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ad-hoc meetings added from the dashboard */}
      {hasAdHoc && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide">
            Added today
          </p>
          {adHocMeetings.map((meeting) => (
            <div
              key={meeting._id}
              className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">⚡</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 dark:text-stone-100 truncate">{meeting.title}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {meeting.startTime}
                    <span className="mx-1.5">·</span>
                    {formatDuration(meeting.durationMinutes)}
                    {meeting.endedEarly && (
                      <span className="ml-2 text-stone-400 dark:text-stone-500">· ended early</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
