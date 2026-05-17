import { Types } from 'mongoose'
import { User } from '../user/user.model.js'
import { CalendarEvent, ICalendarEvent } from './calendarEvent.model.js'

export async function getActiveConnections(userId: string) {
  const user = await User.findById(userId).select('calendarConnections')
  if (!user) return []
  return user.calendarConnections.filter((c) => c.isActive)
}

export async function upsertConnection(
  userId: string,
  fields: Record<string, unknown> & { provider: string }
): Promise<void> {
  // Pull any existing entry for this provider, then push the new one
  await User.updateOne({ _id: userId }, { $pull: { calendarConnections: { provider: fields.provider } } })
  await User.updateOne({ _id: userId }, { $push: { calendarConnections: fields } })
}

export async function updateConnectionFields(
  userId: string,
  provider: string,
  fields: Record<string, unknown>
): Promise<void> {
  const setFields: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(fields)) {
    setFields[`calendarConnections.$.${k}`] = v
  }
  await User.updateOne({ _id: userId, 'calendarConnections.provider': provider }, { $set: setFields })
}

export async function deactivateConnection(userId: string, provider: string): Promise<void> {
  await updateConnectionFields(userId, provider, { isActive: false })
}

export async function upsertCalendarEvent(event: Partial<ICalendarEvent> & { userId: Types.ObjectId | string }): Promise<void> {
  await CalendarEvent.updateOne(
    { externalEventId: event.externalEventId, userId: event.userId },
    { $set: event },
    { upsert: true }
  )
}

export async function getEventsForDate(userId: string, date: string): Promise<ICalendarEvent[]> {
  return CalendarEvent.find({ userId, date }).sort({ startTime: 1 })
}

export async function deleteEventsByProvider(userId: string, provider: string): Promise<void> {
  await CalendarEvent.deleteMany({ userId, provider })
}
