import { Request, Response, NextFunction } from 'express'
import { sendSuccess, sendNoContent } from '../../lib/response.js'
import { ValidationError } from '../../lib/errors.js'
import * as userService from './user.service.js'

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
