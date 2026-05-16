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

export const WORK_SHIFTS = {
  INDIA: { label: 'India', timezone: 'Asia/Kolkata' },
  UK: { label: 'UK', timezone: 'Europe/London' },
  USA: { label: 'USA', timezone: 'America/New_York' },
  OTHER: { label: 'Other', timezone: null },
} as const

export const AI_PROVIDERS = {
  OLLAMA: 'ollama',
  GEMINI: 'gemini',
} as const

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

export const DAY_TYPES = {
  LIGHT: 'light',
  MODERATE: 'moderate',
  PACKED: 'packed',
} as const

export const NOTIFICATION_TYPES = [
  'task_reminder',
  'checkin_prompt',
  'morning_checkin',
  'evening_summary',
  'free_time_suggestion',
] as const

export const PROFILE_PHOTO = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  CLOUDINARY_FOLDER: 'wellpath/profile_photos',
  THUMBNAIL_WIDTH: 100,
  THUMBNAIL_HEIGHT: 100,
  FULL_WIDTH: 400,
  FULL_HEIGHT: 400,
} as const

export const TRAVEL_TIME = {
  MAX_CALLS_PER_USER_PER_DAY: 10,
} as const

export const GROUP_INVITE_EXPIRY_DAYS = 7
export const GROUP_ACTIVITY_NOTIFICATION_HOUR = 20
