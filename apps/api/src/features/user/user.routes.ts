import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../../middleware/requireAuth.js'
import { uploadProfilePhoto, deleteProfilePhoto, getProfile, updateProfile, checkEmail } from './user.controller.js'
import { PROFILE_PHOTO } from '../../constants/index.js'

export const userRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PROFILE_PHOTO.MAX_FILE_SIZE_BYTES },
})

userRouter.get('/profile', requireAuth, getProfile)
userRouter.get('/check-email', requireAuth, checkEmail)
userRouter.patch('/profile', requireAuth, updateProfile)
userRouter.post('/profile-photo', requireAuth, upload.single('photo'), uploadProfilePhoto)
userRouter.delete('/profile-photo', requireAuth, deleteProfilePhoto)
