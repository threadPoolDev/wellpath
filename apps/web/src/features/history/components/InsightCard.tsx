import { InsightItem } from '../api'

const CATEGORY_ICONS: Record<InsightItem['type'], string> = {
  pattern: '📅',
  positive: '✨',
  observation: '👀',
  weekly_summary: '📊',
}

const DISMISSED_KEY = 'wellpath-dismissed-insights'

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]')
  } catch {
    return []
  }
}

function addDismissed(id: string) {
  const existing = getDismissed()
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...existing, id]))
}

export { getDismissed }

interface InsightCardProps {
  insight: InsightItem
  onDismiss: (id: string) => void
}

export function InsightCard({ insight, onDismiss }: InsightCardProps) {
  function handleDismiss() {
    addDismissed(insight.id)
    onDismiss(insight.id)
  }

  return (
    <div className="relative bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 hover:shadow-md transition-shadow">
      <button
        onClick={handleDismiss}
        aria-label="Dismiss insight"
        className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-lg leading-none"
      >
        ×
      </button>

      <div className="flex items-start gap-3 pr-6">
        <span className="text-2xl shrink-0">{CATEGORY_ICONS[insight.type]}</span>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500 font-medium mb-1">
            {insight.title}
          </p>
          <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
            {insight.body}
          </p>
        </div>
      </div>
    </div>
  )
}
