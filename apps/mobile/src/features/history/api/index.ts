import { apiClient } from '../../../lib/apiClient'

interface BackendResponse<T> {
  success: boolean
  data: T
}

export interface MoodGraphPoint {
  date: string
  energyLevel: number | null    // 1=low, 2=medium, 3=high; null = no check-in
  mood: string | null
  completionPercentage: number | null
}

export interface InsightCard {
  id: string
  type: 'pattern' | 'positive' | 'observation' | 'weekly_summary'
  title: string
  body: string
  dataPoints: string[]
  category: 'energy' | 'completion' | 'meetings' | 'exercise'
}

export interface InsightsResponse {
  generatedAt?: string
  insights: InsightCard[]
  disabled?: boolean
}

export const historyApi = {
  getMoodGraph: async (): Promise<MoodGraphPoint[]> => {
    const res = await apiClient.get<BackendResponse<{ data: MoodGraphPoint[] }>>('/insights/mood-graph')
    // Backend returns { success, data: { data: [...] } } or { success, data: [...] }
    const inner = res.data as unknown
    return (Array.isArray(inner) ? inner : (inner as { data: MoodGraphPoint[] }).data) ?? []
  },

  getInsights: async (): Promise<InsightsResponse> => {
    const res = await apiClient.get<BackendResponse<InsightsResponse>>('/insights/trends')
    return res.data
  },
}
