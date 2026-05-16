import { Schema, model, Document, Types } from 'mongoose'
import { CHECKIN_TYPES, CHECKIN_RESPONSES } from '../../constants/index.js'

export interface ICheckin extends Document {
  userId: Types.ObjectId
  routineId: Types.ObjectId
  taskId?: Types.ObjectId
  type: (typeof CHECKIN_TYPES)[number]
  response?: (typeof CHECKIN_RESPONSES)[number]
  missedReason?: string
  didInstead?: string
  eveningSummary?: {
    overallRating: number
    howWasYourDay?: string
    tomorrowNote?: string
  }
  embedding?: number[]
  timestamp: Date
}

const checkinSchema = new Schema<ICheckin>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    routineId: { type: Schema.Types.ObjectId, ref: 'Routine', required: true },
    taskId: { type: Schema.Types.ObjectId },
    type: { type: String, enum: CHECKIN_TYPES, required: true },
    response: { type: String, enum: CHECKIN_RESPONSES },
    missedReason: String,
    didInstead: String,
    eveningSummary: {
      overallRating: { type: Number, min: 1, max: 5 },
      howWasYourDay: String,
      tomorrowNote: String,
      _id: false,
    },
    embedding: [Number],
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

checkinSchema.index({ userId: 1 })

export const Checkin = model<ICheckin>('Checkin', checkinSchema)
