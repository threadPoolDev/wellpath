// Re-export shared enums from the monorepo constants package.
// No duplication — these live in packages/constants/src/index.ts.
export {
  APP_NAME,
  TASK_CATEGORIES,
  PRIVATE_TASK_CATEGORIES,
  DAY_TYPES,
  ENERGY_LEVELS,
  MOOD_OPTIONS,
  CHECKIN_RESPONSES,
  DIET_OPTIONS,
  EXERCISE_OPTIONS,
  PEAK_WINDOWS,
  WORK_MODES,
  RELATIONSHIP_STATUSES,
  ONBOARDING_LAYERS,
  ONBOARDING_STEPS,
  METRO_CITIES,
  SHARING_PREFERENCES,
  GROUP_INVITE_EXPIRY_DAYS,
  INSIGHT_TYPES,
  INSIGHT_CATEGORIES,
  INSIGHT_CACHE_TTL_HOURS,
  INSIGHTS_MIN_DATA_DAYS,
  INSIGHTS_LOOKBACK_DAYS,
  MOOD_GRAPH_DAYS,
  ENERGY_LEVEL_SCORES,
  NOTIFICATION_TYPES,
} from '@wellpath/constants'

// ─── Web-only constants ───────────────────────────────────────────────────────
// These are specific to the React + browser environment and are never shared
// with mobile (which uses Expo Router file-based paths, AsyncStorage, etc.)

export const SWIPE = {
  THRESHOLD_PX: 80,
  TRANSITION_MS: 200,
  MAX_ROTATION_DEG: 5,
} as const

export const ONBOARDING_PROGRESS_LABELS: Record<string, string> = {
  '0-30':  'Just getting started...',
  '31-60': 'Getting to know you...',
  '61-85': 'Almost there...',
  '86-99': 'One more thing...',
  '100':   'All set! Building your first routine ✨',
}

export const ROUTES = {
  LOGIN:      '/login',
  REGISTER:   '/register',
  ONBOARDING: '/onboarding',
  DASHBOARD:  '/dashboard',
  GROUPS:     '/groups',
  HISTORY:    '/history',
  SETTINGS:   '/settings',
} as const

export const NAV_VIEWS = {
  DASHBOARD: 'dashboard',
  ROUTINE:   'routine',
  GROUPS:    'groups',
  HISTORY:   'history',
  SETTINGS:  'settings',
} as const

export const DASHBOARD_PANELS = {
  TODAY:    'today',
  CALENDAR: 'calendar',
  CHECKIN:  'checkin',
} as const

export const NAV_WIDTH = {
  EXPANDED:  240,
  COLLAPSED: 64,
} as const

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
} as const

export const TRANSITION_MS = {
  NAV:     200,
  CONTENT: 150,
  GROUPS:  200,
} as const

export const LOCAL_STORAGE_KEYS = {
  NAV_COLLAPSED:   'nav_collapsed',
  ONBOARDING_HINT: 'onboarding_hint_shown',
  THEME:           'wellpath-theme',
} as const
