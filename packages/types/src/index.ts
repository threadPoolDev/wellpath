// Shared TypeScript interfaces used by both web and mobile.

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  name: string
  onboardingComplete: boolean
  profilePhoto: { url: string; thumbnailUrl: string } | null
  // Subset of profile returned by GET /auth/me — extended as features require
  profile?: {
    personal?: {
      relationshipStatus?: 'single' | 'partnered' | 'married'
    }
    role?: string
    workMode?: string
  }
}

// ─── API response envelope ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: { message: string; code?: string }
}

// ─── Routine ──────────────────────────────────────────────────────────────────

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
  title: string
  startTime: string
  endTime: string
  durationMinutes: number
  isAdHoc: boolean
  priorityLevel: 'high' | 'passive' | 'unset'
  endedEarly?: boolean
  actualEndTime?: string
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
    anythingDifferentToday?: string
    submittedAt: string
  }
  tasks: RoutineTask[]
  meetings: RoutineMeeting[]
}

// ─── Group ────────────────────────────────────────────────────────────────────

export interface GroupMember {
  userId: string
  displayName: string
  email: string
  role: 'admin' | 'member'
  status: 'active' | 'invited' | 'declined' | 'left'
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
