export const DASHBOARD_QUERY_KEYS = {
  TODAY_ROUTINE: 'todayRoutine',
  MORNING_STATUS: 'morningStatus',
  EVENING_STATUS: 'eveningStatus',
} as const

export const ENERGY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const MOOD_LABELS: Record<string, string> = {
  great: 'Great',
  okay: 'Okay',
  tired: 'Tired',
  stressed: 'Stressed',
}

export const DAY_TYPE_LABELS: Record<string, string> = {
  light: 'Light day',
  moderate: 'Moderate day',
  packed: 'Packed day',
}

export const CATEGORY_ICONS: Record<string, string> = {
  hydration: '💧',
  exercise: '🏃',
  nutrition: '🥗',
  focus_work: '🎯',
  break: '☕',
  commute: '🚌',
  family: '👨‍👩‍👧',
  medicine: '💊',
  wind_down: '🌙',
  learning: '📚',
  social: '💬',
  mindfulness: '🧘',
}

export const MORNING_CHECKIN_STEPS = ['energy', 'mood', 'note'] as const
export type MorningCheckinStep = (typeof MORNING_CHECKIN_STEPS)[number]

export const ENERGY_OPTIONS = [
  { value: 'low', label: 'Low energy', emoji: '😴' },
  { value: 'medium', label: 'Feeling okay', emoji: '😐' },
  { value: 'high', label: 'Energised', emoji: '⚡' },
] as const

export const MOOD_OPTIONS = [
  { value: 'great', label: 'Great', emoji: '😄' },
  { value: 'okay', label: 'Okay', emoji: '🙂' },
  { value: 'tired', label: 'Tired', emoji: '😔' },
  { value: 'stressed', label: 'Stressed', emoji: '😤' },
] as const

export const RATING_OPTIONS = [1, 2, 3, 4, 5] as const

export const TASK_STATUS_COLORS = {
  done: '#a8a29e',      // stone-400 — muted tick
  pending: '#1c1917',   // stone-900
  missed: '#e7c3b5',    // warm rose — never harsh red
  skipped: '#d6d3d1',   // stone-300
} as const

export const EVENING_SUMMARY_HOUR = 20 // 8pm

export const DASHBOARD_STRINGS = {
  GOOD_MORNING: 'Good morning',
  GOOD_AFTERNOON: 'Good afternoon',
  GOOD_EVENING: 'Good evening',
  MORNING_CHECKIN_PROMPT: 'How are you starting the day?',
  MORNING_CHECKIN_SUBTEXT: 'Takes less than a minute',
  NO_ROUTINE_YET: 'Building your routine…',
  NO_ROUTINE_SUBTEXT: 'Your routine will appear here once your check-in is done.',
  UPCOMING_LABEL: 'Upcoming',
  DONE_LABEL: 'Done',
  MISSED_LABEL: 'Missed',
  EVENING_PROMPT: 'How did today go?',
  EVENING_SUBTEXT: 'A quick wrap-up — no pressure.',
} as const
