import { apiClient } from '../../../lib/apiClient'

interface BackendResponse<T> {
  success: boolean
  data: T
}

export interface GroupMember {
  userId: string
  email: string
  displayName: string
  role: 'admin' | 'member'
  joinedAt: string
  status: 'active' | 'invited' | 'declined' | 'left'
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
}

export interface GroupActivity {
  userId: string
  displayName: string
  date: string
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
  invitedBy: string
  invitedByName: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sentAt: string
  expiresAt: string
}

export const groupsApi = {
  listGroups: async (): Promise<Group[]> => {
    const res = await apiClient.get<BackendResponse<{ groups: Group[] }>>('/groups')
    return res.data.groups
  },

  getGroup: async (groupId: string): Promise<{ group: Group; todayActivity: GroupActivity[] }> => {
    const res = await apiClient.get<BackendResponse<{ group: Group; todayActivity: GroupActivity[] }>>(
      `/groups/${groupId}`,
    )
    return res.data
  },

  createGroup: async (name: string, inviteEmails: string[]): Promise<Group> => {
    const res = await apiClient.post<BackendResponse<{ group: Group }>>('/groups', {
      name,
      inviteEmails,
    })
    return res.data.group
  },

  inviteMember: async (groupId: string, email: string): Promise<void> => {
    await apiClient.post(`/groups/${groupId}/invite`, { email })
  },

  leaveGroup: async (groupId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/members/me`)
  },

  listInvites: async (): Promise<GroupInvite[]> => {
    const res = await apiClient.get<BackendResponse<{ invites: GroupInvite[] }>>('/groups/invites')
    return res.data.invites
  },

  acceptInvite: async (inviteId: string): Promise<void> => {
    await apiClient.post(`/groups/invites/${inviteId}/accept`)
  },

  declineInvite: async (inviteId: string): Promise<void> => {
    await apiClient.post(`/groups/invites/${inviteId}/decline`)
  },
}
