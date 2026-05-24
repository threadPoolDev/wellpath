import { apiClient } from '@/lib/apiClient'

export interface CalendarPreviewDay {
  date: string
  dayType: 'light' | 'moderate' | 'packed' | 'very_packed'
  meetingCount: number
}

export interface WeeklyReflectionData {
  weekStartDate: string
  reflection: {
    lastWeekRating: string | null
    oneWin: string | null
    oneIntention: string | null
    calendarPreview: CalendarPreviewDay[]
    aiWeeklyIntention: string | null
  }
  submittedAt: string | null
  skipped: boolean
}

export type WeeklyReflectionStatus = { exists: false } | WeeklyReflectionData

export async function getCurrentReflection(): Promise<WeeklyReflectionStatus> {
  const res = await apiClient.get<{ data: WeeklyReflectionStatus }>('/weekly-reflection/current')
  return res.data.data
}

export async function getWeekPreview(): Promise<CalendarPreviewDay[]> {
  const res = await apiClient.get<{ data: CalendarPreviewDay[] }>('/weekly-reflection/preview')
  return res.data.data
}

export async function submitReflection(input: {
  lastWeekRating: string
  oneWin?: string
  oneIntention?: string
}): Promise<WeeklyReflectionData> {
  const res = await apiClient.post<{ data: WeeklyReflectionData }>('/weekly-reflection', input)
  return res.data.data
}
