import { Schema, model, Document, Types } from 'mongoose'
import { TASK_CATEGORIES, PRIVATE_TASK_CATEGORIES, SHARING_PREFERENCES } from '../../constants/index.js'

const PUBLIC_TASK_CATEGORIES = TASK_CATEGORIES.filter(
  (c) => !(PRIVATE_TASK_CATEGORIES as readonly string[]).includes(c)
) as Exclude<(typeof TASK_CATEGORIES)[number], (typeof PRIVATE_TASK_CATEGORIES)[number]>[]

export interface IGroupActivityTask {
  category: (typeof PUBLIC_TASK_CATEGORIES)[number]
  title: string
  status: 'done' | 'missed'
  missedReason?: string
  didInstead?: string
}

export interface IGroupActivity extends Document {
  groupId: Types.ObjectId
  userId: Types.ObjectId
  displayName: string
  date: string
  summary: {
    totalTasks: number
    completedTasks: number
    missedTasks: number
    completionPercentage: number
    tasks: IGroupActivityTask[]
  }
  sharingPreference: (typeof SHARING_PREFERENCES)[number]
  computedAt: Date
}

const groupActivityTaskSchema = new Schema<IGroupActivityTask>(
  {
    category: { type: String, enum: PUBLIC_TASK_CATEGORIES, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['done', 'missed'], required: true },
    missedReason: String,
    didInstead: String,
  },
  { _id: false }
)

const groupActivitySchema = new Schema<IGroupActivity>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: { type: String, required: true },
    date: { type: String, required: true },
    summary: {
      totalTasks: { type: Number, default: 0 },
      completedTasks: { type: Number, default: 0 },
      missedTasks: { type: Number, default: 0 },
      completionPercentage: { type: Number, default: 0 },
      tasks: [groupActivityTaskSchema],
      _id: false,
    },
    sharingPreference: { type: String, enum: SHARING_PREFERENCES, default: 'completion_only' },
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

groupActivitySchema.index({ userId: 1, date: 1 })

export const GroupActivity = model<IGroupActivity>('GroupActivity', groupActivitySchema)
