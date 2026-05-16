import { Schema, model, Document, Types } from 'mongoose'
import { INVITE_STATUSES, GROUP_INVITE_EXPIRY_DAYS } from '../../constants/index.js'

export interface IGroupInvite extends Document {
  groupId: Types.ObjectId
  groupName: string
  invitedBy: Types.ObjectId
  invitedByName: string
  inviteeEmail: string
  inviteeUserId?: Types.ObjectId
  status: (typeof INVITE_STATUSES)[number]
  expiresAt: Date
  sentAt: Date
  respondedAt?: Date
}

const groupInviteSchema = new Schema<IGroupInvite>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    groupName: { type: String, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedByName: { type: String, required: true },
    inviteeEmail: { type: String, required: true, lowercase: true },
    inviteeUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: INVITE_STATUSES, default: 'pending' },
    expiresAt: {
      type: Date,
      default: () => {
        const d = new Date()
        d.setDate(d.getDate() + GROUP_INVITE_EXPIRY_DAYS)
        return d
      },
    },
    sentAt: { type: Date, default: Date.now },
    respondedAt: Date,
  },
  { timestamps: true }
)

export const GroupInvite = model<IGroupInvite>('GroupInvite', groupInviteSchema)
