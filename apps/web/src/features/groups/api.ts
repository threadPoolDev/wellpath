import { apiClient } from '@/lib/apiClient'

export interface GroupMember {
  userId: string
  email: string
  displayName: string
  role: 'admin' | 'member'
  status: 'active' | 'invited' | 'left' | 'declined'
  joinedAt: string
}

export interface Group {
  _id: string
  name: string
  createdBy: string
  members: GroupMember[]
  settings: { allowMemberInvites: boolean }
  createdAt: string
}

export interface GroupActivityTask {
  category: string
  title: string
  status: 'done' | 'missed'
  missedReason?: string
  didInstead?: string
}

export interface GroupActivity {
  _id: string
  userId: string
  displayName: string
  summary: {
    totalTasks: number
    completedTasks: number
    missedTasks: number
    completionPercentage: number
    tasks: GroupActivityTask[]
  }
  sharingPreference: string
}

export interface GroupInvite {
  _id: string
  groupId: string
  groupName: string
  invitedByName: string
  inviteeEmail: string
  status: string
  expiresAt: string
  sentAt: string
}

export interface EmailCheckResult {
  exists: boolean
  name?: string
}

export const groupsApi = {
  async checkEmail(email: string): Promise<EmailCheckResult> {
    const res = await apiClient.get<{ data: EmailCheckResult }>(`/user/check-email?email=${encodeURIComponent(email)}`)
    return res.data.data
  },

  async createGroup(name: string, inviteEmails: string[]): Promise<Group> {
    const res = await apiClient.post<{ data: Group }>('/groups', { name, inviteEmails })
    return res.data.data
  },

  async listGroups(): Promise<Group[]> {
    const res = await apiClient.get<{ data: Group[] }>('/groups')
    return res.data.data
  },

  async getGroup(groupId: string): Promise<{ group: Group; todayActivity: GroupActivity[] }> {
    const res = await apiClient.get<{ data: { group: Group; todayActivity: GroupActivity[] } }>(`/groups/${groupId}`)
    return res.data.data
  },

  async invite(groupId: string, email: string): Promise<void> {
    await apiClient.post(`/groups/${groupId}/invite`, { email })
  },

  async listInvites(): Promise<GroupInvite[]> {
    const res = await apiClient.get<{ data: GroupInvite[] }>('/groups/invites')
    return res.data.data
  },

  async acceptInvite(inviteId: string): Promise<void> {
    await apiClient.post(`/groups/invites/${inviteId}/accept`)
  },

  async declineInvite(inviteId: string): Promise<void> {
    await apiClient.post(`/groups/invites/${inviteId}/decline`)
  },

  async leaveGroup(groupId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/members/me`)
  },
}
