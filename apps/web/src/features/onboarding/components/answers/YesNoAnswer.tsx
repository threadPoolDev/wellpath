import { cn } from '@/lib/utils'

interface YesNoAnswerProps {
  value: string | null
  onChange: (value: 'yes' | 'no' | 'prefer_not_to_say') => void
  allowPreferNotToSay?: boolean
}

const options = [
  { value: 'yes' as const, label: 'Yes' },
  { value: 'no' as const, label: 'No' },
]

export function YesNoAnswer({ value, onChange, allowPreferNotToSay = false }: YesNoAnswerProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'w-full py-4 rounded-2xl text-lg font-medium border-2 transition-all duration-150',
            value === opt.value
              ? 'bg-sage-100 border-sage-500 text-sage-800'
              : 'bg-white border-stone-200 text-stone-700 hover:border-sage-300 hover:bg-sage-50'
          )}
        >
          {opt.label}
        </button>
      ))}
      {allowPreferNotToSay && (
        <button
          type="button"
          onClick={() => onChange('prefer_not_to_say')}
          className={cn(
            'w-full py-3 rounded-2xl text-sm font-medium border transition-all duration-150',
            value === 'prefer_not_to_say'
              ? 'bg-stone-100 border-stone-400 text-stone-700'
              : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600'
          )}
        >
          Prefer not to say
        </button>
      )}
    </div>
  )
}
