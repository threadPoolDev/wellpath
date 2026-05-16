import { Schema, model, Document, Types } from 'mongoose'
import { NOTIFICATION_TYPES, DELIVERY_STATUSES } from '../../constants/index.js'

export interface INotification extends Document {
  userId: Types.ObjectId
  routineId?: Types.ObjectId
  taskId?: Types.ObjectId
  type: (typeof NOTIFICATION_TYPES)[number]
  title: string
  body: string
  scheduledFor: Date
  sentAt?: Date
  deliveryStatus: (typeof DELIVERY_STATUSES)[number]
  clickedAt?: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    routineId: { type: Schema.Types.ObjectId, ref: 'Routine' },
    taskId: { type: Schema.Types.ObjectId },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    scheduledFor: { type: Date, required: true },
    sentAt: Date,
    deliveryStatus: { type: String, enum: DELIVERY_STATUSES, default: 'pending' },
    clickedAt: Date,
  },
  { timestamps: true }
)

export const Notification = model<INotification>('Notification', notificationSchema)
