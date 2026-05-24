import { useState, useEffect } from 'react'
import { historyApi, InsightItem, MoodGraphDay, TrendsResult, TrendsDisabled } from '../api'
import { MoodGraph } from './MoodGraph'
import { InsightCard, getDismissed } from './InsightCard'
import { useNavigate } from 'react-router-dom'

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-stone-100 dark:bg-stone-800 rounded-xl h-24 animate-pulse ${className}`} />
  )
}

export function TrendsTab() {
  const [trends, setTrends] = useState<TrendsResult | TrendsDisabled | null>(null)
  const [graphData, setGraphData] = useState<MoodGraphDay[]>([])
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<InsightItem[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([historyApi.getTrends(), historyApi.getMoodGraph()])
      .then(([t, g]) => {
        setTrends(t)
        setGraphData(g)
        if (!('disabled' in t) && t.insights) {
          const dismissed = getDismissed()
          setInsights(t.insights.filter((i) => !dismissed.includes(i.id)))
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  function handleDismiss(id: string) {
    setInsights((prev) => prev.filter((i) => i.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-4 pt-4">
        <div className="bg-stone-100 dark:bg-stone-800 rounded-xl h-44 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <SkeletonCard />
          <SkeletonCard className="hidden lg:block" />
        </div>
      </div>
    )
  }

  if (trends && 'disabled' in trends) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 gap-3 text-center">
        <p className="text-3xl">📊</p>
        <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Insights are turned off</p>
        <p className="text-xs text-stone-400 dark:text-stone-500 max-w-[220px]">
          You can turn them back on anytime in Settings.
        </p>
        <button
          onClick={() => navigate('/settings')}
          className="mt-2 text-xs text-stone-600 dark:text-stone-300 underline underline-offset-2"
        >
          Go to Settings
        </button>
      </div>
    )
  }

  const hasData = graphData.some((d) => d.energyLevel !== null)
  const hasInsights = insights.length > 0

  if (!hasData && !hasInsights) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 gap-3 text-center">
        <p className="text-3xl">🌱</p>
        <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
          Check back in a few days — we're just getting to know you
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500 max-w-[240px]">
          We need at least 3 days of check-ins to notice patterns
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-4">
      {hasData && (
        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">
            Last 14 days
          </p>
          <MoodGraph data={graphData} />
        </div>
      )}

      {hasInsights && (
        <div>
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">
            Patterns & insights
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} onDismiss={handleDismiss} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

