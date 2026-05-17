import { useNavigate } from 'react-router-dom'
import { useNavStore } from '@/store/navStore'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/Avatar'
import { SideNavItem } from './SideNavItem'
import { ROUTES } from '@/constants'

const NAV_ITEMS = [
  {
    to: ROUTES.DASHBOARD,
    label: 'Today',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: ROUTES.HISTORY,
    label: 'My Routine',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    to: ROUTES.GROUPS,
    label: 'Groups',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: ROUTES.HISTORY,
    label: 'History',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
      </svg>
    ),
  },
  {
    to: ROUTES.SETTINGS,
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

interface SideNavProps {
  onItemClick?: () => void
}

export function SideNav({ onItemClick }: SideNavProps) {
  const isCollapsed = useNavStore((s) => s.isNavCollapsed)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
      {/* Nav items */}
      <nav className={`flex-1 py-3 space-y-0.5 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {NAV_ITEMS.map((item) => (
          <SideNavItem
            key={item.label}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={isCollapsed}
            onClick={onItemClick}
          />
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-stone-100 dark:border-stone-700 p-3">
        <button
          type="button"
          onClick={() => { navigate(ROUTES.SETTINGS); onItemClick?.() }}
          className={`w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Avatar
            name={user?.name ?? '?'}
            thumbnailUrl={user?.profilePhoto?.thumbnailUrl ?? undefined}
            size="sm"
            variant="thumbnail"
          />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium text-stone-700 dark:text-stone-200 truncate">
                {user?.name ?? ''}
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-stone-400 shrink-0">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
