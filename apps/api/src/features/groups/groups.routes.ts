import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import {
  createGroup,
  listGroups,
  getGroup,
  inviteMember,
  listInvites,
  acceptInvite,
  declineInvite,
  leaveGroup,
} from './groups.controller.js'

export const groupsRouter = Router()

groupsRouter.post('/', requireAuth, createGroup)
groupsRouter.get('/', requireAuth, listGroups)
groupsRouter.get('/invites', requireAuth, listInvites)
groupsRouter.post('/invites/:inviteId/accept', requireAuth, acceptInvite)
groupsRouter.post('/invites/:inviteId/decline', requireAuth, declineInvite)
groupsRouter.get('/:groupId', requireAuth, getGroup)
groupsRouter.post('/:groupId/invite', requireAuth, inviteMember)
groupsRouter.delete('/:groupId/members/me', requireAuth, leaveGroup)
