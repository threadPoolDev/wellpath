interface OnboardingSkipProps {
  onSkip: () => void
  label?: string
}

export function OnboardingSkip({ onSkip, label = 'Skip' }: OnboardingSkipProps) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="px-5 py-3 rounded-2xl text-sm font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 hover:text-stone-700 transition-all duration-150"
    >
      {label}
    </button>
  )
}
