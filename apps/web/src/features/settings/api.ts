import { apiClient } from '@/lib/apiClient'

export interface UserProfile {
  name: string
  email: string
  profile: {
    role?: string
    workMode?: string
    workShift?: string
    city?: string
    sleep?: { wakeTime?: string; sleepGoal?: number }
    exercise?: { preference?: string }
    focus?: { peakWindow?: string }
    diet?: { type?: string; waterReminderNeeded?: boolean; restrictions?: string }
    health?: {
      takesMedicines?: string
      medicines?: Array<{
        nameOrNickname: string
        timings: string[]
        withFood: string
        isCritical: string
        reminderEnabled: boolean
      }>
    }
  }
  groupSharingDefaults?: {
    defaultSharingPreference?: string
    shareWithGroups?: boolean
  }
  profilePhoto?: { url: string; thumbnailUrl: string }
  insightsEnabled?: boolean
  weeklyReflectionEnabled?: boolean
  weeklyReflectionTiming?: 'sunday_evening' | 'monday_morning'
}

export interface UpdateProfilePayload {
  name?: string
  workMode?: string
  workShift?: string
  sleep?: { wakeTime?: string; sleepGoal?: number }
  exercise?: { preference?: string }
  focus?: { peakWindow?: string }
  diet?: { type?: string; waterReminderNeeded?: boolean; restrictions?: string }
  medicines?: Array<{
    nameOrNickname: string
    timings: string[]
    withFood: string
    isCritical: string
    reminderEnabled: boolean
  }>
  groupSharingDefaults?: {
    defaultSharingPreference?: string
    shareWithGroups?: boolean
  }
  insightsEnabled?: boolean
  weeklyReflectionEnabled?: boolean
  weeklyReflectionTiming?: 'sunday_evening' | 'monday_morning'
}

export const settingsApi = {
  async getProfile(): Promise<UserProfile> {
    const res = await apiClient.get<{ data: UserProfile }>('/user/profile')
    return res.data.data
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const res = await apiClient.patch<{ data: UserProfile }>('/user/profile', payload)
    return res.data.data
  },
}
