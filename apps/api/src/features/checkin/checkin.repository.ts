import { Types } from 'mongoose'
import { Routine, IRoutine } from '../routine/routine.model.js'
import { Checkin, ICheckin } from './checkin.model.js'

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

export async function createTaskCheckin(
  userId: string,
  routineId: string,
  taskId: string,
  type: 'task_completion' | 'task_missed',
  response: 'done' | 'missed' | 'skipped',
  extras: { missedReason?: string; didInstead?: string; shareWithGroup?: boolean } = {}
): Promise<ICheckin> {
  return Checkin.create({
    userId: new Types.ObjectId(userId),
    routineId: new Types.ObjectId(routineId),
    taskId: new Types.ObjectId(taskId),
    type,
    response,
    ...extras,
    timestamp: new Date(),
  })
}
