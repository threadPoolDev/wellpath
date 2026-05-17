import { Schema, model, Document, Types } from 'mongoose'
import {
  DAY_TYPE_VALUES,
  ENERGY_LEVELS,
  MOOD_OPTIONS,
  MEETING_PRIORITY_LEVELS,
  TASK_CATEGORIES,
  TASK_STATUSES,
  AI_PROVIDERS,
} from '../../constants/index.js'

export interface IRoutineTask {
  _id: Types.ObjectId
  time: string
  durationMinutes: number
  category: (typeof TASK_CATEGORIES)[number]
  title: string
  description: string
  status: (typeof TASK_STATUSES)[number]
  notificationSentAt?: Date
  checkinPromptSentAt?: Date
  completedAt?: Date
  missedReason?: string
  didInstead?: string
  taskEmbedding?: number[]
}

export interface IRoutineMeeting {
  _id: Types.ObjectId
  calendarEventId?: string
  isAdHoc: boolean
  title: string
  startTime: string
  endTime: string
  durationMinutes: number
  priorityLevel: (typeof MEETING_PRIORITY_LEVELS)[number]
  actualEndTime?: string
  endedEarly: boolean
  freeMinutesGained?: number
}

export interface IRoutine extends Document {
  userId: Types.ObjectId
  date: string
  dayType: (typeof DAY_TYPE_VALUES)[number]
  totalMeetingMinutes: number
  totalFreeMinutes: number
  morningCheckin?: {
    energyLevel: (typeof ENERGY_LEVELS)[number]
    mood: (typeof MOOD_OPTIONS)[number]
    anythingDifferentToday?: string
    submittedAt: Date
  }
  meetings: IRoutineMeeting[]
  tasks: IRoutineTask[]
  generatedBy: (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS]
  generationPromptSnapshot?: string
  generatedAt?: Date
}

const routineTaskSchema = new Schema<IRoutineTask>({
  time: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  category: { type: String, enum: TASK_CATEGORIES, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: TASK_STATUSES, default: 'pending' },
  notificationSentAt: Date,
  checkinPromptSentAt: Date,
  completedAt: Date,
  missedReason: String,
  didInstead: String,
  taskEmbedding: [Number],
})

const routineMeetingSchema = new Schema<IRoutineMeeting>({
  calendarEventId: String,
  isAdHoc: { type: Boolean, default: false },
  title: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  priorityLevel: { type: String, enum: MEETING_PRIORITY_LEVELS, default: 'unset' },
  actualEndTime: String,
  endedEarly: { type: Boolean, default: false },
  freeMinutesGained: Number,
})

const routineSchema = new Schema<IRoutine>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    dayType: { type: String, enum: DAY_TYPE_VALUES, required: true },
    totalMeetingMinutes: { type: Number, default: 0 },
    totalFreeMinutes: { type: Number, default: 0 },
    morningCheckin: {
      energyLevel: { type: String, enum: ENERGY_LEVELS },
      mood: { type: String, enum: MOOD_OPTIONS },
      anythingDifferentToday: String,
      submittedAt: Date,
      _id: false,
    },
    meetings: [routineMeetingSchema],
    tasks: [routineTaskSchema],
    generatedBy: { type: String, enum: Object.values(AI_PROVIDERS) },
    generationPromptSnapshot: String,
    generatedAt: Date,
  },
  { timestamps: true }
)

routineSchema.index({ userId: 1, date: 1 }, { unique: true })

export const Routine = model<IRoutine>('Routine', routineSchema)
