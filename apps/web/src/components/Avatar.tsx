import { cn } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg'
type AvatarVariant = 'full' | 'thumbnail'

interface AvatarProps {
  name: string
  photoUrl?: string | null
  thumbnailUrl?: string | null
  size?: AvatarSize
  variant?: AvatarVariant
  className?: string
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function getColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const colors = [
    'bg-rose-200 text-rose-800',
    'bg-amber-200 text-amber-800',
    'bg-lime-200 text-lime-800',
    'bg-teal-200 text-teal-800',
    'bg-sky-200 text-sky-800',
    'bg-violet-200 text-violet-800',
    'bg-pink-200 text-pink-800',
    'bg-indigo-200 text-indigo-800',
  ]
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({
  name,
  photoUrl,
  thumbnailUrl,
  size = 'md',
  variant = 'thumbnail',
  className,
}: AvatarProps) {
  const src = variant === 'thumbnail' ? (thumbnailUrl ?? photoUrl) : photoUrl

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover shrink-0', SIZE_CLASSES[size], className)}
      />
    )
  }

  const initials = getInitials(name)
  const colorClass = getColorFromName(name)

  return (
    <span
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0 select-none',
        SIZE_CLASSES[size],
        colorClass,
        className
      )}
      aria-label={name}
    >
      {initials}
    </span>
  )
}
