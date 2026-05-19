import { useEffect, useRef, useState } from 'react'
import { Routine } from '@/features/routine/api'
import { getEventsForDay, syncCalendar, CalendarEvent } from '@/features/calendar/api'

interface CalendarPanelProps {
  routine: Routine | null
}

// ─── Grid constants ───────────────────────────────────────────────────────────

const GRID_START_HOUR = 6     // 6 AM
const GRID_END_HOUR = 22      // 10 PM
const HOUR_H = 72             // px per hour  →  1.2 px / min
const PX_PER_MIN = HOUR_H / 60
const GRID_HEIGHT = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_H   // 1152 px
const GRID_START_MIN = GRID_START_HOUR * 60
const GRID_END_MIN = GRID_END_HOUR * 60
const MIN_EVENT_H = 26        // shortest an event block can be (px)

const HOURS = Array.from(
  { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
  (_, i) => GRID_START_HOUR + i
)

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimelineEvent {
  id: string
  title: string
  startMin: number
  endMin: number
  durationMinutes: number
  isAdHoc: boolean
  provider?: 'google' | 'microsoft'
  isRecurring?: boolean
  endedEarly?: boolean
}

interface PlacedEvent extends TimelineEvent {
  col: number
  totalCols: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoToLocalMin(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

function hhmmToMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m ?? 0)
}

function minToLabel(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

function formatHourLabel(h: number): string {
  if (h === 0 || h === 24) return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function formatDuration(min: number): string {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function getNowMin(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

// Simple overlap layout: assign column indices so overlapping events sit side-by-side
function layoutEvents(events: TimelineEvent[]): PlacedEvent[] {
  const sorted = [...events].sort((a, b) => a.startMin - b.startMin)
  const placed: PlacedEvent[] = []

  for (const ev of sorted) {
    const overlapping = placed.filter(
      (p) => p.startMin < ev.endMin && p.endMin > ev.startMin
    )
    const usedCols = new Set(overlapping.map((p) => p.col))
    let col = 0
    while (usedCols.has(col)) col++

    const totalCols = Math.max(col + 1, ...overlapping.map((p) => p.totalCols), 1)
    const entry: PlacedEvent = { ...ev, col, totalCols }
    placed.push(entry)
    // Widen earlier events that now have a new neighbour
    overlapping.forEach((p) => {
      if (p.totalCols < totalCols) p.totalCols = totalCols
    })
  }

  return placed
}

// ─── Event block ──────────────────────────────────────────────────────────────

function EventBlock({ ev }: { ev: PlacedEvent }) {
  const topPx = Math.max(0, (ev.startMin - GRID_START_MIN) * PX_PER_MIN)
  const heightPx = Math.max(MIN_EVENT_H, ev.durationMinutes * PX_PER_MIN - 2)
  const leftPct = (ev.col / ev.totalCols) * 100
  const widthPct = (1 / ev.totalCols) * 100
  const tall = heightPx >= 44

  const colorClass = ev.isAdHoc
    ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-600/60 text-amber-900 dark:text-amber-100'
    : ev.provider === 'microsoft'
      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-600/50 text-indigo-900 dark:text-indigo-100'
      : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-600/50 text-blue-900 dark:text-blue-100'

  const providerDot =
    ev.provider === 'google'
      ? 'bg-blue-400'
      : ev.provider === 'microsoft'
        ? 'bg-indigo-400'
        : 'bg-amber-400'

  return (
    <div
      className={`absolute border rounded-lg overflow-hidden select-none ${colorClass}`}
      style={{
        top: topPx + 1,
        height: heightPx,
        left: `calc(${leftPct}% + 4px)`,
        width: `calc(${widthPct}% - 6px)`,
        zIndex: 10,
      }}
    >
      {/* Coloured left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${providerDot}`} />

      <div className="pl-3 pr-2 py-1 h-full flex flex-col justify-center">
        <p className="text-[11px] font-semibold leading-tight truncate">
          {ev.isAdHoc && <span className="mr-0.5">⚡</span>}
          {ev.title}
        </p>
        {tall && (
          <p className="text-[10px] opacity-60 mt-0.5 leading-tight truncate">
            {minToLabel(ev.startMin)} – {minToLabel(ev.endMin)}
            {' · '}{formatDuration(ev.durationMinutes)}
            {ev.isRecurring && ' · ↻'}
            {ev.isAdHoc && ev.endedEarly && ' · ended early'}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CalendarPanel({ routine }: CalendarPanelProps) {
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState(false)
  const [nowMin, setNowMin] = useState(getNowMin)

  const nowLineRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sync → fetch
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    syncCalendar()
      .catch(() => setSyncError(true))
      .then(() => getEventsForDay(today))
      .then((r) => setCalEvents(r.events))
      .catch(() => setCalEvents([]))
      .finally(() => setLoading(false))
  }, [])

  // Tick now-line every minute
  useEffect(() => {
    const id = setInterval(() => setNowMin(getNowMin()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Scroll to current time once grid is ready
  useEffect(() => {
    if (!loading && nowLineRef.current) {
      nowLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [loading])

  // ── Merge events ────────────────────────────────────────────────────────────

  const adHocMeetings = (routine?.meetings ?? []).filter((m) => m.isAdHoc)

  const allEvents: TimelineEvent[] = [
    ...calEvents.map((e) => ({
      id: e.id,
      title: e.title,
      startMin: isoToLocalMin(e.startTime),
      endMin: isoToLocalMin(e.endTime),
      durationMinutes: e.durationMinutes,
      isAdHoc: false,
      provider: e.provider,
      isRecurring: e.isRecurring,
    })),
    ...adHocMeetings.map((m) => ({
      id: m._id,
      title: m.title,
      startMin: hhmmToMin(m.startTime),
      endMin: hhmmToMin(m.endTime),
      durationMinutes: m.durationMinutes,
      isAdHoc: true,
      endedEarly: m.endedEarly,
    })),
  ]

  const placed = layoutEvents(allEvents)
  const nowInGrid = nowMin >= GRID_START_MIN && nowMin <= GRID_END_MIN
  const nowTopPx = (nowMin - GRID_START_MIN) * PX_PER_MIN

  // ── Header meta ─────────────────────────────────────────────────────────────

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const totalCount = placed.length
  const adHocCount = placed.filter((e) => e.isAdHoc).length

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col gap-3 pt-1">
        <div className="h-5 w-48 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
        <div className="space-y-2">
          {[80, 56, 96].map((h, i) => (
            <div
              key={i}
              className="bg-stone-100 dark:bg-stone-800 rounded-xl animate-pulse"
              style={{ height: h }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4 shrink-0">
        <div>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{dateLabel}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            {totalCount === 0
              ? 'No meetings scheduled'
              : `${totalCount} meeting${totalCount !== 1 ? 's' : ''}${adHocCount > 0 ? ` · ${adHocCount} added manually` : ''}`}
          </p>
        </div>

        {syncError && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-2.5 py-1 rounded-full shrink-0">
            ⚠ Sync error — reconnect in Settings
          </span>
        )}
      </div>

      {/* ── Legend ── */}
      {totalCount > 0 && (
        <div className="flex items-center gap-4 mb-3 shrink-0">
          {calEvents.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 shrink-0" />
              Calendar
            </span>
          )}
          {adHocCount > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shrink-0" />
              Added manually
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
            <span className="w-2.5 h-0.5 bg-rose-400 shrink-0 rounded" />
            Now
          </span>
        </div>
      )}

      {/* ── Day grid ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-center">
            <p className="text-3xl">📅</p>
            <p className="text-sm font-medium text-stone-600 dark:text-stone-300">No meetings today</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 max-w-[200px]">
              Connect your calendar in Settings to see events here.
            </p>
          </div>
        ) : (
          <div className="flex pb-4">

            {/* Time label column */}
            <div className="w-14 shrink-0 relative" style={{ height: GRID_HEIGHT }}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute right-0 pr-2"
                  style={{ top: (h - GRID_START_HOUR) * HOUR_H - 8 }}
                >
                  <span className="text-[10px] font-medium text-stone-400 dark:text-stone-600 leading-none">
                    {formatHourLabel(h)}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid + events */}
            <div
              className="flex-1 relative border-l border-stone-200 dark:border-stone-700"
              style={{ height: GRID_HEIGHT }}
            >
              {/* Hour lines */}
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-stone-100 dark:border-stone-800"
                  style={{ top: (h - GRID_START_HOUR) * HOUR_H }}
                />
              ))}

              {/* Half-hour dashed lines */}
              {HOURS.slice(0, -1).map((h) => (
                <div
                  key={`${h}h`}
                  className="absolute left-0 right-0 border-t border-dashed border-stone-100/70 dark:border-stone-800/60"
                  style={{ top: (h - GRID_START_HOUR) * HOUR_H + HOUR_H / 2 }}
                />
              ))}

              {/* Now indicator */}
              {nowInGrid && (
                <div
                  ref={nowLineRef}
                  className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                  style={{ top: nowTopPx }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-[5px] shrink-0 shadow-sm" />
                  <div className="flex-1 border-t border-rose-500" />
                  <span className="text-[9px] text-rose-500 font-medium pl-1 pr-1">
                    {minToLabel(nowMin)}
                  </span>
                </div>
              )}

              {/* Events */}
              {placed.map((ev) => (
                <EventBlock key={ev.id} ev={ev} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
