import { Avatar } from '@/components/Avatar'
import { GroupActivity } from '../api'
import { cn } from '@/lib/utils'

interface Member {
  userId: string
  displayName: string
  role: string
  status: string
}

interface MemberCardProps {
  member: Member
  activity?: GroupActivity
  isMe: boolean
}

export function MemberCard({ member, activity, isMe }: MemberCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        isMe
          ? 'border-stone-400 dark:border-stone-500 bg-stone-50 dark:bg-stone-800/80'
          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <Avatar name={member.displayName} size="sm" variant="thumbnail" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-700 dark:text-stone-200 truncate">
            {member.displayName}{isMe ? ' (you)' : ''}
          </p>
          {member.role === 'admin' && (
            <p className="text-xs text-stone-400 dark:text-stone-500">Admin</p>
          )}
        </div>
        {activity ? (
          <div className="text-right shrink-0">
            <p className="font-semibold text-stone-700 dark:text-stone-200">
              {activity.summary.completionPercentage}%
              {activity.summary.completionPercentage === 100 && ' ⭐'}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              {activity.summary.completedTasks}/{activity.summary.totalTasks} tasks
            </p>
          </div>
        ) : (
          <p className="text-sm text-stone-300 dark:text-stone-600">No data yet</p>
        )}
      </div>

      {/* Completion bar */}
      {activity && (
        <div className="h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-600 dark:bg-stone-400 rounded-full transition-all"
            style={{ width: `${activity.summary.completionPercentage}%` }}
          />
        </div>
      )}

      {/* Task detail if sharing preference allows */}
      {activity && activity.sharingPreference !== 'completion_only' && activity.summary.tasks.length > 0 && (
        <div className="mt-3 space-y-1">
          {activity.summary.tasks.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="shrink-0 mt-0.5">{t.status === 'done' ? '✓' : '·'}</span>
              <span className={t.status === 'done' ? 'text-stone-600 dark:text-stone-300' : 'text-stone-400 dark:text-stone-500'}>
                {t.title}
              </span>
              {t.missedReason && (
                <span className="text-xs text-stone-400 dark:text-stone-500 italic">"{t.missedReason}"</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
