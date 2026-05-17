import { Types } from 'mongoose'
import { Group, IGroup } from './group.model.js'
import { GroupInvite, IGroupInvite } from './groupInvite.model.js'
import { GroupActivity, IGroupActivity } from './groupActivity.model.js'

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function createGroup(name: string, creatorId: string, creatorEmail: string, creatorName: string): Promise<IGroup> {
  return Group.create({
    name,
    createdBy: new Types.ObjectId(creatorId),
    members: [{
      userId: new Types.ObjectId(creatorId),
      email: creatorEmail,
      displayName: creatorName,
      role: 'admin',
      status: 'active',
      joinedAt: new Date(),
    }],
    settings: { allowMemberInvites: true },
  })
}

export async function findGroupById(groupId: string): Promise<IGroup | null> {
  return Group.findById(groupId)
}

export async function findGroupsByUser(userId: string): Promise<IGroup[]> {
  return Group.find({ 'members.userId': new Types.ObjectId(userId), 'members.status': 'active' })
}

export async function addMemberToGroup(
  groupId: string,
  userId: string,
  email: string,
  displayName: string
): Promise<IGroup | null> {
  return Group.findByIdAndUpdate(
    groupId,
    {
      $push: {
        members: {
          userId: new Types.ObjectId(userId),
          email,
          displayName,
          role: 'member',
          status: 'active',
          joinedAt: new Date(),
        },
      },
    },
    { new: true }
  )
}

export async function updateMemberStatus(
  groupId: string,
  userId: string,
  status: 'active' | 'invited' | 'left'
): Promise<IGroup | null> {
  return Group.findOneAndUpdate(
    { _id: groupId, 'members.userId': new Types.ObjectId(userId) },
    { $set: { 'members.$.status': status } },
    { new: true }
  )
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export async function createInvite(
  groupId: string,
  groupName: string,
  invitedBy: string,
  invitedByName: string,
  inviteeEmail: string,
  inviteeUserId?: string
): Promise<IGroupInvite> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  return GroupInvite.create({
    groupId: new Types.ObjectId(groupId),
    groupName,
    invitedBy: new Types.ObjectId(invitedBy),
    invitedByName,
    inviteeEmail,
    inviteeUserId: inviteeUserId ? new Types.ObjectId(inviteeUserId) : undefined,
    status: 'pending',
    expiresAt,
    sentAt: new Date(),
  })
}

export async function findPendingInvitesByUser(userId: string, email: string): Promise<IGroupInvite[]> {
  return GroupInvite.find({
    $or: [{ inviteeUserId: new Types.ObjectId(userId) }, { inviteeEmail: email }],
    status: 'pending',
    expiresAt: { $gt: new Date() },
  })
}

export async function findInviteById(inviteId: string): Promise<IGroupInvite | null> {
  return GroupInvite.findById(inviteId)
}

export async function updateInviteStatus(
  inviteId: string,
  status: 'accepted' | 'declined' | 'expired'
): Promise<IGroupInvite | null> {
  return GroupInvite.findByIdAndUpdate(
    inviteId,
    { $set: { status, respondedAt: new Date() } },
    { new: true }
  )
}

// ─── Group activity ───────────────────────────────────────────────────────────

export async function findGroupActivity(groupId: string, date: string): Promise<IGroupActivity[]> {
  return GroupActivity.find({ groupId: new Types.ObjectId(groupId), date })
}

export async function upsertGroupActivity(
  groupId: string,
  userId: string,
  displayName: string,
  date: string,
  summary: IGroupActivity['summary'],
  sharingPreference: string
): Promise<IGroupActivity> {
  return GroupActivity.findOneAndUpdate(
    { groupId: new Types.ObjectId(groupId), userId: new Types.ObjectId(userId), date },
    {
      $set: {
        displayName,
        summary,
        sharingPreference,
        computedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  ) as Promise<IGroupActivity>
}
