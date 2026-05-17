import { METRO_CITIES } from '@/constants'

export type QuestionType =
  | 'text_input'
  | 'single_select'
  | 'multi_select'
  | 'time_picker'
  | 'yes_no'
  | 'medicine_form'
  | 'calendar_connect'
  | 'photo_upload'

export interface SelectOption {
  value: string
  label: string
}

export interface MedicineEntry {
  nameOrNickname: string
  timings: string[]
  withFood: 'yes' | 'no' | 'not_sure'
  isCritical: 'yes' | 'no' | 'not_sure'
  reminderEnabled: boolean
}

export interface OnboardingQuestion {
  id: string
  layer: 'essential'
  category: string
  text: string
  subtext?: string
  type: QuestionType
  options?: SelectOption[] | ((answers: Record<string, unknown>) => SelectOption[])
  weight: number
  skippable: boolean
  showIf?: (answers: Record<string, unknown>) => boolean
}

export const essentialQuestions: OnboardingQuestion[] = [
  // ─── Q1: Name ─────────────────────────────────────────────────────────────────
  {
    id: 'name',
    layer: 'essential',
    category: 'About You',
    text: "What's your name?",
    type: 'text_input',
    weight: 8,
    skippable: false,
  },

  // ─── Q2: Role ─────────────────────────────────────────────────────────────────
  {
    id: 'role',
    layer: 'essential',
    category: 'About You',
    text: 'What best describes you?',
    type: 'single_select',
    options: [
      { value: 'student', label: 'Student' },
      { value: 'professional', label: 'Working Professional' },
      { value: 'business_owner', label: 'Business Owner' },
      { value: 'freelancer', label: 'Freelancer' },
      { value: 'homemaker', label: 'Homemaker' },
    ],
    weight: 8,
    skippable: false,
  },

  // ─── Business Owner Fork ──────────────────────────────────────────────────────
  {
    id: 'bo_calendar_tool',
    layer: 'essential',
    category: 'Your Work',
    text: 'Which calendar do you use for work?',
    subtext: "This helps us understand your meeting load even without connecting your calendar right now.",
    type: 'single_select',
    options: [
      { value: 'google', label: 'Google Calendar' },
      { value: 'microsoft', label: 'Microsoft / Outlook' },
      { value: 'both', label: 'Both' },
      { value: 'none', label: "I don't use one" },
    ],
    weight: 4,
    skippable: false,
    showIf: (a) => a.role === 'business_owner',
  },
  {
    id: 'bo_manual_start',
    layer: 'essential',
    category: 'Your Day',
    text: 'When does your workday usually start?',
    type: 'time_picker',
    weight: 3,
    skippable: true,
    showIf: (a) => a.role === 'business_owner' && a.bo_calendar_tool === 'none',
  },
  {
    id: 'bo_manual_end',
    layer: 'essential',
    category: 'Your Day',
    text: 'When does it usually wrap up?',
    type: 'time_picker',
    weight: 3,
    skippable: true,
    showIf: (a) => a.role === 'business_owner' && a.bo_calendar_tool === 'none',
  },
  {
    id: 'bo_avg_meetings',
    layer: 'essential',
    category: 'Your Day',
    text: 'On a typical day, how many meetings do you have?',
    type: 'single_select',
    options: [
      { value: '1_2', label: '1–2 meetings' },
      { value: '3_4', label: '3–4 meetings' },
      { value: '5_plus', label: '5 or more' },
      { value: 'varies', label: 'Varies a lot' },
    ],
    weight: 3,
    skippable: true,
    showIf: (a) => a.role === 'business_owner' && a.bo_calendar_tool === 'none',
  },
  {
    id: 'bo_deep_work',
    layer: 'essential',
    category: 'Your Energy',
    text: "When's your best time for deep, focused work?",
    type: 'single_select',
    options: [
      { value: 'early_morning', label: 'Early morning (before 8am)' },
      { value: 'morning', label: 'Morning (8am–12pm)' },
      { value: 'afternoon', label: 'Afternoon (12pm–5pm)' },
      { value: 'evening', label: 'Evening (after 5pm)' },
      { value: 'varies', label: 'It varies' },
    ],
    weight: 3,
    skippable: false,
    showIf: (a) => a.role === 'business_owner',
  },
  {
    id: 'bo_interruption',
    layer: 'essential',
    category: 'Your Work',
    text: 'How often do unplanned interruptions break your focus?',
    type: 'single_select',
    options: [
      { value: 'rarely', label: 'Rarely — I usually get good blocks' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'constantly', label: "Constantly — it's hard to focus" },
    ],
    weight: 3,
    skippable: true,
    showIf: (a) => a.role === 'business_owner',
  },
  {
    id: 'bo_hard_to_switch_off',
    layer: 'essential',
    category: 'Your Work',
    text: 'Do you find it hard to switch off from work at the end of the day?',
    type: 'single_select',
    options: [
      { value: 'yes', label: 'Yes, I struggle to stop' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'no', label: 'Not usually' },
    ],
    weight: 3,
    skippable: true,
    showIf: (a) => a.role === 'business_owner',
  },
  {
    id: 'bo_lunch_habit',
    layer: 'essential',
    category: 'Your Health',
    text: 'What does lunch usually look like for you?',
    type: 'single_select',
    options: [
      { value: 'proper_meal', label: 'A proper sit-down meal' },
      { value: 'quick_bite', label: 'A quick bite at my desk' },
      { value: 'often_skip', label: 'I often skip it' },
    ],
    weight: 3,
    skippable: true,
    showIf: (a) => a.role === 'business_owner',
  },

  // ─── Q3: Work Mode ────────────────────────────────────────────────────────────
  {
    id: 'work_mode',
    layer: 'essential',
    category: 'Your Work',
    text: 'Work from home, office, or both?',
    type: 'single_select',
    options: [
      { value: 'wfh', label: 'From home' },
      { value: 'office', label: 'At the office' },
      { value: 'hybrid', label: 'A mix of both' },
    ],
    weight: 8,
    skippable: false,
  },

  // ─── Q4: City ─────────────────────────────────────────────────────────────────
  {
    id: 'city',
    layer: 'essential',
    category: 'Your Location',
    text: 'What city are you in?',
    subtext: 'This helps us factor in commute and timezone.',
    type: 'text_input',
    weight: 8,
    skippable: false,
  },

  // ─── Q5: Commute Mode ─────────────────────────────────────────────────────────
  {
    id: 'commute_mode',
    layer: 'essential',
    category: 'Your Commute',
    text: 'How do you get to work?',
    type: 'single_select',
    options: (answers) => {
      const city = ((answers.city as string) ?? '').toLowerCase().trim()
      const isMetro = (METRO_CITIES as readonly string[]).includes(city)
      const modes = [
        { value: 'car', label: 'Car' },
        { value: 'bus', label: 'Bus' },
        { value: 'walk', label: 'Walk' },
        { value: 'cycle', label: 'Cycle' },
        { value: 'two_wheeler', label: 'Two-wheeler' },
      ]
      if (isMetro) modes.splice(1, 0, { value: 'metro', label: 'Metro / Subway' })
      return modes
    },
    weight: 6,
    skippable: true,
    showIf: (a) => a.work_mode !== 'wfh',
  },

  // ─── Q6a: Work Start Time ────────────────────────────────────────────────────
  {
    id: 'work_start_time',
    layer: 'essential',
    category: 'Your Day',
    text: 'When does your workday start?',
    type: 'time_picker',
    weight: 6,
    skippable: false,
  },

  // ─── Q6b: Work End Time ──────────────────────────────────────────────────────
  {
    id: 'work_end_time',
    layer: 'essential',
    category: 'Your Day',
    text: 'When does it usually wrap up?',
    type: 'time_picker',
    weight: 4,
    skippable: false,
  },

  // ─── Q7: Peak Window ─────────────────────────────────────────────────────────
  {
    id: 'peak_window',
    layer: 'essential',
    category: 'Your Energy',
    text: 'When do you feel most focused and energised?',
    type: 'single_select',
    options: [
      { value: 'early_morning', label: 'Early morning' },
      { value: 'morning', label: 'Morning' },
      { value: 'afternoon', label: 'Afternoon' },
      { value: 'evening', label: 'Evening' },
      { value: 'night', label: 'Night' },
    ],
    weight: 8,
    skippable: false,
  },

  // ─── Q8: Medicines ───────────────────────────────────────────────────────────
  {
    id: 'takes_medicines',
    layer: 'essential',
    category: 'Your Health',
    text: 'Do you take any medicines at specific times of day?',
    subtext: 'WellPath will send gentle reminders — nothing more. Your information stays private.',
    type: 'yes_no',
    weight: 7,
    skippable: false,
  },
  {
    id: 'medicines',
    layer: 'essential',
    category: 'Your Health',
    text: "Let's add your medicines",
    subtext: "Add up to 5. Use any name you like — WellPath doesn't need the exact medicine name.",
    type: 'medicine_form',
    weight: 6,
    skippable: true,
    showIf: (a) => a.takes_medicines === 'yes',
  },

  // ─── Q9: Calendar Connect ─────────────────────────────────────────────────────
  {
    id: 'calendar_connect',
    layer: 'essential',
    category: 'Your Calendar',
    text: 'Connect your calendar for smarter routines',
    subtext: "WellPath reads your events to build a routine around your day — read-only, never writes anything.",
    type: 'calendar_connect',
    weight: 5,
    // "Connect later from Settings" is an explicit in-card option — external skip not needed
    skippable: false,
  },

  // ─── Q10: Profile Photo ──────────────────────────────────────────────────────
  {
    id: 'photo',
    layer: 'essential',
    category: 'Your Profile',
    text: 'Add a photo so friends recognise you in groups',
    subtext: 'Completely optional — your initials will show if you skip.',
    type: 'photo_upload',
    weight: 5,
    skippable: true,
  },
]
