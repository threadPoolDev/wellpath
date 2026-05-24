import { apiClient } from '@/lib/apiClient'

export interface InsightItem {
  id: string
  type: 'pattern' | 'positive' | 'observation' | 'weekly_summary'
  category: 'energy' | 'completion' | 'meetings' | 'exercise'
  title: string
  body: string
}

export interface TrendsResult {
  generatedAt: string
  insights: InsightItem[]
}

export interface TrendsDisabled {
  disabled: true
}

export interface MoodGraphDay {
  date: string
  energyLevel: number | null
  mood: string | null
  completionPercentage: number | null
}

export interface PastRoutineSummary {
  _id: string
  date: string
  dayType: 'light' | 'moderate' | 'packed'
  totalMeetingMinutes: number
  totalFreeMinutes: number
  morningCheckin?: {
    energyLevel: string
    mood: string
    submittedAt: string
  }
  completionPercentage: number
}

export const historyApi = {
  async getTrends(): Promise<TrendsResult | TrendsDisabled> {
    const res = await apiClient.get<{ data: TrendsResult | TrendsDisabled }>('/insights/trends')
    return res.data.data
  },

  async getMoodGraph(): Promise<MoodGraphDay[]> {
    const res = await apiClient.get<{ data: MoodGraphDay[] }>('/insights/mood-graph')
    return res.data.data
  },

  async getPastRoutines(): Promise<PastRoutineSummary[]> {
    const res = await apiClient.get<{ data: { routines: PastRoutineSummary[] } }>('/routine/history')
    return res.data.data.routines
  },
}
