import { apiClient } from '@/lib/apiClient'

export type StreakDayStatus = 'complete' | 'grace' | 'missed' | 'future' | 'pending'

export interface StreakDay {
  date: string
  status: StreakDayStatus
}

export interface StreakData {
  current: number
  personalBest: number
  graceDaysUsedThisWeek: number
  graceRemaining: number
  totalDaysCompleted: number
  last30Days: StreakDay[]
}

export async function fetchStreak(): Promise<StreakData> {
  return apiClient('/streak')
}
