import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/Avatar'
import { profileApi, ProfilePhotoResult } from '../api'

interface PhotoUploadProps {
  name: string
  currentPhoto?: ProfilePhotoResult | null
  onUploaded: (photo: ProfilePhotoResult) => void
  onRemoved: () => void
}

export function PhotoUpload({ name, currentPhoto, onUploaded, onRemoved }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setIsUploading(true)
    try {
      const result = await profileApi.uploadPhoto(file)
      onUploaded(result)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleRemove = async () => {
    setError(null)
    try {
      await profileApi.deletePhoto()
      onRemoved()
    } catch {
      setError('Remove failed. Please try again.')
    } finally {
      setConfirmRemove(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Photo / initials preview */}
      <div className="relative">
        <Avatar
          name={name}
          photoUrl={currentPhoto?.url ?? null}
          thumbnailUrl={currentPhoto?.thumbnailUrl ?? null}
          size="lg"
          className="w-24 h-24 text-2xl"
        />
        {currentPhoto && (
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 shadow-sm text-sm"
            aria-label="Remove photo"
          >
            ✕
          </button>
        )}
      </div>

      {/* Upload area */}
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'w-full max-w-xs border-2 border-dashed rounded-2xl px-6 py-5 text-center',
          'transition-all duration-150',
          isUploading
            ? 'border-sage-300 bg-sage-50 cursor-wait'
            : 'border-stone-200 hover:border-sage-300 hover:bg-sage-50 cursor-pointer'
        )}
      >
        {isUploading ? (
          <p className="text-sm text-sage-600">Uploading...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-stone-700">
              {currentPhoto ? 'Replace photo' : 'Upload a photo'}
            </p>
            <p className="text-xs text-stone-400 mt-1">Click or drag · JPG, PNG, WEBP · max 5MB</p>
          </>
        )}
      </div>

      {error && <p className="text-sm text-amber-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {/* Remove confirmation */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4">
            <p className="text-base font-medium text-stone-800 text-center">
              Remove your photo? Your initials will show instead.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50"
              >
                Keep photo
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex-1 py-3 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-900"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
