import { cn } from '@/lib/utils'

interface CalendarConnectAnswerProps {
  value: string | null
  onChange: (value: string) => void
}

const providers = [
  {
    value: 'google',
    label: 'Google Calendar',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    value: 'microsoft',
    label: 'Microsoft / Outlook',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
        <path fill="#f25022" d="M1 1h10v10H1z"/>
        <path fill="#00a4ef" d="M13 1h10v10H13z"/>
        <path fill="#7fba00" d="M1 13h10v10H1z"/>
        <path fill="#ffb900" d="M13 13h10v10H13z"/>
      </svg>
    ),
  },
]

export function CalendarConnectAnswer({ value, onChange }: CalendarConnectAnswerProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      {providers.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            'w-full px-5 py-4 rounded-2xl text-base font-medium border-2 text-left',
            'transition-all duration-150 flex items-center gap-3',
            value === p.value
              ? 'bg-sage-100 border-sage-500 text-sage-800'
              : 'bg-white border-stone-200 text-stone-700 hover:border-sage-300 hover:bg-sage-50'
          )}
        >
          {p.icon}
          <span>{p.label}</span>
          {value === p.value && (
            <span className="ml-auto text-sage-500 text-sm">✓</span>
          )}
        </button>
      ))}

      <div className="relative flex items-center gap-2 py-1">
        <div className="flex-1 h-px bg-stone-100" />
        <span className="text-xs text-stone-300 shrink-0">or</span>
        <div className="flex-1 h-px bg-stone-100" />
      </div>

      <button
        type="button"
        onClick={() => onChange('later')}
        className={cn(
          'w-full px-5 py-3.5 rounded-2xl text-sm font-medium border-2 text-left',
          'transition-all duration-150 flex items-center gap-3',
          value === 'later'
            ? 'bg-stone-100 border-stone-400 text-stone-700'
            : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
        )}
      >
        <span className="text-base">⏱</span>
        <div>
          <p className="font-medium text-stone-700">Connect later from Settings</p>
          <p className="text-xs text-stone-400 font-normal mt-0.5">
            We'll remind you on your home screen — you won't miss it
          </p>
        </div>
        {value === 'later' && (
          <span className="ml-auto text-stone-500 text-sm shrink-0">✓</span>
        )}
      </button>

      <p className="text-xs text-stone-400 text-center pt-1">
        Read-only access — WellPath never adds or edits events
      </p>
    </div>
  )
}
