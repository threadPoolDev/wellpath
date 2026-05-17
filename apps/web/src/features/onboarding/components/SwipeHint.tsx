import { useState, useEffect } from 'react'

const STORAGE_KEY = 'onboarding_hint_shown'

export function SwipeHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    setVisible(true)
    localStorage.setItem(STORAGE_KEY, '1')
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="flex items-center justify-center gap-4 text-xs text-stone-400 animate-fade-in">
      <span>← Skip / No</span>
      <span className="text-stone-300">Use arrow keys or click</span>
      <span>Yes / Continue →</span>
    </div>
  )
}
