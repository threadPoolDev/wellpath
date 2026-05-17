import { ValidationError } from '../../lib/errors.js'
import { ENERGY_LEVELS, MOOD_OPTIONS, DAY_TYPES } from '../../constants/index.js'
import { getEventsForDay } from '../calendar/calendar.service.js'
import { saveMorningCheckin, findTodayRoutine, createTaskCheckin, createEveningSummary } from './checkin.repository.js'
import { MorningCheckinDto, MorningCheckinResponse } from './checkin.types.js'
import { generateRoutine } from '../routine/routine.service.js'
import { embedCheckin } from '../embeddings/embeddings.service.js'

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function submitMorningCheckin(
  userId: string,
  dto: MorningCheckinDto
): Promise<MorningCheckinResponse> {
  if (!(ENERGY_LEVELS as readonly string[]).includes(dto.energyLevel)) {
    throw new ValidationError('Invalid energy level')
  }
  if (!(MOOD_OPTIONS as readonly string[]).includes(dto.mood)) {
    throw new ValidationError('Invalid mood')
  }

  const date = dto.date ?? todayDate()

  // Read calendar to classify the day automatically — never ask the user
  const dayEvents = await getEventsForDay(userId, date).catch(() => ({
    dayType: DAY_TYPES.LIGHT as 'light',
    totalMeetingMinutes: 0,
    totalFreeMinutes: 480,
    events: [],
  }))

  const routine = await saveMorningCheckin(
    userId,
    date,
    {
      energyLevel: dto.energyLevel,
      mood: dto.mood,
      anythingDifferentToday: dto.anythingDifferentToday,
      submittedAt: new Date(),
    },
    dayEvents.dayType,
    dayEvents.totalMeetingMinutes,
    dayEvents.totalFreeMinutes
  )

  // Trigger routine generation in the background — non-blocking
  generateRoutine(userId, date).catch((err) =>
    console.error('[checkin] Routine generation failed:', err)
  )

  return {
    routineId: String(routine._id),
    date: routine.date,
    dayType: routine.dayType as 'light' | 'moderate' | 'packed',
    totalMeetingMinutes: routine.totalMeetingMinutes,
    totalFreeMinutes: routine.totalFreeMinutes,
    morningCheckin: {
      energyLevel: routine.morningCheckin!.energyLevel,
      mood: routine.morningCheckin!.mood,
      anythingDifferentToday: routine.morningCheckin!.anythingDifferentToday,
      submittedAt: routine.morningCheckin!.submittedAt.toISOString(),
    },
  }
}

export async function recordTaskCheckin(
  userId: string,
  routineId: string,
  taskId: string,
  status: 'done' | 'missed' | 'skipped',
  extras: { missedReason?: string; didInstead?: string; shareWithGroup?: boolean } = {}
): Promise<void> {
  const type = status === 'done' ? 'task_completion' : 'task_missed'
  const checkin = await createTaskCheckin(userId, routineId, taskId, type, status, extras)

  // Embed free-text fields if present — fire-and-forget
  if (extras.missedReason || extras.didInstead) {
    embedCheckin(String(checkin._id)).catch((err) =>
      console.error('[embeddings] checkin embedding failed:', err)
    )
  }
}

export async function submitEveningSummary(
  userId: string,
  routineId: string,
  dto: { overallRating: number; howWasYourDay?: string; tomorrowNote?: string }
): Promise<void> {
  if (dto.overallRating < 1 || dto.overallRating > 5) {
    throw new ValidationError('Rating must be between 1 and 5')
  }

  const checkin = await createEveningSummary(userId, routineId, dto)

  if (dto.howWasYourDay || dto.tomorrowNote) {
    embedCheckin(String(checkin._id)).catch((err) =>
      console.error('[embeddings] evening summary embedding failed:', err)
    )
  }
}

export async function getTodayCheckinStatus(
  userId: string
): Promise<{ submitted: boolean; date: string }> {
  const date = todayDate()
  const routine = await findTodayRoutine(userId, date)
  return {
    submitted: !!routine?.morningCheckin?.submittedAt,
    date,
  }
}
