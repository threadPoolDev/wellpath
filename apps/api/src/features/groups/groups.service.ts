import { User } from '../user/user.model.js'
import { Routine } from '../routine/routine.model.js'
import { NotFoundError, ForbiddenError, ValidationError } from '../../lib/errors.js'
import { PRIVATE_TASK_CATEGORIES } from '../../constants/index.js'
import {
  createGroup,
  findGroupById,
  findGroupsByUser,
  addMemberToGroup,
  updateMemberStatus,
  createInvite,
  findPendingInvitesByUser,
  findInviteById,
  updateInviteStatus,
  findGroupActivity,
  upsertGroupActivity,
} from './groups.repository.js'
import { IGroup } from './group.model.js'
import { IGroupActivity } from './groupActivity.model.js'

// ─── Group CRUD ───────────────────────────────────────────────────────────────

export async function createUserGroup(
  userId: string,
  name: string,
  inviteEmails: string[] = []
): Promise<IGroup> {
  const creator = await User.findById(userId)
  if (!creator) throw new NotFoundError('User not found')

  const group = await createGroup(name, userId, creator.email, creator.name)

  // Send invites to any provided emails
  for (const email of inviteEmails) {
    const invitee = await User.findOne({ email }).select('_id')
    await createInvite(
      String(group._id),
      group.name,
      userId,
      creator.name,
      email,
      invitee ? String(invitee._id) : undefined
    )
  }

  // Add group to creator's groupIds
  await User.findByIdAndUpdate(userId, { $addToSet: { groupIds: group._id } })

  return group
}

export async function getUserGroups(userId: string): Promise<IGroup[]> {
  return findGroupsByUser(userId)
}

export async function getGroupWithActivity(userId: string, groupId: string): Promise<{
  group: IGroup
  todayActivity: IGroupActivity[]
}> {
  const group = await findGroupById(groupId)
  if (!group) throw new NotFoundError('Group not found')

  const isMember = group.members.some(
    (m) => String(m.userId) === userId && m.status === 'active'
  )
  if (!isMember) throw new ForbiddenError('Not a member of this group')

  const today = new Date().toISOString().slice(0, 10)
  const todayActivity = await findGroupActivity(groupId, today)

  return { group, todayActivity }
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export async function inviteMember(
  userId: string,
  groupId: string,
  inviteeEmail: string
): Promise<void> {
  const group = await findGroupById(groupId)
  if (!group) throw new NotFoundError('Group not found')

  const inviter = group.members.find((m) => String(m.userId) === userId && m.status === 'active')
  if (!inviter) throw new ForbiddenError('Not a member of this group')
  if (inviter.role !== 'admin' && !group.settings.allowMemberInvites) {
    throw new ForbiddenError('Only admins can invite in this group')
  }

  // Check not already a member
  const alreadyMember = group.members.some((m) => m.email === inviteeEmail && m.status === 'active')
  if (alreadyMember) throw new ValidationError('User is already a member')

  const invitee = await User.findOne({ email: inviteeEmail }).select('_id')
  const inviterUser = await User.findById(userId).select('name')

  await createInvite(
    groupId,
    group.name,
    userId,
    inviterUser?.name ?? 'A teammate',
    inviteeEmail,
    invitee ? String(invitee._id) : undefined
  )
}

export async function getPendingInvites(userId: string): Promise<ReturnType<typeof findPendingInvitesByUser>> {
  const user = await User.findById(userId).select('email')
  if (!user) throw new NotFoundError('User not found')
  return findPendingInvitesByUser(userId, user.email)
}

export async function acceptInvite(userId: string, inviteId: string): Promise<void> {
  const invite = await findInviteById(inviteId)
  if (!invite) throw new NotFoundError('Invite not found')
  if (invite.status !== 'pending') throw new ValidationError('Invite is no longer valid')
  if (invite.expiresAt < new Date()) {
    await updateInviteStatus(inviteId, 'expired')
    throw new ValidationError('Invite has expired')
  }

  const user = await User.findById(userId).select('name email')
  if (!user) throw new NotFoundError('User not found')

  await addMemberToGroup(String(invite.groupId), userId, user.email, user.name)
  await updateInviteStatus(inviteId, 'accepted')
  await User.findByIdAndUpdate(userId, { $addToSet: { groupIds: invite.groupId } })
}

export async function declineInvite(inviteId: string): Promise<void> {
  const invite = await findInviteById(inviteId)
  if (!invite || invite.status !== 'pending') throw new NotFoundError('Invite not found or already actioned')
  await updateInviteStatus(inviteId, 'declined')
}

export async function leaveGroup(userId: string, groupId: string): Promise<void> {
  const group = await findGroupById(groupId)
  if (!group) throw new NotFoundError('Group not found')

  const member = group.members.find((m) => String(m.userId) === userId && m.status === 'active')
  if (!member) throw new NotFoundError('Not a member')

  await updateMemberStatus(groupId, userId, 'left')
  await User.findByIdAndUpdate(userId, { $pull: { groupIds: group._id } })
}

// ─── Activity projection ──────────────────────────────────────────────────────
// Computes today's activity for a user across all their active groups.
// Called from the routine task update flow or a scheduled job.

export async function computeUserActivityForToday(userId: string): Promise<void> {
  const user = await User.findById(userId).select('name groupIds groupSharingDefaults')
  if (!user || !user.groupIds?.length) return

  const today = new Date().toISOString().slice(0, 10)
  const routine = await Routine.findOne({ userId, date: today })
  if (!routine) return

  const sharingPreference = user.groupSharingDefaults?.defaultSharingPreference ?? 'completion_only'
  const shareWithGroups = user.groupSharingDefaults?.shareWithGroups ?? true
  if (!shareWithGroups) return

  // Filter out private categories at DB level
  const tasks = routine.tasks.filter(
    (t) => !(PRIVATE_TASK_CATEGORIES as readonly string[]).includes(t.category)
  )

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const missedTasks = tasks.filter((t) => t.status === 'missed').length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const activityTasks = tasks
    .filter((t) => t.status === 'done' || t.status === 'missed')
    .map((t) => ({
      category: t.category as IGroupActivity['summary']['tasks'][number]['category'],
      title: t.title,
      status: t.status as 'done' | 'missed',
      missedReason: sharingPreference === 'with_reasons' ? t.missedReason : undefined,
      didInstead: sharingPreference === 'with_reasons' ? t.didInstead : undefined,
    }))

  const summary: IGroupActivity['summary'] = {
    totalTasks,
    completedTasks,
    missedTasks,
    completionPercentage,
    tasks: sharingPreference === 'completion_only' ? [] : activityTasks,
  }

  for (const groupId of user.groupIds) {
    const group = await findGroupById(String(groupId))
    if (!group) continue
    const isMember = group.members.some((m) => String(m.userId) === userId && m.status === 'active')
    if (!isMember) continue

    await upsertGroupActivity(
      String(groupId),
      userId,
      user.name,
      today,
      summary,
      sharingPreference
    )
  }
}
