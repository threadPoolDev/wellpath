import { cn } from '@/lib/utils'
import { SelectOption } from '../../questions/essentialQuestions'

interface SingleSelectAnswerProps {
  options: SelectOption[]
  value: string | null
  onChange: (value: string) => void
}

export function SingleSelectAnswer({ options, value, onChange }: SingleSelectAnswerProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'w-full px-5 py-4 rounded-2xl text-base font-medium border-2 text-left',
            'transition-all duration-150 flex items-center gap-3',
            value === opt.value
              ? 'bg-sage-100 border-sage-500 text-sage-800'
              : 'bg-white border-stone-200 text-stone-700 hover:border-sage-300 hover:bg-sage-50'
          )}
        >
          <span className="text-xs text-stone-400 font-mono w-4 shrink-0">{i + 1}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
