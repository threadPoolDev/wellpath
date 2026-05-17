import { apiClient } from '@/lib/apiClient'

export interface ConnectedCalendar {
  provider: 'google' | 'microsoft'
  accountEmail: string
  connectedAt: string
  lastSyncedAt?: string
  isActive: boolean
}

export async function getCalendarConnections(): Promise<ConnectedCalendar[]> {
  const res = await apiClient.get<{ data: { connected: ConnectedCalendar[] } }>('/calendar/connections')
  return res.data.data.connected
}
