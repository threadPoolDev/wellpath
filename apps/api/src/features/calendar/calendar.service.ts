import { google } from 'googleapis'
import jwt from 'jsonwebtoken'
import { ValidationError } from '../../lib/errors.js'
import { DAY_TYPES } from '../../constants/index.js'
import { ICalendarEvent } from './calendarEvent.model.js'
import {
  getActiveConnections,
  upsertConnection,
  updateConnectionFields,
  deactivateConnection,
  upsertCalendarEvent,
  getEventsForDate,
  deleteEventsByProvider,
} from './calendar.repository.js'
import { ConnectionStatusResponse, DayEventsResponse } from './calendar.types.js'

// ─── OAuth state — JWT-signed, 10-min expiry ──────────────────────────────────

function signState(userId: string, provider: string): string {
  return jwt.sign({ userId, provider }, process.env.JWT_SECRET!, { expiresIn: '10m' })
}

function verifyState(state: string): { userId: string; provider: string } {
  try {
    return jwt.verify(state, process.env.JWT_SECRET!) as { userId: string; provider: string }
  } catch {
    throw new ValidationError('Invalid or expired OAuth state — please try connecting again')
  }
}

// ─── Google Calendar ──────────────────────────────────────────────────────────

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
]

function googleClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.API_URL}/api/calendar/connect/google/callback`
  )
}

export function buildGoogleAuthUrl(userId: string): string {
  return googleClient().generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_SCOPES,
    state: signState(userId, 'google'),
    prompt: 'consent',
  })
}

export async function handleGoogleCallback(code: string, state: string): Promise<void> {
  const { userId } = verifyState(state)
  const client = googleClient()
  const { tokens } = await client.getToken(code)
  if (!tokens.access_token) throw new ValidationError('No access token received from Google')

  client.setCredentials(tokens)
  const { data: info } = await google.oauth2({ version: 'v2', auth: client }).userinfo.get()

  await upsertConnection(userId, {
    provider: 'google',
    accountEmail: info.email ?? '',
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? '',
    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600_000),
    scopes: GOOGLE_SCOPES,
    isActive: true,
    connectedAt: new Date(),
    connectionNote: '',
  })

  const expiry = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600_000)
  syncGoogle(userId, tokens.access_token, tokens.refresh_token ?? '', undefined, expiry).catch((e) =>
    console.error('[calendar] initial google sync failed:', e)
  )
}

async function syncGoogle(
  userId: string,
  accessToken: string,
  refreshToken: string,
  timeMin?: Date,
  tokenExpiry?: Date
): Promise<void> {
  console.log(`[google-sync] starting for userId=${userId} tokenExpiry=${tokenExpiry?.toISOString() ?? 'unknown'} hasRefreshToken=${!!refreshToken}`)

  const client = googleClient()
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    // If expiry unknown, force refresh by pretending token already expired
    expiry_date: tokenExpiry?.getTime() ?? Date.now() - 1,
  })

  client.on('tokens', async (t) => {
    console.log('[google-sync] received new tokens from Google, persisting...')
    if (t.access_token) {
      await updateConnectionFields(userId, 'google', {
        accessToken: t.access_token,
        ...(t.expiry_date ? { tokenExpiry: new Date(t.expiry_date) } : {}),
        ...(t.refresh_token ? { refreshToken: t.refresh_token } : {}),
      })
    }
  })

  const cal = google.calendar({ version: 'v3', auth: client })
  const from = timeMin ?? new Date()
  const future = new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000)

  console.log(`[google-sync] fetching events from ${from.toISOString()} to ${future.toISOString()}`)
  const { data } = await cal.events.list({
    calendarId: 'primary',
    timeMin: from.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  })

  const items = data.items ?? []
  console.log(`[google-sync] Google returned ${items.length} raw event(s)`)

  let stored = 0
  let skipped = 0
  for (const event of items) {
    if (!event.start?.dateTime || !event.end?.dateTime) {
      console.log(`[google-sync] skipping all-day event: "${event.summary}"`)
      skipped++
      continue
    }
    const startTime = new Date(event.start.dateTime)
    const endTime = new Date(event.end.dateTime)
    const date = startTime.toISOString().slice(0, 10)
    console.log(`[google-sync] upserting "${event.summary}" on date=${date} start=${startTime.toISOString()}`)
    await upsertCalendarEvent({
      userId: userId as never,
      provider: 'google',
      externalEventId: `google_${event.id}`,
      title: event.summary ?? 'Untitled',
      startTime,
      endTime,
      durationMinutes: Math.round((endTime.getTime() - startTime.getTime()) / 60_000),
      isRecurring: !!event.recurringEventId,
      fetchedAt: new Date(),
      date,
    })
    stored++
  }

  console.log(`[google-sync] done: ${stored} stored, ${skipped} all-day events skipped`)
  await updateConnectionFields(userId, 'google', { lastSyncedAt: new Date() })
}

// ─── Microsoft Calendar ───────────────────────────────────────────────────────

const MS_TENANT = () => process.env.MICROSOFT_TENANT_ID ?? 'common'
const MS_AUTH_BASE = () => `https://login.microsoftonline.com/${MS_TENANT()}/oauth2/v2.0`
const MS_SCOPES = 'Calendars.Read offline_access User.Read'
const MS_REDIRECT = () => `${process.env.API_URL}/api/calendar/connect/microsoft/callback`

export function buildMicrosoftAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID ?? '',
    response_type: 'code',
    redirect_uri: MS_REDIRECT(),
    scope: MS_SCOPES,
    state: signState(userId, 'microsoft'),
    response_mode: 'query',
  })
  return `${MS_AUTH_BASE()}/authorize?${params}`
}

interface MSTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
}

async function msTokenRequest(body: URLSearchParams): Promise<MSTokenResponse> {
  const res = await fetch(`${MS_AUTH_BASE()}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new ValidationError('Microsoft token request failed')
  return res.json() as Promise<MSTokenResponse>
}

export async function handleMicrosoftCallback(code: string, state: string): Promise<void> {
  const { userId } = verifyState(state)

  const tokens = await msTokenRequest(
    new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID ?? '',
      client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
      code,
      redirect_uri: MS_REDIRECT(),
      grant_type: 'authorization_code',
    })
  )

  const userRes = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    signal: AbortSignal.timeout(5_000),
  })
  const userInfo = (await userRes.json()) as { mail?: string; userPrincipalName?: string }

  const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000)

  await upsertConnection(userId, {
    provider: 'microsoft',
    accountEmail: userInfo.mail ?? userInfo.userPrincipalName ?? '',
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? '',
    tokenExpiry,
    scopes: MS_SCOPES.split(' '),
    isActive: true,
    connectedAt: new Date(),
    connectionNote: '',
  })

  syncMicrosoft(userId, tokens.access_token, tokens.refresh_token ?? '').catch(() => null)
}

async function syncMicrosoft(userId: string, accessToken: string, refreshToken: string, timeMin?: Date): Promise<void> {
  const now = timeMin ?? new Date()
  const future = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    startDateTime: now.toISOString(),
    endDateTime: future.toISOString(),
    $select: 'subject,start,end,seriesMasterId',
    $top: '250',
  })

  let token = accessToken
  let res = await fetch(`https://graph.microsoft.com/v1.0/me/calendarView?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  })

  if (res.status === 401 && refreshToken) {
    try {
      const newTokens = await msTokenRequest(
        new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID ?? '',
          client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        })
      )
      token = newTokens.access_token
      await updateConnectionFields(userId, 'microsoft', {
        accessToken: token,
        tokenExpiry: new Date(Date.now() + newTokens.expires_in * 1000),
        ...(newTokens.refresh_token ? { refreshToken: newTokens.refresh_token } : {}),
      })
      res = await fetch(`https://graph.microsoft.com/v1.0/me/calendarView?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
      })
    } catch {
      await deactivateConnection(userId, 'microsoft')
      return
    }
  }

  if (!res.ok) {
    await deactivateConnection(userId, 'microsoft')
    return
  }

  const data = (await res.json()) as {
    value: Array<{
      id: string
      subject: string
      start: { dateTime: string }
      end: { dateTime: string }
      seriesMasterId?: string
    }>
  }

  for (const event of data.value ?? []) {
    if (!event.start?.dateTime || !event.end?.dateTime) continue
    const startTime = new Date(event.start.dateTime)
    const endTime = new Date(event.end.dateTime)
    await upsertCalendarEvent({
      userId: userId as never,
      provider: 'microsoft',
      externalEventId: `microsoft_${event.id}`,
      title: event.subject ?? 'Untitled',
      startTime,
      endTime,
      durationMinutes: Math.round((endTime.getTime() - startTime.getTime()) / 60_000),
      isRecurring: !!event.seriesMasterId,
      fetchedAt: new Date(),
      date: startTime.toISOString().slice(0, 10),
    })
  }

  await updateConnectionFields(userId, 'microsoft', { lastSyncedAt: new Date() })
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export async function getConnections(userId: string): Promise<ConnectionStatusResponse> {
  const connections = await getActiveConnections(userId)
  return {
    connected: connections.map((c) => ({
      provider: c.provider as 'google' | 'microsoft',
      accountEmail: c.accountEmail,
      connectedAt: c.connectedAt?.toISOString() ?? new Date().toISOString(),
      lastSyncedAt: c.lastSyncedAt?.toISOString(),
      isActive: c.isActive,
    })),
  }
}

export async function disconnectCalendar(userId: string, provider: string): Promise<void> {
  await deactivateConnection(userId, provider)
  await deleteEventsByProvider(userId, provider)
}

// Re-sync all active calendar connections for a user.
// Uses start-of-today (UTC) as timeMin so events from earlier today are included.
export async function syncAllConnections(userId: string): Promise<void> {
  const connections = await getActiveConnections(userId)
  console.log(`[calendar] syncAllConnections userId=${userId} found ${connections.length} active connection(s):`,
    connections.map((c) => ({ provider: c.provider, email: c.accountEmail, isActive: c.isActive, tokenExpiry: c.tokenExpiry }))
  )
  if (connections.length === 0) return

  // Start from midnight UTC today so all of today's events are captured
  const startOfToday = new Date()
  startOfToday.setUTCHours(0, 0, 0, 0)
  console.log(`[calendar] syncing from ${startOfToday.toISOString()} (midnight UTC today)`)

  const results = await Promise.allSettled(
    connections.map((c) => {
      if (c.provider === 'google') {
        return syncGoogle(userId, c.accessToken, c.refreshToken ?? '', startOfToday, c.tokenExpiry ?? undefined)
      }
      if (c.provider === 'microsoft') {
        return syncMicrosoft(userId, c.accessToken, c.refreshToken ?? '', startOfToday)
      }
      return Promise.resolve()
    })
  )

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[calendar] sync failed for ${connections[i].provider}:`, r.reason)
    } else {
      console.log(`[calendar] sync succeeded for ${connections[i].provider}`)
    }
  })
}

function classifyDay(events: ICalendarEvent[]): {
  dayType: 'light' | 'moderate' | 'packed'
  totalMeetingMinutes: number
  totalFreeMinutes: number
} {
  const totalMeetingMinutes = events.reduce((s, e) => s + e.durationMinutes, 0)
  const totalFreeMinutes = Math.max(0, 480 - totalMeetingMinutes)

  const dayType: 'light' | 'moderate' | 'packed' =
    events.length >= 4 || totalFreeMinutes < 90
      ? (DAY_TYPES.PACKED as 'packed')
      : events.length >= 2
        ? (DAY_TYPES.MODERATE as 'moderate')
        : (DAY_TYPES.LIGHT as 'light')

  return { dayType, totalMeetingMinutes, totalFreeMinutes }
}

export async function getEventsForDay(userId: string, date: string): Promise<DayEventsResponse> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ValidationError('date must be YYYY-MM-DD')

  const raw = await getEventsForDate(userId, date)
  console.log(`[calendar] getEventsForDay userId=${userId} date=${date} → ${raw.length} raw event(s) in DB:`,
    raw.map((e) => ({ title: e.title, provider: e.provider, date: e.date, start: e.startTime }))
  )

  // Dedup: same title + startTime within 2 minutes → keep first
  const deduped: ICalendarEvent[] = []
  for (const event of raw) {
    const isDupe = deduped.some(
      (e) =>
        e.title === event.title &&
        Math.abs(e.startTime.getTime() - event.startTime.getTime()) < 2 * 60_000
    )
    if (!isDupe) deduped.push(event)
  }

  const { dayType, totalMeetingMinutes, totalFreeMinutes } = classifyDay(deduped)

  return {
    date,
    dayType,
    totalMeetingMinutes,
    totalFreeMinutes,
    events: deduped.map((e) => ({
      id: String(e._id),
      provider: e.provider as 'google' | 'microsoft',
      externalEventId: e.externalEventId,
      title: e.title,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString(),
      durationMinutes: e.durationMinutes,
      isRecurring: e.isRecurring,
    })),
  }
}
