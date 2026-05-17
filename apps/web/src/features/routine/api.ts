import { apiClient } from '@/lib/apiClient'

export interface RoutineTask {
  _id: string
  time: string
  durationMinutes: number
  category: string
  title: string
  description: string
  status: 'pending' | 'done' | 'missed' | 'skipped'
  completedAt?: string
  missedReason?: string
  didInstead?: string
}

export interface RoutineMeeting {
  _id: string
  isAdHoc: boolean
  title: string
  startTime: string
  endTime: string
  durationMinutes: number
  priorityLevel: 'high' | 'passive' | 'unset'
  actualEndTime?: string
  endedEarly: boolean
  freeMinutesGained?: number
}

export interface Routine {
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
  meetings: RoutineMeeting[]
  tasks: RoutineTask[]
}

export const routineApi = {
  async getToday(): Promise<Routine | null> {
    const res = await apiClient.get<{ data: { routine: Routine | null } }>('/routine/today')
    return res.data.data.routine
  },

  async updateTaskStatus(
    routineId: string,
    taskId: string,
    status: 'done' | 'missed' | 'skipped',
    extras: { missedReason?: string; didInstead?: string; shareWithGroup?: boolean } = {}
  ): Promise<Routine> {
    const res = await apiClient.patch<{ data: { routine: Routine } }>(
      `/routine/${routineId}/tasks/${taskId}/status`,
      { status, ...extras }
    )
    return res.data.data.routine
  },

  async addMeeting(
    routineId: string,
    dto: { title: string; startTime: string; durationMinutes: number }
  ): Promise<Routine> {
    const res = await apiClient.post<{ data: { routine: Routine } }>(
      `/routine/${routineId}/meetings`,
      dto
    )
    return res.data.data.routine
  },

  async endMeetingEarly(
    routineId: string,
    meetingId: string,
    actualEndTime: string
  ): Promise<{ routine: Routine; freeMinutesGained: number }> {
    const res = await apiClient.patch<{ data: { routine: Routine; freeMinutesGained: number } }>(
      `/routine/${routineId}/meetings/${meetingId}/end-early`,
      { actualEndTime }
    )
    return res.data.data
  },
}
