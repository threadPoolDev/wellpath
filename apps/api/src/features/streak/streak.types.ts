import type { STREAK_DAY_STATUSES } from '../../constants/index.js'

export type StreakDayStatus = (typeof STREAK_DAY_STATUSES)[number]

export interface StreakDay {
  date: string        // "2025-05-16"
  status: StreakDayStatus
}

export interface StreakResponse {
  current: number
  personalBest: number
  graceDaysUsedThisWeek: number
  graceRemaining: number
  totalDaysCompleted: number
  last30Days: StreakDay[]
}
