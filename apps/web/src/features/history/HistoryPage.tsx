import { useState } from 'react'
import { PastRoutinesList } from './components/PastRoutinesList'
import { TrendsTab } from './components/TrendsTab'

type Tab = 'past' | 'trends'

export function HistoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('past')

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 md:px-6 pt-5 pb-3 shrink-0">
        <h1 className="text-base font-semibold text-stone-800 dark:text-stone-100">History</h1>
      </div>

      {/* Tab bar */}
      <div className="px-4 md:px-6 shrink-0 border-b border-stone-200 dark:border-stone-700">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === 'past'
                ? 'border-b-2 border-[#84a98c] text-stone-800 dark:text-stone-100'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            Past Routines
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === 'trends'
                ? 'border-b-2 border-[#84a98c] text-stone-800 dark:text-stone-100'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            Trends
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
        {activeTab === 'past' ? <PastRoutinesList /> : <TrendsTab />}
      </div>
    </div>
  )
}
