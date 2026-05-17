import { User } from './user.model.js'

export async function findById(userId: string) {
  return User.findById(userId)
}

export async function setProfilePhoto(
  userId: string,
  url: string,
  thumbnailUrl: string,
  publicId: string
) {
  return User.findByIdAndUpdate(
    userId,
    {
      $set: {
        profilePhoto: {
          url,
          thumbnailUrl,
          publicId,
          uploadedAt: new Date(),
        },
      },
    },
    { new: true }
  )
}

export async function clearProfilePhoto(userId: string) {
  return User.findByIdAndUpdate(userId, { $unset: { profilePhoto: 1 } }, { new: true })
}
