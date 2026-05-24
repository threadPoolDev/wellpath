// Shared enums — no UI strings, no platform-specific values.
// Both apps/web and apps/mobile import from here.

export const APP_NAME = 'WellPath'

// ─── Task categories ──────────────────────────────────────────────────────────

export const TASK_CATEGORIES = [
  'hydration', 'exercise', 'nutrition', 'focus_work',
  'break', 'commute', 'family', 'medicine',
  'wind_down', 'learning', 'social', 'mindfulness',
] as const

export type TaskCategory = typeof TASK_CATEGORIES[number]

// These categories are never shared with groups — excluded at DB query level.
export const PRIVATE_TASK_CATEGORIES = ['medicine', 'family'] as const

// ─── Day & check-in enums ────────────────────────────────────────────────────

export const DAY_TYPES = {
  LIGHT:    'light',
  MODERATE: 'moderate',
  PACKED:   'packed',
} as const

export const ENERGY_LEVELS = ['low', 'medium', 'high'] as const
export type EnergyLevel = typeof ENERGY_LEVELS[number]

export const MOOD_OPTIONS = ['great', 'okay', 'tired', 'stressed'] as const
export type MoodOption = typeof MOOD_OPTIONS[number]

export const CHECKIN_RESPONSES = ['done', 'missed', 'ended_early', 'skipped'] as const
export type CheckinResponse = typeof CHECKIN_RESPONSES[number]

// ─── Profile enums ───────────────────────────────────────────────────────────

export const DIET_OPTIONS = ['veg', 'vegan', 'non_veg', 'eggetarian', 'jain'] as const
export type DietOption = typeof DIET_OPTIONS[number]

export const EXERCISE_OPTIONS = ['walk', 'gym', 'yoga', 'home_workout', 'none', 'open'] as const
export type ExerciseOption = typeof EXERCISE_OPTIONS[number]

export const PEAK_WINDOWS = [
  'early_morning', 'morning', 'afternoon', 'evening', 'night',
] as const
export type PeakWindow = typeof PEAK_WINDOWS[number]

export const WORK_MODES = ['wfh', 'office', 'hybrid'] as const
export type WorkMode = typeof WORK_MODES[number]

export const RELATIONSHIP_STATUSES = ['single', 'partnered', 'married'] as const
export type RelationshipStatus = typeof RELATIONSHIP_STATUSES[number]

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const ONBOARDING_LAYERS = {
  ESSENTIAL:    'essential',
  CONTEXTUAL:   'contextual',
  DEEP_PROFILE: 'deep_profile',
} as const

export const ONBOARDING_STEPS = [
  'role_work', 'location', 'commute', 'health_medicines',
  'sleep_energy', 'personal_life', 'calendar', 'photo',
] as const

export const METRO_CITIES = [
  'delhi', 'mumbai', 'bengaluru', 'bangalore', 'chennai',
  'hyderabad', 'kolkata', 'pune', 'ahmedabad', 'surat',
  'london', 'new york', 'singapore', 'dubai',
] as const

// ─── Groups & sharing ────────────────────────────────────────────────────────

export const SHARING_PREFERENCES = {
  COMPLETION_ONLY:  'completion_only',
  WITH_TASK_DETAIL: 'with_task_detail',
  WITH_REASONS:     'with_reasons',
} as const

export type SharingPreference = typeof SHARING_PREFERENCES[keyof typeof SHARING_PREFERENCES]

export const GROUP_INVITE_EXPIRY_DAYS = 7

// ─── Insights (PR #20) ───────────────────────────────────────────────────────

export const INSIGHT_TYPES = ['pattern', 'positive', 'observation', 'weekly_summary'] as const
export const INSIGHT_CATEGORIES = ['energy', 'completion', 'meetings', 'exercise'] as const
export const INSIGHT_CACHE_TTL_HOURS = 24
export const INSIGHTS_MIN_DATA_DAYS = 3
export const INSIGHTS_LOOKBACK_DAYS = 30
export const MOOD_GRAPH_DAYS = 14
export const ENERGY_LEVEL_SCORES: Record<string, number> = { low: 1, medium: 2, high: 3 }

// ─── Notifications ───────────────────────────────────────────────────────────

export const NOTIFICATION_TYPES = [
  'task_reminder', 'checkin_prompt', 'morning_checkin',
  'evening_summary', 'free_time_suggestion',
] as const
