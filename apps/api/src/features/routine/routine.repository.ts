import { Routine, IRoutine, IRoutineMeeting } from './routine.model.js'
import { Types } from 'mongoose'

export async function findRoutineByDate(userId: string, date: string): Promise<IRoutine | null> {
  return Routine.findOne({ userId, date })
}

export async function saveRoutine(
  userId: string,
  date: string,
  fields: Partial<IRoutine>
): Promise<IRoutine> {
  return Routine.findOneAndUpdate(
    { userId, date },
    { $set: fields },
    { upsert: true, new: true }
  ) as Promise<IRoutine>
}

export async function addMeetingToRoutine(
  routineId: string,
  meeting: Omit<IRoutineMeeting, '_id'>
): Promise<IRoutine | null> {
  return Routine.findByIdAndUpdate(
    routineId,
    {
      $push: { meetings: meeting },
      $inc: {
        totalMeetingMinutes: meeting.durationMinutes,
        totalFreeMinutes: -meeting.durationMinutes,
      },
    },
    { new: true }
  )
}

export async function endMeetingEarly(
  routineId: string,
  meetingId: string,
  actualEndTime: string,
  freeMinutesGained: number
): Promise<IRoutine | null> {
  return Routine.findOneAndUpdate(
    { _id: routineId, 'meetings._id': new Types.ObjectId(meetingId) },
    {
      $set: {
        'meetings.$.endedEarly': true,
        'meetings.$.actualEndTime': actualEndTime,
        'meetings.$.freeMinutesGained': freeMinutesGained,
      },
      $inc: {
        totalMeetingMinutes: -freeMinutesGained,
        totalFreeMinutes: freeMinutesGained,
      },
    },
    { new: true }
  )
}

export async function updateTaskStatus(
  routineId: string,
  taskId: string,
  status: string,
  extras: { completedAt?: Date; missedReason?: string; didInstead?: string } = {}
): Promise<IRoutine | null> {
  return Routine.findOneAndUpdate(
    { _id: routineId, 'tasks._id': new Types.ObjectId(taskId) },
    {
      $set: {
        'tasks.$.status': status,
        ...(extras.completedAt ? { 'tasks.$.completedAt': extras.completedAt } : {}),
        ...(extras.missedReason ? { 'tasks.$.missedReason': extras.missedReason } : {}),
        ...(extras.didInstead ? { 'tasks.$.didInstead': extras.didInstead } : {}),
      },
    },
    { new: true }
  )
}
