import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { profileApi } from '@/features/profile/api'

interface PhotoUploadAnswerProps {
  value: string | null
  onChange: (previewUrl: string) => void
}

export function PhotoUploadAnswer({ value, onChange }: PhotoUploadAnswerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setError(null)

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) onChange(e.target.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Cloudinary in the background
    setIsUploading(true)
    try {
      await profileApi.uploadPhoto(file)
    } catch {
      setError('Upload failed — you can add a photo later in Settings.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      {value ? (
        <>
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="w-28 h-28 rounded-full object-cover border-4 border-sage-300 shadow-md"
            />
            {isUploading && (
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                <span className="text-white text-xs">Saving...</span>
              </div>
            )}
            {!isUploading && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 shadow-sm text-sm"
                aria-label="Remove photo"
              >
                ✕
              </button>
            )}
          </div>
          {!isUploading && !error && (
            <p className="text-sm text-sage-700 font-medium">Looking great!</p>
          )}
          {error && <p className="text-xs text-amber-600 text-center">{error}</p>}
        </>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            'w-28 h-28 rounded-full border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-1',
            'cursor-pointer hover:border-sage-400 hover:bg-sage-50 transition-all duration-150'
          )}
        >
          <span className="text-2xl text-stone-300">📷</span>
          <span className="text-xs text-stone-400 text-center leading-tight px-2">Tap to upload</span>
        </div>
      )}

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

      <p className="text-xs text-stone-400 text-center">JPG, PNG or WEBP · Max 5MB</p>
    </div>
  )
}
