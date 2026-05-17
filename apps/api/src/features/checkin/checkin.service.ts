import { ValidationError } from '../../lib/errors.js'
import { ENERGY_LEVELS, MOOD_OPTIONS, DAY_TYPES } from '../../constants/index.js'
import { getEventsForDay } from '../calendar/calendar.service.js'
import { saveMorningCheckin, findTodayRoutine } from './checkin.repository.js'
import { MorningCheckinDto, MorningCheckinResponse } from './checkin.types.js'

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
