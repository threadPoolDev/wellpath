import { Schema, model, Document, Types } from 'mongoose'
import { CALENDAR_PROVIDERS } from '../../constants/index.js'

export interface ICalendarEvent extends Document {
  userId: Types.ObjectId
  provider: (typeof CALENDAR_PROVIDERS)[number]
  externalEventId: string
  title: string
  startTime: Date
  endTime: Date
  durationMinutes: number
  isRecurring: boolean
  fetchedAt: Date
  date: string
}

const calendarEventSchema = new Schema<ICalendarEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: CALENDAR_PROVIDERS, required: true },
    externalEventId: { type: String, required: true },
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    isRecurring: { type: Boolean, default: false },
    fetchedAt: { type: Date, default: Date.now },
    date: { type: String, required: true },
  },
  { timestamps: true }
)

calendarEventSchema.index({ externalEventId: 1 })
calendarEventSchema.index({ userId: 1, date: 1 })

export const CalendarEvent = model<ICalendarEvent>('CalendarEvent', calendarEventSchema)
