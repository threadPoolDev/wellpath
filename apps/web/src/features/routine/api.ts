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
}
