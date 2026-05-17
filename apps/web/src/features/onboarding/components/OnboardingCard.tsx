import { cn } from '@/lib/utils'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { OnboardingProgress } from './OnboardingProgress'
import { OnboardingSkip } from './OnboardingSkip'

interface OnboardingCardProps {
  category: string
  question: string
  subtext?: string
  progress: number
  hasAnswer: boolean
  skippable: boolean
  onSkip: () => void
  onContinue: () => void
  children: React.ReactNode
}

export function OnboardingCard({
  category,
  question,
  subtext,
  progress,
  hasAnswer,
  skippable,
  onSkip,
  onContinue,
  children,
}: OnboardingCardProps) {
  const { cardStyle, isSwipingRight, isSwipingLeft, isShaking, handlers } = useSwipeGesture({
    onSwipeLeft: onSkip,
    onSwipeRight: onContinue,
    hasAnswer,
  })

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Progress */}
      <div className="px-6 pt-6 pb-2">
        <OnboardingProgress progress={progress} />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div
          style={cardStyle}
          className={cn(
            'w-full max-w-md bg-white rounded-3xl shadow-sm border border-stone-100 p-8',
            'flex flex-col gap-6 select-none',
            isShaking && 'animate-shake',
            isSwipingRight && !isShaking && 'shadow-sage-200',
            isSwipingLeft && 'shadow-stone-200'
          )}
          {...handlers}
        >
          {/* Swipe tint overlay */}
          {isSwipingRight && !isShaking && (
            <div className="absolute inset-0 rounded-3xl bg-sage-100 opacity-20 pointer-events-none" />
          )}
          {isSwipingLeft && (
            <div className="absolute inset-0 rounded-3xl bg-stone-200 opacity-20 pointer-events-none" />
          )}

          {/* Category label */}
          <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">{category}</p>

          {/* Question */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-stone-800 leading-snug">{question}</h2>
            {subtext && <p className="text-sm text-stone-500 leading-relaxed">{subtext}</p>}
          </div>

          {/* Answer area */}
          <div className="flex-1">{children}</div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-6 pb-8 flex items-center gap-3">
        {skippable && <OnboardingSkip onSkip={onSkip} />}

        <button
          type="button"
          onClick={onContinue}
          disabled={!hasAnswer && !skippable}
          className={cn(
            'flex-1 py-3 rounded-2xl text-sm font-semibold transition-all duration-150',
            hasAnswer || skippable
              ? 'bg-sage-500 text-white hover:bg-sage-600 shadow-sm'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          )}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
