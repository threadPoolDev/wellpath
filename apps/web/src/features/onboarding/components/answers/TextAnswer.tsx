import { useRef, useEffect } from 'react'

interface TextAnswerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function TextAnswer({ value, onChange, placeholder = 'Type here...', autoFocus = true }: TextAnswerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [autoFocus])

  return (
    <div className="w-full max-w-xs mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-2xl font-light text-center text-stone-800 bg-transparent border-b-2 border-stone-200 focus:border-sage-500 outline-none py-3 placeholder:text-stone-300 transition-colors duration-150"
      />
    </div>
  )
}
