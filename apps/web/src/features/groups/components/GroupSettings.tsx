import { useState } from 'react'
import { groupsApi } from '../api'

interface GroupSettingsProps {
  groupId: string
  groupName: string
  onBack: () => void
  onLeft: () => void
}

export function GroupSettings({ groupId, groupName, onBack, onLeft }: GroupSettingsProps) {
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [leaving, setLeaving] = useState(false)

  async function handleLeave() {
    setLeaving(true)
    try {
      await groupsApi.leaveGroup(groupId)
      onLeft()
    } catch (err) {
      console.error('[groups] leave failed:', err)
      setLeaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100 dark:border-stone-700 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="flex-1 text-lg font-semibold text-stone-800 dark:text-stone-100 truncate">
          {groupName} — Settings
        </h2>
      </div>

      <div className="flex-1 p-5">
        {/* Leave group */}
        <div className="border border-stone-200 dark:border-stone-700 rounded-2xl p-5">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-1">Leave group</p>
          <p className="text-sm text-stone-400 dark:text-stone-500 mb-4">
            You can always come back if someone invites you again.
          </p>

          {confirmLeave ? (
            <div className="space-y-3">
              <p className="text-sm text-stone-500 dark:text-stone-400">Are you sure you want to leave?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmLeave(false)}
                  className="flex-1 py-2 text-sm border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={leaving}
                  className="flex-1 py-2 text-sm text-red-500 border border-red-200 dark:border-red-800/40 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 transition-colors"
                >
                  {leaving ? 'Leaving...' : 'Yes, leave'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmLeave(true)}
              className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            >
              Leave this group
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
