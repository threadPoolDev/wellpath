import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NavTooltip } from './NavTooltip'

interface SideNavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
  onClick?: () => void
}

export function SideNavItem({ to, icon, label, collapsed, onClick }: SideNavItemProps) {
  return (
    <NavTooltip label={collapsed ? label : ''}>
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-xl transition-all duration-150 relative',
            collapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2.5',
            isActive
              ? collapsed
                ? 'text-sage-600 dark:text-sage-400 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-0.5 before:rounded-full before:bg-sage-500'
                : 'bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400 font-semibold'
              : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-200'
          )
        }
      >
        <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>
        {!collapsed && <span className="text-sm">{label}</span>}
      </NavLink>
    </NavTooltip>
  )
}
