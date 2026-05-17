import { cn } from '@/lib/utils'
import { useNavStore } from '@/store/navStore'
import { SideNav } from './SideNav'

export function MobileDrawer() {
  const isOpen = useNavStore((s) => s.isMobileDrawerOpen)
  const toggleMobileDrawer = useNavStore((s) => s.toggleMobileDrawer)

  return (
    <div className="md:hidden">
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 z-40 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={toggleMobileDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-white dark:bg-stone-800 z-50',
          'border-r border-stone-200 dark:border-stone-700 overflow-y-auto',
          'transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center px-5 border-b border-stone-100 dark:border-stone-700">
          <span className="font-semibold text-stone-800 dark:text-stone-100 tracking-tight">WellPath</span>
        </div>

        {/* Nav items — reuse SideNav in expanded mode */}
        <SideNav onItemClick={toggleMobileDrawer} />
      </div>
    </div>
  )
}
