export const APP_NAME = 'WellPath'

export const ONBOARDING_LAYERS = {
  ESSENTIAL: 'essential',
  CONTEXTUAL: 'contextual',
  DEEP_PROFILE: 'deep_profile',
} as const

export const ONBOARDING_STEPS = [
  'role_work',
  'location',
  'commute',
  'health_medicines',
  'sleep_energy',
  'personal_life',
  'calendar',
  'photo',
] as const

export const METRO_CITIES = [
  'delhi',
  'mumbai',
  'bengaluru',
  'bangalore',
  'chennai',
  'hyderabad',
  'kolkata',
  'pune',
  'ahmedabad',
  'surat',
  'london',
  'new york',
  'singapore',
  'dubai',
] as const

export const DIET_OPTIONS = ['veg', 'vegan', 'non_veg', 'eggetarian', 'jain'] as const

export const EXERCISE_OPTIONS = [
  'walk',
  'gym',
  'yoga',
  'home_workout',
  'none',
  'open',
] as const

export const PEAK_WINDOWS = [
  'early_morning',
  'morning',
  'afternoon',
  'evening',
  'night',
] as const

export const ENERGY_LEVELS = ['low', 'medium', 'high'] as const
export const MOOD_OPTIONS = ['great', 'okay', 'tired', 'stressed'] as const

export const SWIPE = {
  THRESHOLD_PX: 80,
  TRANSITION_MS: 200,
  MAX_ROTATION_DEG: 5,
} as const

export const ONBOARDING_PROGRESS_LABELS: Record<string, string> = {
  '0-30': 'Just getting started...',
  '31-60': 'Getting to know you...',
  '61-85': 'Almost there...',
  '86-99': 'One more thing...',
  '100': 'All set! Building your first routine ✨',
}

export const SHARING_PREFERENCES = {
  COMPLETION_ONLY: 'completion_only',
  WITH_TASK_DETAIL: 'with_task_detail',
  WITH_REASONS: 'with_reasons',
} as const

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  GROUPS: '/groups',
  HISTORY: '/history',
  SETTINGS: '/settings',
} as const
