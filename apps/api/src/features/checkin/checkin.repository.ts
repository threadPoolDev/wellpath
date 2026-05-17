import { Routine, IRoutine } from '../routine/routine.model.js'

export async function findTodayRoutine(userId: string, date: string): Promise<IRoutine | null> {
  return Routine.findOne({ userId, date })
}

export async function findOrCreateRoutine(
  userId: string,
  date: string,
  defaults: Partial<IRoutine>
): Promise<IRoutine> {
  const existing = await Routine.findOne({ userId, date })
  if (existing) return existing
  return Routine.create({ userId, date, ...defaults })
}

export async function saveMorningCheckin(
  userId: string,
  date: string,
  checkin: {
    energyLevel: string
    mood: string
    anythingDifferentToday?: string
    submittedAt: Date
  },
  dayType: string,
  totalMeetingMinutes: number,
  totalFreeMinutes: number
): Promise<IRoutine> {
  return Routine.findOneAndUpdate(
    { userId, date },
    {
      $set: {
        morningCheckin: checkin,
        dayType,
        totalMeetingMinutes,
        totalFreeMinutes,
      },
    },
    { upsert: true, new: true }
  ) as Promise<IRoutine>
}
