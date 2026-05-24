import { format, addDays, startOfWeek, getDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Types } from 'mongoose'
import webpush from 'web-push'
import { User } from '../user/user.model.js'
import { Routine } from '../routine/routine.model.js'
import { CalendarEvent } from '../calendar/calendarEvent.model.js'
import { WeeklyReflection } from './weekly.model.js'
import { getAIClient } from '../../lib/ai.js'
import { ValidationError } from '../../lib/errors.js'
import {
  WEEKLY_REFLECTION,
  WEEKLY_REFLECTION_RATINGS,
} from '../../constants/index.js'
import type { CalendarPreviewDay, WeeklyReflectionInput, WeeklyReflectionResponse } from './weekly.types.js'

// ─── Helper: Monday date string for current (or any given) week ──────────────

function getMondayOfWeek(dateStr?: string): string {
  const base = dateStr ? new Date(dateStr) : new Date()
  const monday = startOfWeek(base, { weekStartsOn: 1 })
  return format(monday, 'yyyy-MM-dd')
}

// ─── Helper: current Monday for a timezone ───────────────────────────────────

function getMondayInTimezone(tz: string): string {
  const zonedNow = toZonedTime(new Date(), tz)
  const monday = startOfWeek(zonedNow, { weekStartsOn: 1 })
  return format(monday, 'yyyy-MM-dd')
}

// ─── Helper: build calendar preview for next N days ──────────────────────────

async function buildCalendarPreview(userId: string): Promise<CalendarPreviewDay[]> {
  const preview: CalendarPreviewDay[] = []
  const today = new Date()

  for (let i = 0; i < WEEKLY_REFLECTION.PREVIEW_DAYS; i++) {
    const d = addDays(today, i + 1) // start from tomorrow
    const dateStr = format(d, 'yyyy-MM-dd')

    // Check if we already have a routine for that day
    const routine = await Routine.findOne({
      userId: new Types.ObjectId(userId),
      date: dateStr,
    })
      .select('dayType totalMeetingMinutes totalFreeMinutes')
      .lean()

    if (routine) {
      const meetingCount =
        routine.totalMeetingMinutes != null
          ? Math.round(routine.totalMeetingMinutes / 60)
          : 0

      let dayType: CalendarPreviewDay['dayType'] = routine.dayType ?? 'light'
      if (
        routine.totalFreeMinutes != null &&
        routine.totalFreeMinutes < WEEKLY_REFLECTION.VERY_PACKED_MIN_FREE_MINUTES
      ) {
        dayType = 'very_packed'
      }

      preview.push({ date: dateStr, dayType, meetingCount })
    } else {
      // Fall back to calendar events count
      const events = await CalendarEvent.find({
        userId: new Types.ObjectId(userId),
        date: dateStr,
      })
        .select('durationMinutes')
        .lean()

      const meetingCount = events.length
      let dayType: CalendarPreviewDay['dayType'] = 'light'
      if (meetingCount >= WEEKLY_REFLECTION.VERY_PACKED_MEETING_COUNT) dayType = 'very_packed'
      else if (meetingCount >= 4) dayType = 'packed'
      else if (meetingCount >= 2) dayType = 'moderate'

      preview.push({ date: dateStr, dayType, meetingCount })
    }
  }

  return preview
}

// ─── Helper: AI weekly intention ─────────────────────────────────────────────

async function generateAIIntention(
  lastWeekRating: string,
  oneIntention: string | undefined,
  calendarPreview: CalendarPreviewDay[]
): Promise<string> {
  const isHardWeek = lastWeekRating === 'exhausting' || lastWeekRating === 'tough'
  const heavyDays = calendarPreview
    .filter((d) => d.dayType === 'very_packed' || d.dayType === 'packed')
    .map((d) => format(new Date(d.date), 'EEEE'))

  const previewText = calendarPreview
    .map((d) => `${format(new Date(d.date), 'EEEE')}: ${d.dayType} (${d.meetingCount} meetings)`)
    .join(', ')

  const prompt = `You are a warm, supportive wellbeing coach. Write ONE short, warm, personal weekly intention sentence for a user.

Context:
- Last week felt: ${lastWeekRating}${isHardWeek ? ' — the user had a hard week, suggest a lighter approach' : ''}
- Their intention for the week: ${oneIntention ?? 'not specified'}
- Week ahead: ${previewText}
${heavyDays.length > 0 ? `- Heavy days: ${heavyDays.join(', ')}` : ''}

Rules:
- One sentence only — warm, personal, non-preachy
- Reference the week ahead if relevant (e.g. mention a busy day)
- Never mention medicine, medical data, or personal health conditions
- If the user had a hard week, suggest something restorative
- Respond with ONLY the sentence — no quotes, no prefix, no explanation`

  try {
    const ai = getAIClient()
    const raw = await ai.chat(prompt)
    return raw.trim().replace(/^["']|["']$/g, '')
  } catch {
    // Graceful fallback
    if (isHardWeek) return 'This week, be gentle with yourself — small steps still move you forward.'
    return 'Show up for yourself this week, one day at a time.'
  }
}

// ─── Public: get current week reflection ─────────────────────────────────────

export async function getCurrentReflection(userId: string): Promise<{ exists: false } | WeeklyReflectionResponse> {
  const weekStartDate = getMondayOfWeek()
  const doc = await WeeklyReflection.findOne({
    userId: new Types.ObjectId(userId),
    weekStartDate,
  }).lean()

  if (!doc) return { exists: false }

  return {
    weekStartDate: doc.weekStartDate,
    reflection: {
      lastWeekRating: doc.reflection?.lastWeekRating ?? null,
      oneWin: doc.reflection?.oneWin ?? null,
      oneIntention: doc.reflection?.oneIntention ?? null,
      calendarPreview: (doc.reflection?.calendarPreview ?? []) as CalendarPreviewDay[],
      aiWeeklyIntention: doc.reflection?.aiWeeklyIntention ?? null,
    },
    submittedAt: doc.submittedAt ? doc.submittedAt.toISOString() : null,
    skipped: doc.skipped,
  }
}

// ─── Public: get week-ahead preview ──────────────────────────────────────────

export async function getWeekPreview(userId: string): Promise<CalendarPreviewDay[]> {
  return buildCalendarPreview(userId)
}

// ─── Public: submit reflection ────────────────────────────────────────────────

export async function submitReflection(
  userId: string,
  input: WeeklyReflectionInput
): Promise<WeeklyReflectionResponse> {
  if (!WEEKLY_REFLECTION_RATINGS.includes(input.lastWeekRating)) {
    throw new ValidationError('Invalid lastWeekRating value')
  }

  const weekStartDate = getMondayOfWeek()

  // Build calendar preview if not provided
  const calendarPreview = input.calendarPreview ?? (await buildCalendarPreview(userId))

  // Generate AI intention
  const aiWeeklyIntention = await generateAIIntention(
    input.lastWeekRating,
    input.oneWin ?? undefined,
    calendarPreview
  )

  const doc = await WeeklyReflection.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), weekStartDate },
    {
      $set: {
        'reflection.lastWeekRating': input.lastWeekRating,
        'reflection.oneWin': input.oneWin ?? null,
        'reflection.oneIntention': input.oneIntention ?? null,
        'reflection.calendarPreview': calendarPreview,
        'reflection.aiWeeklyIntention': aiWeeklyIntention,
        submittedAt: new Date(),
        skipped: false,
      },
    },
    { upsert: true, new: true }
  )

  return {
    weekStartDate: doc.weekStartDate,
    reflection: {
      lastWeekRating: doc.reflection?.lastWeekRating ?? null,
      oneWin: doc.reflection?.oneWin ?? null,
      oneIntention: doc.reflection?.oneIntention ?? null,
      calendarPreview: (doc.reflection?.calendarPreview ?? []) as CalendarPreviewDay[],
      aiWeeklyIntention: doc.reflection?.aiWeeklyIntention ?? null,
    },
    submittedAt: doc.submittedAt ? doc.submittedAt.toISOString() : null,
    skipped: doc.skipped,
  }
}

// ─── Public: get reflection for a week (for routine injection) ───────────────

export async function getReflectionForWeek(
  userId: string,
  weekStartDate: string
): Promise<{ lastWeekRating: string | null; oneIntention: string | null } | null> {
  const doc = await WeeklyReflection.findOne({
    userId: new Types.ObjectId(userId),
    weekStartDate,
  })
    .select('reflection.lastWeekRating reflection.oneIntention skipped')
    .lean()

  if (!doc || doc.skipped) return null
  return {
    lastWeekRating: doc.reflection?.lastWeekRating ?? null,
    oneIntention: doc.reflection?.oneIntention ?? null,
  }
}

// ─── Cron: Sunday evening notification + Monday morning reminder ──────────────

export async function runWeeklyReflectionNotifications(): Promise<void> {
  const users = await User.find({ weeklyReflectionEnabled: true })
    .select('name pushSubscription weeklyReflectionTiming profile.shiftTimezone')
    .lean()

  const results = await Promise.allSettled(
    users.map(async (user) => {
      if (!user.pushSubscription?.endpoint) return

      const tz = (user.profile as { shiftTimezone?: string })?.shiftTimezone ?? 'UTC'
      const zonedNow = toZonedTime(new Date(), tz)
      const dayOfWeek = getDay(zonedNow) // 0=Sun, 1=Mon, ...
      const hourNow = zonedNow.getHours()

      const weekStartDate = getMondayInTimezone(tz)
      const userId = String(user._id)

      // Check if already submitted this week
      const existing = await WeeklyReflection.findOne({
        userId: new Types.ObjectId(userId),
        weekStartDate,
      })
        .select('submittedAt skipped notificationSentAt')
        .lean()

      const alreadyDone = existing && (existing.submittedAt || existing.skipped)

      // Sunday 7pm notification
      if (
        dayOfWeek === 0 &&
        hourNow === WEEKLY_REFLECTION.SUNDAY_NOTIFICATION_HOUR &&
        !alreadyDone &&
        !existing?.notificationSentAt
      ) {
        await sendWeeklyNotification(user, weekStartDate, userId, 'notification')
      }

      // Monday 7am reminder — only if Sunday notification was sent and not yet done
      if (
        dayOfWeek === 1 &&
        hourNow === WEEKLY_REFLECTION.MONDAY_REMINDER_HOUR &&
        !alreadyDone &&
        existing?.notificationSentAt &&
        !existing?.reminderSentAt
      ) {
        await sendWeeklyNotification(user, weekStartDate, userId, 'reminder')
      }
    })
  )

  const failed = results.filter((r) => r.status === 'rejected').length
  if (failed > 0) console.warn(`[weekly] ${failed} notification(s) failed`)
}

async function sendWeeklyNotification(
  user: { _id: unknown; pushSubscription?: { endpoint: string; keys: { p256dh: string; auth: string } } },
  weekStartDate: string,
  userId: string,
  type: 'notification' | 'reminder'
): Promise<void> {
  if (!user.pushSubscription?.endpoint) return

  const payload = JSON.stringify({
    title: type === 'notification' ? 'Weekly check-in 📅' : 'Quick reminder 📅',
    body:
      type === 'notification'
        ? '5 minutes to set up your week? Take a moment to reflect.'
        : 'Still time for your weekly reflection — 5 minutes, that\'s all.',
    url: '/dashboard?weekly=true',
  })

  try {
    await webpush.sendNotification(user.pushSubscription, payload)
  } catch {
    return // non-fatal
  }

  const updateField = type === 'notification' ? 'notificationSentAt' : 'reminderSentAt'
  await WeeklyReflection.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), weekStartDate },
    { $set: { [updateField]: new Date() } },
    { upsert: true }
  )
}
