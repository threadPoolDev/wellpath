import { UploadApiResponse } from 'cloudinary'
import { cloudinary } from '../../lib/cloudinary.js'
import { ValidationError, NotFoundError } from '../../lib/errors.js'
import { PROFILE_PHOTO } from '../../constants/index.js'
import { setProfilePhoto, clearProfilePhoto, findById, updateProfile } from './user.repository.js'
import { ProfilePhotoResponse } from './user.types.js'
import { IUser } from './user.model.js'
import { embedUserProfile } from '../embeddings/embeddings.service.js'

export async function uploadProfilePhoto(
  userId: string,
  buffer: Buffer,
  mimetype: string
): Promise<ProfilePhotoResponse> {
  if (!PROFILE_PHOTO.ACCEPTED_FORMATS.includes(mimetype as typeof PROFILE_PHOTO.ACCEPTED_FORMATS[number])) {
    throw new ValidationError(`Unsupported format. Accepted: ${PROFILE_PHOTO.ACCEPTED_FORMATS.join(', ')}`)
  }

  if (buffer.byteLength > PROFILE_PHOTO.MAX_FILE_SIZE_BYTES) {
    throw new ValidationError('File size exceeds 5MB limit')
  }

  // Delete existing photo before uploading new one
  const user = await findById(userId)
  if (!user) throw new NotFoundError('User not found')

  if (user.profilePhoto?.publicId) {
    await cloudinary.uploader.destroy(user.profilePhoto.publicId).catch(() => {
      // Non-blocking — old photo cleanup failure should not block new upload
    })
  }

  // Upload full-size (400x400, face gravity)
  const fullUpload = await uploadToCloudinary(buffer, userId, 'full', {
    width: PROFILE_PHOTO.FULL_WIDTH,
    height: PROFILE_PHOTO.FULL_HEIGHT,
    crop: 'fill',
    gravity: 'face',
  })

  // Upload thumbnail (100x100, face gravity)
  const thumbUpload = await uploadToCloudinary(buffer, userId, 'thumb', {
    width: PROFILE_PHOTO.THUMBNAIL_WIDTH,
    height: PROFILE_PHOTO.THUMBNAIL_HEIGHT,
    crop: 'fill',
    gravity: 'face',
  })

  const updated = await setProfilePhoto(userId, fullUpload.secure_url, thumbUpload.secure_url, fullUpload.public_id)
  if (!updated?.profilePhoto) throw new NotFoundError('User not found after update')

  return {
    url: updated.profilePhoto.url,
    thumbnailUrl: updated.profilePhoto.thumbnailUrl,
    publicId: updated.profilePhoto.publicId,
    uploadedAt: updated.profilePhoto.uploadedAt.toISOString(),
  }
}

export async function getProfile(userId: string): Promise<IUser> {
  const user = await findById(userId)
  if (!user) throw new NotFoundError('User not found')
  return user
}

export interface UpdateProfileDto {
  name?: string
  workMode?: string
  workShift?: string
  sleep?: { wakeTime?: string; sleepGoal?: number }
  exercise?: { preference?: string }
  focus?: { peakWindow?: string }
  diet?: { type?: string; waterReminderNeeded?: boolean; restrictions?: string }
  medicines?: Array<{
    nameOrNickname: string
    timings: string[]
    withFood: string
    isCritical: string
    reminderEnabled: boolean
  }>
  groupSharingDefaults?: {
    defaultSharingPreference?: string
    shareWithGroups?: boolean
  }
}

export async function updateUserProfile(userId: string, dto: UpdateProfileDto): Promise<IUser> {
  const fields: Record<string, unknown> = {}

  if (dto.name !== undefined) fields['name'] = dto.name
  if (dto.workMode !== undefined) fields['profile.workMode'] = dto.workMode
  if (dto.workShift !== undefined) fields['profile.workShift'] = dto.workShift

  if (dto.sleep) {
    if (dto.sleep.wakeTime !== undefined) fields['profile.sleep.wakeTime'] = dto.sleep.wakeTime
    if (dto.sleep.sleepGoal !== undefined) fields['profile.sleep.sleepGoal'] = dto.sleep.sleepGoal
  }
  if (dto.exercise?.preference !== undefined) fields['profile.exercise.preference'] = dto.exercise.preference
  if (dto.focus?.peakWindow !== undefined) fields['profile.focus.peakWindow'] = dto.focus.peakWindow

  if (dto.diet) {
    if (dto.diet.type !== undefined) fields['profile.diet.type'] = dto.diet.type
    if (dto.diet.waterReminderNeeded !== undefined) fields['profile.diet.waterReminderNeeded'] = dto.diet.waterReminderNeeded
    if (dto.diet.restrictions !== undefined) fields['profile.diet.restrictions'] = dto.diet.restrictions
  }
  if (dto.medicines !== undefined) fields['profile.health.medicines'] = dto.medicines

  if (dto.groupSharingDefaults) {
    if (dto.groupSharingDefaults.defaultSharingPreference !== undefined) {
      fields['groupSharingDefaults.defaultSharingPreference'] = dto.groupSharingDefaults.defaultSharingPreference
    }
    if (dto.groupSharingDefaults.shareWithGroups !== undefined) {
      fields['groupSharingDefaults.shareWithGroups'] = dto.groupSharingDefaults.shareWithGroups
    }
  }

  const updated = await updateProfile(userId, fields)
  if (!updated) throw new NotFoundError('User not found')

  // Re-embed profile in background when non-medical fields change
  embedUserProfile(userId).catch((err) =>
    console.error('[embeddings] profile re-embedding failed after update:', err)
  )

  return updated
}

export async function deleteProfilePhoto(userId: string): Promise<void> {
  const user = await findById(userId)
  if (!user) throw new NotFoundError('User not found')

  if (user.profilePhoto?.publicId) {
    await cloudinary.uploader.destroy(user.profilePhoto.publicId).catch(() => {})
  }

  await clearProfilePhoto(userId)
}

async function uploadToCloudinary(
  buffer: Buffer,
  userId: string,
  suffix: string,
  transformation: object
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const publicId = `${PROFILE_PHOTO.CLOUDINARY_FOLDER}/${userId}_${suffix}`
    const upload = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        transformation,
      },
      (err, result) => {
        if (err || !result) reject(err ?? new Error('Cloudinary upload failed'))
        else resolve(result)
      }
    )
    upload.end(buffer)
  })
}
