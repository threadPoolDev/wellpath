import { apiClient } from '@/lib/apiClient'

export interface MorningCheckinPayload {
  energyLevel: 'low' | 'medium' | 'high'
  mood: 'great' | 'okay' | 'tired' | 'stressed'
  anythingDifferentToday?: string
}

export interface MorningCheckinResult {
  routineId: string
  date: string
  dayType: 'light' | 'moderate' | 'packed'
  totalMeetingMinutes: number
  totalFreeMinutes: number
  morningCheckin: {
    energyLevel: string
    mood: string
    anythingDifferentToday?: string
    submittedAt: string
  }
}

export const checkinApi = {
  async submitMorning(payload: MorningCheckinPayload): Promise<MorningCheckinResult> {
    const res = await apiClient.post<{ data: MorningCheckinResult }>('/checkin/morning', payload)
    return res.data.data
  },

  async getMorningStatus(): Promise<{ submitted: boolean; date: string }> {
    const res = await apiClient.get<{ data: { submitted: boolean; date: string } }>('/checkin/morning/status')
    return res.data.data
  },

  async submitEvening(routineId: string, payload: {
    overallRating: number
    howWasYourDay?: string
    tomorrowNote?: string
  }): Promise<void> {
    await apiClient.post('/checkin/evening', { routineId, ...payload })
  },
}
