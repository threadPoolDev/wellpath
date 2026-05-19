import { apiClient } from '../../../lib/apiClient'

interface BackendResponse<T> {
  success: boolean
  data: T
}

export interface RoutineTask {
  _id: string
  time: string
  durationMinutes: number
  category: string
  title: string
  description: string
  status: 'pending' | 'done' | 'missed' | 'skipped'
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
  endedEarly: boolean
  freeMinutesGained?: number
}

export interface TodayRoutine {
  _id: string
  date: string
  dayType: 'light' | 'moderate' | 'packed'
  totalMeetingMinutes: number
  totalFreeMinutes: number
  morningCheckin?: {
    energyLevel: string
    mood: string
    anythingDifferentToday?: string
    submittedAt: string
  }
  meetings: RoutineMeeting[]
  tasks: RoutineTask[]
  generatedAt?: string
}

export interface MorningCheckinDto {
  energyLevel: string
  mood: string
  anythingDifferentToday?: string
}

export interface UpdateTaskStatusDto {
  status: 'done' | 'missed' | 'skipped'
  missedReason?: string
  didInstead?: string
  shareWithGroup?: boolean
}

export interface EveningCheckinDto {
  overallRating: number
  howWasYourDay?: string
  tomorrowNote?: string
  skipped?: boolean
}

export const dashboardApi = {
  getTodayRoutine: async (): Promise<TodayRoutine | null> => {
    const res = await apiClient.get<BackendResponse<{ routine: TodayRoutine | null }>>('/routine/today')
    return res.data.routine
  },

  getMorningStatus: async (): Promise<{ submitted: boolean; date: string }> => {
    const res = await apiClient.get<BackendResponse<{ submitted: boolean; date: string }>>(
      '/checkin/morning/status',
    )
    return res.data
  },

  submitMorningCheckin: async (dto: MorningCheckinDto): Promise<TodayRoutine> => {
    const res = await apiClient.post<BackendResponse<{ routine: TodayRoutine }>>(
      '/checkin/morning',
      dto,
    )
    return res.data.routine
  },

  updateTaskStatus: async (
    routineId: string,
    taskId: string,
    dto: UpdateTaskStatusDto,
  ): Promise<void> => {
    await apiClient.patch(`/routine/${routineId}/tasks/${taskId}/status`, dto)
  },

  getEveningStatus: async (): Promise<{ submitted: boolean; date: string }> => {
    const res = await apiClient.get<BackendResponse<{ submitted: boolean; date: string }>>(
      '/checkin/evening/status',
    )
    return res.data
  },

  submitEveningCheckin: async (dto: EveningCheckinDto): Promise<void> => {
    await apiClient.post('/checkin/evening', dto)
  },
}
