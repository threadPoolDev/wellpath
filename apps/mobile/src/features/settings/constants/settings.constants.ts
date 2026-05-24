export const SETTINGS_QUERY_KEYS = {
  PROFILE: 'userProfile',
} as const

export const SETTINGS_STRINGS = {
  TITLE: 'Settings',
  PROFILE_SECTION: 'Profile',
  ACCOUNT_SECTION: 'Account',
  NOTIFICATIONS_SECTION: 'Notifications',
  SHARING_SECTION: 'Groups & Sharing',
  TRAVEL_SECTION: 'Travel mode',
  SIGN_OUT: 'Sign out',
  SIGN_OUT_CONFIRM: 'Are you sure you want to sign out?',
  SIGN_OUT_CANCEL: 'Cancel',
  SAVE: 'Save changes',
  SAVED: 'Saved ✓',
  TRAVEL_COMING_SOON: 'Travel mode is coming soon',
  TRAVEL_COMING_SOON_SUBTEXT: 'Activate when you\'re working from a hotel or taking a trip — your routine adapts instantly.',
} as const

export const TRAVEL_MODE_OPTIONS = [
  { value: 'work_trip', label: 'Work trip ✈️', description: 'Hotel-friendly exercise, no home commute' },
  { value: 'vacation_minimal', label: 'Vacation — light 🌿', description: 'Medicines + one enjoyment task' },
  { value: 'vacation_paused', label: 'Vacation — quiet 🔕', description: 'Medicines only' },
  { value: 'different_location', label: 'Different location 🗺️', description: 'Normal routine, no commute' },
] as const

export const WORK_MODE_OPTIONS = [
  { value: 'wfh', label: 'Work from home' },
  { value: 'office', label: 'Office' },
  { value: 'hybrid', label: 'Hybrid' },
] as const
