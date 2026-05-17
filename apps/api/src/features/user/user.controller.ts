import { Request, Response, NextFunction } from 'express'
import { sendSuccess, sendNoContent } from '../../lib/response.js'
import { ValidationError } from '../../lib/errors.js'
import * as userService from './user.service.js'

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getProfile(req.user!.userId)
    sendSuccess(res, user)
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, workMode, workShift, sleep, exercise, focus, diet, medicines, groupSharingDefaults } = req.body
    const updated = await userService.updateUserProfile(req.user!.userId, {
      name, workMode, workShift, sleep, exercise, focus, diet, medicines, groupSharingDefaults,
    })
    sendSuccess(res, updated)
  } catch (err) {
    next(err)
  }
}

export async function uploadProfilePhoto(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new ValidationError('No file provided')

    const result = await userService.uploadProfilePhoto(
      req.user!.userId,
      req.file.buffer,
      req.file.mimetype
    )
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}

export async function deleteProfilePhoto(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.deleteProfilePhoto(req.user!.userId)
    sendNoContent(res)
  } catch (err) {
    next(err)
  }
}
