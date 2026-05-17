import { useState } from 'react'

const DISMISSED_KEY = 'calendar_banner_dismissed'

interface CalendarConnectBannerProps {
  /** Pass the stored calendar_connect answer from onboarding ('google' | 'microsoft' | 'later' | null) */
  calendarPreference?: string | null
}

export function CalendarConnectBanner({ calendarPreference }: CalendarConnectBannerProps) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === '1'
  )

  // Only show if user deferred calendar connect and hasn't dismissed the banner
  if (calendarPreference !== 'later' && calendarPreference !== null && calendarPreference !== undefined) return null
  if (dismissed) return null

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="bg-sage-50 border border-sage-200 rounded-2xl px-5 py-4 flex items-start gap-3">
      <span className="text-xl shrink-0 mt-0.5">📅</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800">
          Connect your calendar for a smarter routine
        </p>
        <p className="text-xs text-stone-500 mt-0.5">
          WellPath builds around your actual day — meetings, free slots, and all.
        </p>
        <button
          type="button"
          className="mt-2 text-xs font-semibold text-sage-700 hover:text-sage-900 transition-colors"
          onClick={() => {
            // Will navigate to Settings → Calendar when PR #16 is built
            dismiss()
          }}
        >
          Connect in Settings →
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="text-stone-300 hover:text-stone-500 transition-colors text-sm shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
