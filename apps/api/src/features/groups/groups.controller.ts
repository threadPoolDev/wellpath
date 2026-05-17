import { Request, Response, NextFunction } from 'express'
import { sendSuccess, sendCreated, sendNoContent } from '../../lib/response.js'
import * as groupsService from './groups.service.js'

// Express param values type as `string | string[]` but route params are always plain strings
function param(req: Request, key: string): string {
  return req.params[key] as string
}

export async function createGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, inviteEmails } = req.body as { name: string; inviteEmails?: string[] }
    const group = await groupsService.createUserGroup(req.user!.userId, name, inviteEmails)
    sendCreated(res, group)
  } catch (err) {
    next(err)
  }
}

export async function listGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const groups = await groupsService.getUserGroups(req.user!.userId)
    sendSuccess(res, groups)
  } catch (err) {
    next(err)
  }
}

export async function getGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await groupsService.getGroupWithActivity(req.user!.userId, param(req, 'groupId'))
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}

export async function inviteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email: string }
    await groupsService.inviteMember(req.user!.userId, param(req, 'groupId'), email)
    sendSuccess(res, { invited: true })
  } catch (err) {
    next(err)
  }
}

export async function listInvites(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invites = await groupsService.getPendingInvites(req.user!.userId)
    sendSuccess(res, invites)
  } catch (err) {
    next(err)
  }
}

export async function acceptInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await groupsService.acceptInvite(req.user!.userId, param(req, 'inviteId'))
    sendSuccess(res, { accepted: true })
  } catch (err) {
    next(err)
  }
}

export async function declineInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await groupsService.declineInvite(param(req, 'inviteId'))
    sendNoContent(res)
  } catch (err) {
    next(err)
  }
}

export async function leaveGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await groupsService.leaveGroup(req.user!.userId, param(req, 'groupId'))
    sendNoContent(res)
  } catch (err) {
    next(err)
  }
}
