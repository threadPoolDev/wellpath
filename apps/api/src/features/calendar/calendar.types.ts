export interface CalendarEventDto {
  id: string
  provider: 'google' | 'microsoft'
  externalEventId: string
  title: string
  startTime: string
  endTime: string
  durationMinutes: number
  isRecurring: boolean
}

export interface DayEventsResponse {
  date: string
  dayType: 'light' | 'moderate' | 'packed'
  totalMeetingMinutes: number
  totalFreeMinutes: number
  events: CalendarEventDto[]
}

export interface ConnectedCalendarDto {
  provider: 'google' | 'microsoft'
  accountEmail: string
  connectedAt: string
  lastSyncedAt?: string
  isActive: boolean
}

export interface ConnectionStatusResponse {
  connected: ConnectedCalendarDto[]
}
