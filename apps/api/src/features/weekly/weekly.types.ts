import { WEEKLY_REFLECTION_RATINGS, WEEKLY_REFLECTION_DAY_TYPES } from '../../constants/index.js'

export interface CalendarPreviewDay {
  date: string
  dayType: (typeof WEEKLY_REFLECTION_DAY_TYPES)[number]
  meetingCount: number
}

export interface WeeklyReflectionInput {
  lastWeekRating: (typeof WEEKLY_REFLECTION_RATINGS)[number]
  oneWin?: string
  oneIntention?: string
  calendarPreview?: CalendarPreviewDay[]
}

export interface WeeklyReflectionResponse {
  weekStartDate: string
  reflection: {
    lastWeekRating: (typeof WEEKLY_REFLECTION_RATINGS)[number] | null
    oneWin: string | null
    oneIntention: string | null
    calendarPreview: CalendarPreviewDay[]
    aiWeeklyIntention: string | null
  }
  submittedAt: string | null
  skipped: boolean
}
