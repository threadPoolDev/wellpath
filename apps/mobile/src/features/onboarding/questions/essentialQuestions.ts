import { METRO_CITIES } from '@wellpath/constants'

export type QuestionType =
  | 'text_input'
  | 'single_select'
  | 'multi_select'
  | 'time_picker'
  | 'yes_no'
  | 'medicine_form'
  | 'calendar_connect'
  | 'photo_upload'
  | 'commute_duration'

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

// Shared with web — same question IDs and showIf logic so backend data is consistent
export const essentialQuestions: OnboardingQuestion[] = [
  {
    id: 'name',
    layer: 'essential',
    category: 'About You',
    text: "What's your name?",
    type: 'text_input',
    weight: 8,
    skippable: false,
  },
  {
    id: 'role',
    layer: 'essential',
    category: 'About You',
    text: 'What best describes you?',
    type: 'single_select',
    options: [
      { value: 'student',        label: 'Student' },
      { value: 'professional',   label: 'Working Professional' },
      { value: 'business_owner', label: 'Business Owner' },
      { value: 'freelancer',     label: 'Freelancer' },
      { value: 'homemaker',      label: 'Homemaker' },
    ],
    weight: 8,
    skippable: false,
  },

  // Business Owner fork
  {
    id: 'bo_calendar_tool',
    layer: 'essential',
    category: 'Your Work',
    text: 'Which calendar do you use for work?',
    subtext: 'This helps us understand your meeting load.',
    type: 'single_select',
    options: [
      { value: 'google',    label: 'Google Calendar' },
      { value: 'microsoft', label: 'Microsoft / Outlook' },
      { value: 'both',      label: 'Both' },
      { value: 'none',      label: "I don't use one" },
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
    id: 'bo_deep_work',
    layer: 'essential',
    category: 'Your Energy',
    text: "When's your best time for deep, focused work?",
    type: 'single_select',
    options: [
      { value: 'early_morning', label: 'Early morning (before 8am)' },
      { value: 'morning',       label: 'Morning (8am–12pm)' },
      { value: 'afternoon',     label: 'Afternoon (12pm–5pm)' },
      { value: 'evening',       label: 'Evening (after 5pm)' },
      { value: 'varies',        label: 'It varies' },
    ],
    weight: 3,
    skippable: false,
    showIf: (a) => a.role === 'business_owner',
  },
  {
    id: 'bo_hard_to_switch_off',
    layer: 'essential',
    category: 'Your Work',
    text: 'Do you find it hard to switch off from work at end of day?',
    type: 'single_select',
    options: [
      { value: 'yes',       label: 'Yes, I struggle to stop' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'no',        label: 'Not usually' },
    ],
    weight: 3,
    skippable: true,
    showIf: (a) => a.role === 'business_owner',
  },

  // Work mode
  {
    id: 'work_mode',
    layer: 'essential',
    category: 'Your Work',
    text: 'Work from home, office, or both?',
    type: 'single_select',
    options: [
      { value: 'wfh',    label: 'From home' },
      { value: 'office', label: 'At the office' },
      { value: 'hybrid', label: 'A mix of both' },
    ],
    weight: 8,
    skippable: false,
  },

  // City
  {
    id: 'city',
    layer: 'essential',
    category: 'Your Location',
    text: 'What city are you in?',
    subtext: 'Helps us factor in commute and timezone.',
    type: 'text_input',
    weight: 8,
    skippable: false,
  },

  // Commute
  {
    id: 'commute_mode',
    layer: 'essential',
    category: 'Your Commute',
    text: 'How do you get to work?',
    type: 'single_select',
    options: (answers) => {
      const city = ((answers.city as string) ?? '').toLowerCase().trim()
      const isMetro = (METRO_CITIES as readonly string[]).includes(city)
      const modes: SelectOption[] = [
        { value: 'car',         label: 'Car' },
        { value: 'bus',         label: 'Bus' },
        { value: 'walk',        label: 'Walk' },
        { value: 'cycle',       label: 'Cycle' },
        { value: 'two_wheeler', label: 'Two-wheeler' },
      ]
      if (isMetro) modes.splice(1, 0, { value: 'metro', label: 'Metro / Subway' })
      return modes
    },
    weight: 6,
    skippable: true,
    showIf: (a) => a.work_mode !== 'wfh',
  },
  {
    id: 'home_area',
    layer: 'essential',
    category: 'Your Commute',
    text: 'Which area do you live in?',
    subtext: 'Neighbourhood or locality — not your full address.',
    type: 'text_input',
    weight: 4,
    skippable: false,
    showIf: (a) => a.work_mode !== 'wfh',
  },
  {
    id: 'office_area',
    layer: 'essential',
    category: 'Your Commute',
    text: 'And where is your office?',
    subtext: 'Area or locality is enough.',
    type: 'text_input',
    weight: 4,
    skippable: false,
    showIf: (a) => a.work_mode !== 'wfh',
  },
  {
    id: 'commute_duration',
    layer: 'essential',
    category: 'Your Commute',
    text: 'How long is your commute each way?',
    subtext: 'Approximate minutes — you can update this anytime.',
    type: 'commute_duration',
    weight: 4,
    skippable: true,
    showIf: (a) => a.work_mode !== 'wfh' && !!a.commute_mode,
  },

  // Work hours
  {
    id: 'work_start_time',
    layer: 'essential',
    category: 'Your Day',
    text: 'When does your workday start?',
    type: 'time_picker',
    weight: 6,
    skippable: false,
  },
  {
    id: 'work_end_time',
    layer: 'essential',
    category: 'Your Day',
    text: 'When does it usually wrap up?',
    type: 'time_picker',
    weight: 4,
    skippable: false,
  },

  // Peak window
  {
    id: 'peak_window',
    layer: 'essential',
    category: 'Your Energy',
    text: 'When do you feel most focused and energised?',
    type: 'single_select',
    options: [
      { value: 'early_morning', label: 'Early morning' },
      { value: 'morning',       label: 'Morning' },
      { value: 'afternoon',     label: 'Afternoon' },
      { value: 'evening',       label: 'Evening' },
      { value: 'night',         label: 'Night' },
    ],
    weight: 8,
    skippable: false,
  },

  // Medicines
  {
    id: 'takes_medicines',
    layer: 'essential',
    category: 'Your Health',
    text: 'Do you take any medicines at specific times of day?',
    subtext: 'WellPath sends gentle reminders. Your information stays private.',
    type: 'yes_no',
    weight: 7,
    skippable: false,
  },
  {
    id: 'medicines',
    layer: 'essential',
    category: 'Your Health',
    text: "Let's add your medicines",
    subtext: "Add up to 5. Use any name you like — we don't need the exact medicine name.",
    type: 'medicine_form',
    weight: 6,
    skippable: true,
    showIf: (a) => a.takes_medicines === 'yes',
  },

  // Calendar
  {
    id: 'calendar_connect',
    layer: 'essential',
    category: 'Your Calendar',
    text: 'Connect your calendar for smarter routines',
    subtext: 'Read-only — WellPath reads your events, never writes anything.',
    type: 'calendar_connect',
    weight: 5,
    skippable: false,
  },

  // Photo
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
