// ─── Location ────────────────────────────────────────────────────────────────

export const CITY_TYPES = {
  METRO: 'metro',
  TIER2: 'tier2',
  RURAL: 'rural',
} as const

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

// ─── User Profile ─────────────────────────────────────────────────────────────

export const AUTH_PROVIDERS = ['email', 'google', 'microsoft'] as const

export const USER_ROLES = [
  'student',
  'professional',
  'business_owner',
  'freelancer',
  'homemaker',
] as const

export const WORK_SHIFTS = {
  INDIA: { label: 'India', timezone: 'Asia/Kolkata' },
  UK: { label: 'UK', timezone: 'Europe/London' },
  USA: { label: 'USA', timezone: 'America/New_York' },
  OTHER: { label: 'Other', timezone: null },
} as const

export const WORK_MODES = ['wfh', 'office', 'hybrid'] as const

export const COMMUTE_MODES = [
  'car',
  'metro',
  'bus',
  'walk',
  'cycle',
  'two_wheeler',
  'wfh',
] as const

export const METRO_ACTIVITIES = [
  'reading',
  'meditation',
  'learning',
  'music',
  'podcasts',
] as const

export const TAKES_MEDICINES = ['yes', 'no', 'prefer_not_to_say'] as const

export const WITH_FOOD_OPTIONS = ['yes', 'no', 'not_sure'] as const

export const IS_CRITICAL_OPTIONS = ['yes', 'no', 'not_sure'] as const

export const DIET_TYPES = ['veg', 'vegan', 'non_veg', 'eggetarian', 'jain'] as const

export const EXERCISE_PREFERENCES = [
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

export const FEELING_OPTIONS = ['usually', 'sometimes', 'rarely'] as const

export const RELATIONSHIP_STATUSES = ['single', 'partnered', 'married'] as const

// ─── Business Owner Profile ───────────────────────────────────────────────────

export const CALENDAR_TOOLS = ['google', 'microsoft', 'both', 'none'] as const

export const AVG_MEETINGS_PER_DAY = ['1_2', '3_4', '5_plus', 'varies'] as const

export const AVG_MEETING_DURATIONS = ['under_30', '30_60', 'over_60', 'mixed'] as const

export const PROTECTED_LUNCH_OPTIONS = ['always', 'sometimes', 'rarely'] as const

export const DEEP_WORK_PREFERENCES = [
  'early_morning',
  'morning',
  'afternoon',
  'evening',
  'varies',
] as const

export const INTERRUPTION_FREQUENCIES = [
  'rarely',
  'sometimes',
  'often',
  'constantly',
] as const

export const TEAM_DEPENDENCY_OPTIONS = ['yes', 'no', 'sometimes'] as const

export const SWITCH_OFF_OPTIONS = ['yes', 'sometimes', 'no'] as const

export const LUNCH_HABITS = ['proper_meal', 'quick_bite', 'often_skip'] as const

export const PHYSICAL_MOVEMENT_OPTIONS = ['yes', 'rarely', 'never'] as const

// ─── Calendar ─────────────────────────────────────────────────────────────────

export const CALENDAR_PROVIDERS = ['google', 'microsoft'] as const

// ─── AI ───────────────────────────────────────────────────────────────────────

export const AI_PROVIDERS = {
  OLLAMA: 'ollama',
  GEMINI: 'gemini',
} as const

// ─── Routine & Tasks ──────────────────────────────────────────────────────────

export const TASK_CATEGORIES = [
  'hydration',
  'exercise',
  'nutrition',
  'focus_work',
  'break',
  'commute',
  'family',
  'medicine',
  'wind_down',
  'learning',
  'social',
  'mindfulness',
] as const

export const PRIVATE_TASK_CATEGORIES = ['medicine', 'family'] as const

export const TASK_STATUSES = ['pending', 'done', 'missed', 'skipped'] as const

export const DAY_TYPES = {
  LIGHT: 'light',
  MODERATE: 'moderate',
  PACKED: 'packed',
} as const

export const DAY_TYPE_VALUES = ['light', 'moderate', 'packed'] as const

export const MEETING_PRIORITY_LEVELS = ['high', 'passive', 'unset'] as const

// ─── Check-ins ────────────────────────────────────────────────────────────────

export const CHECKIN_TYPES = [
  'morning',
  'task_completion',
  'task_missed',
  'evening_summary',
] as const

export const CHECKIN_RESPONSES = ['done', 'missed', 'skipped', 'ended_early'] as const

// ─── Notifications ────────────────────────────────────────────────────────────

export const NOTIFICATION_TYPES = [
  'task_reminder',
  'checkin_prompt',
  'morning_checkin',
  'evening_summary',
  'free_time_suggestion',
] as const

export const DELIVERY_STATUSES = ['pending', 'sent', 'failed'] as const

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const ONBOARDING_LAYERS = ['essential', 'contextual', 'deep_profile'] as const

export const QUESTION_TYPES = [
  'single_select',
  'multi_select',
  'time_picker',
  'text_input',
  'yes_no',
  'scale',
  'photo_upload',
  'calendar_connect',
] as const

// ─── Groups ───────────────────────────────────────────────────────────────────

export const MEMBER_ROLES = ['admin', 'member'] as const

export const MEMBER_STATUSES = ['active', 'invited', 'declined', 'left'] as const

export const INVITE_STATUSES = ['pending', 'accepted', 'declined', 'expired'] as const

export const SHARING_PREFERENCES = [
  'completion_only',
  'with_task_detail',
  'with_reasons',
] as const

// ─── Profile Photo ────────────────────────────────────────────────────────────

export const PROFILE_PHOTO = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  CLOUDINARY_FOLDER: 'wellpath/profile_photos',
  THUMBNAIL_WIDTH: 100,
  THUMBNAIL_HEIGHT: 100,
  FULL_WIDTH: 400,
  FULL_HEIGHT: 400,
} as const

// ─── Travel Time ──────────────────────────────────────────────────────────────

export const TRAVEL_TIME = {
  MAX_CALLS_PER_USER_PER_DAY: 10,
} as const

// ─── Groups (misc) ────────────────────────────────────────────────────────────

export const GROUP_INVITE_EXPIRY_DAYS = 7
export const GROUP_ACTIVITY_NOTIFICATION_HOUR = 20

// ─── Insights ─────────────────────────────────────────────────────────────────

export const INSIGHT_TYPES = ['pattern', 'positive', 'observation', 'weekly_summary'] as const

export const INSIGHT_CATEGORIES = ['energy', 'completion', 'meetings', 'exercise'] as const

export const INSIGHT_CACHE_TTL_HOURS = 24

export const INSIGHTS_MIN_DATA_DAYS = 3

export const INSIGHTS_LOOKBACK_DAYS = 30

export const MOOD_GRAPH_DAYS = 14

export const ENERGY_LEVEL_SCORES: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export const STREAK = {
  /** Minimum completion % on a day for it to count as a streak day */
  COMPLETION_THRESHOLD_PERCENT: 60,
  /** Grace days allowed per rolling 7-day window */
  GRACE_DAYS_PER_WEEK: 1,
  /** Milestone current-streak counts that trigger a push notification */
  MILESTONES: [3, 7, 14, 30, 60, 100] as number[],
} as const

export const STREAK_DAY_STATUSES = [
  'complete',
  'grace',
  'missed',
  'future',
  'pending',
] as const

export const STREAK_MILESTONE_COPY: Record<number, string> = {
  3: "Three days in. The hardest part is starting — you've done that.",
  7: "A full week. You're building something real.",
  14: 'Two weeks. This is becoming yours.',
  30: "A month of showing up. That's not a streak — that's a habit.",
  60: 'Two months. Most people never get here.',
  100: "One hundred days. You're extraordinary.",
}

// ─── Weekly Reflection ────────────────────────────────────────────────────────

export const WEEKLY_REFLECTION_RATINGS = [
  'exhausting',
  'tough',
  'okay',
  'good',
  'great',
] as const

export const WEEKLY_REFLECTION_TIMINGS = ['sunday_evening', 'monday_morning'] as const

export const WEEKLY_REFLECTION_DAY_TYPES = [
  'light',
  'moderate',
  'packed',
  'very_packed',
] as const

export const WEEKLY_REFLECTION = {
  /** How many days in advance the week preview covers */
  PREVIEW_DAYS: 5,
  /** Minimum free time (minutes) for a day to NOT be classified as very_packed */
  VERY_PACKED_MIN_FREE_MINUTES: 60,
  /** Meeting count threshold for very_packed */
  VERY_PACKED_MEETING_COUNT: 5,
  /** Sunday notification hour (user local time) */
  SUNDAY_NOTIFICATION_HOUR: 19,
  /** Monday reminder hour (user local time) */
  MONDAY_REMINDER_HOUR: 7,
} as const
