export const HISTORY_QUERY_KEYS = {
  MOOD_GRAPH: 'moodGraph',
  INSIGHTS: 'insights',
} as const

export const HISTORY_TABS = ['insights', 'past'] as const
export type HistoryTab = (typeof HISTORY_TABS)[number]

export const HISTORY_STRINGS = {
  TITLE: 'History',
  TAB_INSIGHTS: 'Trends',
  TAB_PAST: 'Past Routines',
  MOOD_GRAPH_CAPTION: 'Your energy and routine tend to move together',
  NO_INSIGHTS: 'Check back in a few days',
  NO_INSIGHTS_SUBTEXT: 'We need at least 3 days of check-ins to notice patterns 🌱',
  NO_PAST: 'No past routines yet',
  NO_PAST_SUBTEXT: 'Check back after your first day',
  INSIGHTS_DISABLED: 'Insights are turned off',
  INSIGHTS_DISABLED_SUBTEXT: 'You can turn them back on in Settings.',
  STREAK_COMING_SOON: 'Your streak will appear here',
  STREAK_COMING_SOON_SUBTEXT: 'Keep completing your daily check-ins — streaks are coming soon.',
} as const

export const INSIGHT_TYPE_ICONS: Record<string, string> = {
  pattern: '📅',
  positive: '✨',
  observation: '👀',
  weekly_summary: '📊',
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const ENERGY_DOT_HEIGHT = 80 // max height in px for graph dots
