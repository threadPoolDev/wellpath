import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants'

interface DayBannerProps {
  checkinSubmitted: boolean
  pendingInviteCount: number
}

export function DayBanner({ checkinSubmitted, pendingInviteCount }: DayBannerProps) {
  const navigate = useNavigate()

  if (!checkinSubmitted) {
    return (
      <button
        type="button"
        onClick={() => navigate('/checkin/morning')}
        className="w-full rounded-2xl bg-sage-500 text-white px-5 py-4 text-left flex items-center gap-3 shadow-sm hover:bg-sage-600 transition-all"
      >
        <span className="text-2xl">☀️</span>
        <div>
          <p className="font-semibold">Start your morning check-in</p>
          <p className="text-sage-100 text-sm">3 quick questions · builds your routine for today</p>
        </div>
        <span className="ml-auto text-sage-200 text-lg">→</span>
      </button>
    )
  }

  if (pendingInviteCount > 0) {
    return (
      <button
        type="button"
        onClick={() => navigate(ROUTES.GROUPS)}
        className="w-full rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 px-5 py-4 text-left flex items-center gap-3 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
      >
        <span className="text-2xl">👥</span>
        <div>
          <p className="font-semibold">
            {pendingInviteCount === 1 ? '1 group invite' : `${pendingInviteCount} group invites`} waiting
          </p>
          <p className="text-amber-600 dark:text-amber-500 text-sm">Tap to view and respond</p>
        </div>
        <span className="ml-auto text-amber-400 dark:text-amber-600 text-lg">→</span>
      </button>
    )
  }

  return null
}
