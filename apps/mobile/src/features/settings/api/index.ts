import { apiClient } from '../../../lib/apiClient'

interface BackendResponse<T> {
  success: boolean
  data: T
}

export interface UserProfile {
  _id: string
  name: string
  email: string
  profilePhoto?: { url: string; thumbnailUrl: string }
  profile?: {
    role?: string
    workMode?: string
    sleep?: { wakeTime?: string; sleepGoal?: number }
    diet?: { type?: string }
    exercise?: { preference?: string }
    focus?: { peakWindow?: string }
    personal?: { relationshipStatus?: string }
  }
  insightsEnabled?: boolean
  groupSharingDefaults?: {
    shareWithGroups?: boolean
    defaultSharingPreference?: string
  }
}

export interface UpdateProfileDto {
  name?: string
  insightsEnabled?: boolean
  groupSharingDefaults?: {
    shareWithGroups?: boolean
    defaultSharingPreference?: string
  }
}

export const settingsApi = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiClient.get<BackendResponse<{ user: UserProfile }>>('/user/profile')
    return res.data.user
  },

  updateProfile: async (dto: UpdateProfileDto): Promise<UserProfile> => {
    const res = await apiClient.patch<BackendResponse<{ user: UserProfile }>>('/user/profile', dto)
    return res.data.user
  },
}
