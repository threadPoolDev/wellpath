import { Schema, model, Document, Types } from 'mongoose'
import { ONBOARDING_LAYERS, QUESTION_TYPES } from '../../constants/index.js'

export interface IOnboardingResponseItem {
  questionId: string
  questionText: string
  questionType: (typeof QUESTION_TYPES)[number]
  options: string[]
  answerValue: unknown
  answeredAt: Date
  skipped: boolean
  timeToAnswerSeconds: number
}

export interface IOnboardingResponse extends Document {
  userId: Types.ObjectId
  layer: (typeof ONBOARDING_LAYERS)[number]
  sessionId: string
  responses: IOnboardingResponseItem[]
  completedLayer: boolean
  droppedOffAtQuestion?: string
  startedAt: Date
  completedAt?: Date
}

const responseItemSchema = new Schema<IOnboardingResponseItem>(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    questionType: { type: String, enum: QUESTION_TYPES, required: true },
    options: [String],
    answerValue: Schema.Types.Mixed,
    answeredAt: { type: Date, default: Date.now },
    skipped: { type: Boolean, default: false },
    timeToAnswerSeconds: { type: Number, default: 0 },
  },
  { _id: false }
)

const onboardingResponseSchema = new Schema<IOnboardingResponse>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    layer: { type: String, enum: ONBOARDING_LAYERS, required: true },
    sessionId: { type: String, required: true },
    responses: [responseItemSchema],
    completedLayer: { type: Boolean, default: false },
    droppedOffAtQuestion: String,
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true }
)

export const OnboardingResponse = model<IOnboardingResponse>(
  'OnboardingResponse',
  onboardingResponseSchema
)
