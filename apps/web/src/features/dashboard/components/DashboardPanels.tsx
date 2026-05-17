import { useNavStore } from '@/store/navStore'
import { Routine } from '@/features/routine/api'
import { DASHBOARD_PANELS, TRANSITION_MS } from '@/constants'
import { cn } from '@/lib/utils'
import { TodayPanel } from './TodayPanel'
import { CalendarPanel } from './CalendarPanel'
import { CheckinPanel } from './CheckinPanel'
import { isTaskActionable } from './TaskCard'

interface DashboardPanelsProps {
  routine: Routine | null
  checkinSubmitted: boolean
  onRoutineUpdate: (updated: Routine) => void
}

const TABS = [
  { key: DASHBOARD_PANELS.TODAY, label: 'Today' },
  { key: DASHBOARD_PANELS.CALENDAR, label: 'Calendar' },
  { key: DASHBOARD_PANELS.CHECKIN, label: 'Check-in' },
] as const

export function DashboardPanels({ routine, checkinSubmitted, onRoutineUpdate }: DashboardPanelsProps) {
  const activePanel = useNavStore((s) => s.dashboardPanel)
  const setDashboardPanel = useNavStore((s) => s.setDashboardPanel)

  const pendingCheckinCount = (routine?.tasks ?? []).filter(
    (t) => t.status === 'pending' && isTaskActionable(t.time)
  ).length

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setDashboardPanel(tab.key)}
            className={cn(
              'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors',
              activePanel === tab.key
                ? 'text-sage-700 dark:text-sage-400'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            )}
            style={{ transition: `color ${TRANSITION_MS.CONTENT}ms` }}
          >
            {tab.label}
            {tab.key === DASHBOARD_PANELS.CHECKIN && pendingCheckinCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sage-500 text-white text-[10px] font-bold leading-none">
                {pendingCheckinCount}
              </span>
            )}
            {/* Active underline */}
            {activePanel === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div
        className="flex-1 overflow-y-auto p-4 md:p-6"
        style={{ transition: `opacity ${TRANSITION_MS.CONTENT}ms` }}
      >
        {activePanel === DASHBOARD_PANELS.TODAY && (
          <TodayPanel
            routine={routine}
            checkinSubmitted={checkinSubmitted}
            onRoutineUpdate={onRoutineUpdate}
          />
        )}
        {activePanel === DASHBOARD_PANELS.CALENDAR && (
          <CalendarPanel routine={routine} />
        )}
        {activePanel === DASHBOARD_PANELS.CHECKIN && (
          <CheckinPanel routine={routine} onRoutineUpdate={onRoutineUpdate} />
        )}
      </div>
    </div>
  )
}
