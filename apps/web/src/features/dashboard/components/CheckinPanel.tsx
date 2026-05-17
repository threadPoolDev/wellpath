import { Routine } from '@/features/routine/api'
import { TaskCard, isTaskActionable } from './TaskCard'

interface CheckinPanelProps {
  routine: Routine | null
  onRoutineUpdate: (updated: Routine) => void
}

export function CheckinPanel({ routine, onRoutineUpdate }: CheckinPanelProps) {
  const pendingTasks = (routine?.tasks ?? []).filter(
    (t) => t.status === 'pending' && isTaskActionable(t.time)
  )

  if (pendingTasks.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-700 p-8 text-center space-y-2">
        <p className="text-2xl">✨</p>
        <p className="text-stone-600 dark:text-stone-300 font-medium">All caught up</p>
        <p className="text-sm text-stone-400 dark:text-stone-500">
          No tasks waiting for a check-in right now.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide">
        Waiting for your check-in
      </p>
      {pendingTasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          routineId={routine!._id}
          onUpdate={onRoutineUpdate}
        />
      ))}
    </div>
  )
}
