import { apiClient } from '@/lib/apiClient'

export interface ProfilePhotoResult {
  url: string
  thumbnailUrl: string
  publicId: string
  uploadedAt: string
}

async function uploadPhoto(file: File): Promise<ProfilePhotoResult> {
  const form = new FormData()
  form.append('photo', file)
  const res = await apiClient.post<{ data: ProfilePhotoResult }>('/user/profile-photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

async function deletePhoto(): Promise<void> {
  await apiClient.delete('/user/profile-photo')
}

export const profileApi = { uploadPhoto, deletePhoto }
