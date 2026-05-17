import { apiClient } from '@/lib/apiClient'

export interface ConnectedCalendar {
  provider: 'google' | 'microsoft'
  accountEmail: string
  connectedAt: string
  lastSyncedAt?: string
  isActive: boolean
}

export interface CalendarEvent {
  id: string
  provider: 'google' | 'microsoft'
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
  events: CalendarEvent[]
}

export async function getCalendarConnections(): Promise<ConnectedCalendar[]> {
  const res = await apiClient.get<{ data: { connected: ConnectedCalendar[] } }>('/calendar/connections')
  return res.data.data.connected
}

export async function getEventsForDay(date: string): Promise<DayEventsResponse> {
  const res = await apiClient.get<{ data: DayEventsResponse }>(`/calendar/events?date=${date}`)
  return res.data.data
}

export async function syncCalendar(): Promise<void> {
  await apiClient.post('/calendar/sync')
}
