export interface MorningCheckinDto {
  energyLevel: 'low' | 'medium' | 'high'
  mood: 'great' | 'okay' | 'tired' | 'stressed'
  anythingDifferentToday?: string
  date?: string  // YYYY-MM-DD, defaults to today
}

export interface MorningCheckinResponse {
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
