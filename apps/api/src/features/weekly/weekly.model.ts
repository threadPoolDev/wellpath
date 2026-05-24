import { Schema, model, Document, Types } from 'mongoose'
import { WEEKLY_REFLECTION_RATINGS } from '../../constants/index.js'

interface ICalendarPreviewDay {
  date: string
  dayType: string
  meetingCount: number
}

export interface IWeeklyReflection extends Document {
  userId: Types.ObjectId
  weekStartDate: string // Monday "2025-05-19"
  reflection: {
    lastWeekRating: (typeof WEEKLY_REFLECTION_RATINGS)[number] | null
    oneWin: string | null
    oneIntention: string | null
    calendarPreview: ICalendarPreviewDay[]
    aiWeeklyIntention: string | null
  }
  submittedAt: Date | null
  notificationSentAt: Date | null
  reminderSentAt: Date | null
  skipped: boolean
}

const calendarPreviewDaySchema = new Schema<ICalendarPreviewDay>(
  {
    date: { type: String, required: true },
    dayType: { type: String, required: true },
    meetingCount: { type: Number, default: 0 },
  },
  { _id: false }
)

const weeklyReflectionSchema = new Schema<IWeeklyReflection>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weekStartDate: { type: String, required: true },
    reflection: {
      lastWeekRating: { type: String, enum: [...WEEKLY_REFLECTION_RATINGS, null], default: null },
      oneWin: { type: String, default: null },
      oneIntention: { type: String, default: null },
      calendarPreview: [calendarPreviewDaySchema],
      aiWeeklyIntention: { type: String, default: null },
      _id: false,
    },
    submittedAt: { type: Date, default: null },
    notificationSentAt: { type: Date, default: null },
    reminderSentAt: { type: Date, default: null },
    skipped: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Unique per user per week
weeklyReflectionSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true })

export const WeeklyReflection = model<IWeeklyReflection>('WeeklyReflection', weeklyReflectionSchema)
