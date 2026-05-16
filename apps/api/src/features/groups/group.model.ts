import { Schema, model, Document, Types } from 'mongoose'
import { MEMBER_ROLES, MEMBER_STATUSES } from '../../constants/index.js'

export interface IGroupMember {
  userId: Types.ObjectId
  email: string
  displayName: string
  role: (typeof MEMBER_ROLES)[number]
  joinedAt: Date
  status: (typeof MEMBER_STATUSES)[number]
}

export interface IGroup extends Document {
  name: string
  createdBy: Types.ObjectId
  members: IGroupMember[]
  settings: {
    allowMemberInvites: boolean
  }
}

const groupMemberSchema = new Schema<IGroupMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    displayName: { type: String, required: true },
    role: { type: String, enum: MEMBER_ROLES, default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: MEMBER_STATUSES, default: 'invited' },
  },
  { _id: false }
)

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [groupMemberSchema],
    settings: {
      allowMemberInvites: { type: Boolean, default: true },
      _id: false,
    },
  },
  { timestamps: true }
)

export const Group = model<IGroup>('Group', groupSchema)
