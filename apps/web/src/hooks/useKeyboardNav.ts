import { useEffect } from 'react'

interface KeyboardNavOptions {
  onLeft: () => void
  onRight: () => void
  onSelectOption?: (index: number) => void
  enabled?: boolean
}

export function useKeyboardNav({
  onLeft,
  onRight,
  onSelectOption,
  enabled = true,
}: KeyboardNavOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          onLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          onRight()
          break
        default:
          if (onSelectOption && e.key >= '1' && e.key <= '4') {
            e.preventDefault()
            onSelectOption(parseInt(e.key) - 1)
          }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onLeft, onRight, onSelectOption])
}
