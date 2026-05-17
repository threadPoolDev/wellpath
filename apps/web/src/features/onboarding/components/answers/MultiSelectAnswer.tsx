import { cn } from '@/lib/utils'
import { SelectOption } from '../../questions/essentialQuestions'

interface MultiSelectAnswerProps {
  options: SelectOption[]
  value: string[]
  onChange: (value: string[]) => void
}

export function MultiSelectAnswer({ options, value, onChange }: MultiSelectAnswerProps) {
  const toggle = (optValue: string) => {
    onChange(
      value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue]
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      {options.map((opt) => {
        const selected = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              'w-full px-5 py-4 rounded-2xl text-base font-medium border-2 text-left',
              'transition-all duration-150 flex items-center gap-3',
              selected
                ? 'bg-sage-100 border-sage-500 text-sage-800'
                : 'bg-white border-stone-200 text-stone-700 hover:border-sage-300 hover:bg-sage-50'
            )}
          >
            <span
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                selected ? 'bg-sage-500 border-sage-500' : 'border-stone-300'
              )}
            >
              {selected && (
                <svg viewBox="0 0 12 10" fill="none" className="w-3 h-2.5">
                  <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
