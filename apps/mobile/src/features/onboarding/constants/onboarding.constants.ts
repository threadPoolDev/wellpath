export const SWIPE_THRESHOLD = 80        // px — minimum swipe distance to trigger navigation
export const SWIPE_ROTATE_FACTOR = 0.04  // deg per px of swipe
export const CARD_EXIT_DISTANCE = 500    // px — off-screen exit distance
export const CARD_SPRING = { damping: 20, stiffness: 300 }

export const MAX_MEDICINES = 5

export const ONBOARDING_STRINGS = {
  SKIP: 'Skip for now',
  CONTINUE: 'Continue →',
  BACK: '← Back',
  SWIPE_HINT: 'Swipe right to continue · Swipe left to skip',
  PROGRESS_LABELS: {
    '0-30':  'Just getting started…',
    '31-60': 'Getting to know you…',
    '61-85': 'Almost there…',
    '86-99': 'One more thing…',
    '100':   'All set! Building your first routine ✨',
  },
  MEDICINE_ADD: '+ Add medicine',
  MEDICINE_DISCLAIMER:
    "WellPath reminders are gentle nudges, not medical advice. Always follow your doctor's guidance.",
  CALENDAR_SKIP: 'Connect later from Settings',
  PHOTO_SKIP: 'Skip — use my initials',
  PHOTO_CHANGE: 'Change photo',
  COMPLETING: 'Setting up your routine…',
} as const

export const ONBOARDING_QUERY_KEYS = {
  SESSION: ['onboarding', 'session'] as const,
} as const

export const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

export const MEDICINE_WITH_FOOD_OPTIONS = [
  { value: 'yes', label: 'With food' },
  { value: 'no', label: 'Without food' },
  { value: 'not_sure', label: "I'm not sure" },
] as const

export const MEDICINE_CRITICAL_OPTIONS = [
  { value: 'yes', label: 'Yes, missing a dose matters' },
  { value: 'no', label: 'No, it can wait' },
  { value: 'not_sure', label: "I'm not sure" },
] as const
