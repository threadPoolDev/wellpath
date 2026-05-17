interface TimePickerAnswerProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function TimePickerAnswer({ value, onChange, label }: TimePickerAnswerProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
      {label && <p className="text-sm text-stone-500">{label}</p>}
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-3xl font-light text-center text-stone-800 bg-transparent border-b-2 border-stone-200 focus:border-sage-500 outline-none py-3 transition-colors duration-150"
      />
      <p className="text-xs text-stone-400">Tap to change</p>
    </div>
  )
}
