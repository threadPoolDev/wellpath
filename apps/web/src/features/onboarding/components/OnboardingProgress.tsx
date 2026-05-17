import { cn } from '@/lib/utils'
import { ONBOARDING_PROGRESS_LABELS } from '@/constants'

interface OnboardingProgressProps {
  progress: number
}

function getLabel(progress: number): string {
  if (progress >= 100) return ONBOARDING_PROGRESS_LABELS['100']
  if (progress >= 86) return ONBOARDING_PROGRESS_LABELS['86-99']
  if (progress >= 61) return ONBOARDING_PROGRESS_LABELS['61-85']
  if (progress >= 31) return ONBOARDING_PROGRESS_LABELS['31-60']
  return ONBOARDING_PROGRESS_LABELS['0-30']
}

export function OnboardingProgress({ progress }: OnboardingProgressProps) {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full space-y-1.5">
      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full bg-sage-400 rounded-full transition-all duration-500 ease-out')}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="text-xs text-stone-400 text-center">{getLabel(clamped)}</p>
    </div>
  )
}
