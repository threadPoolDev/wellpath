import { Group, GroupInvite } from '../api'
import { GroupListItem } from './GroupListItem'

interface GroupListProps {
  groups: Group[]
  invites: GroupInvite[]
  activeGroupId: string | null
  onSelectGroup: (id: string) => void
  onCreateGroup: () => void
  onAcceptInvite: (inviteId: string) => void
  onDeclineInvite: (inviteId: string) => void
}

export function GroupList({
  groups,
  invites,
  activeGroupId,
  onSelectGroup,
  onCreateGroup,
  onAcceptInvite,
  onDeclineInvite,
}: GroupListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-700 shrink-0">
        <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200">Groups</h2>
        <button
          type="button"
          onClick={onCreateGroup}
          className="text-xs font-semibold text-sage-600 dark:text-sage-400 border border-sage-200 dark:border-sage-700 rounded-lg px-2.5 py-1 hover:bg-sage-50 dark:hover:bg-sage-900/20 transition-colors"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* Pending invites */}
        {invites.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide px-2 mb-1">
              Invites
            </p>
            {invites.map((inv) => (
              <div
                key={inv._id}
                className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3 mb-1.5"
              >
                <p className="text-sm font-medium text-stone-700 dark:text-stone-200 truncate">{inv.groupName}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">from {inv.invitedByName}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onDeclineInvite(inv._id)}
                    className="flex-1 py-1 text-xs text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => onAcceptInvite(inv._id)}
                    className="flex-1 py-1 text-xs text-white bg-stone-800 dark:bg-stone-200 dark:text-stone-900 rounded-lg hover:bg-stone-700 dark:hover:bg-stone-100"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Groups */}
        {groups.length === 0 && invites.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <p className="text-sm text-stone-400 dark:text-stone-500">No groups yet.</p>
            <button
              type="button"
              onClick={onCreateGroup}
              className="mt-2 text-sm text-sage-600 dark:text-sage-400 hover:underline"
            >
              Create one
            </button>
          </div>
        ) : (
          groups.map((g) => (
            <GroupListItem
              key={g._id}
              group={g}
              isActive={activeGroupId === g._id}
              onClick={() => onSelectGroup(g._id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
