import { Group } from '../api'
import { Avatar } from '@/components/Avatar'
import { cn } from '@/lib/utils'

interface GroupListItemProps {
  group: Group
  isActive: boolean
  onClick: () => void
}

export function GroupListItem({ group, isActive, onClick }: GroupListItemProps) {
  const activeMembers = group.members.filter((m) => m.status === 'active')

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl p-3 flex items-center gap-3 transition-colors relative',
        isActive
          ? 'bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400'
          : 'hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-sage-500 rounded-r-full" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{group.name}</p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
          {activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex -space-x-1.5 shrink-0">
        {activeMembers.slice(0, 3).map((m) => (
          <Avatar key={m.userId} name={m.displayName} size="sm" variant="thumbnail" />
        ))}
      </div>
    </button>
  )
}
