import { Outlet } from 'react-router-dom'
import { useNavStore } from '@/store/navStore'
import { NAV_WIDTH, TRANSITION_MS } from '@/constants'
import { TopBar } from './TopBar'
import { SideNav } from './SideNav'
import { MobileDrawer } from './MobileDrawer'

export function AppShell() {
  const isNavCollapsed = useNavStore((s) => s.isNavCollapsed)

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-stone-900">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop side nav */}
        <aside
          className="hidden md:flex flex-col shrink-0 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 overflow-y-auto"
          style={{
            width: isNavCollapsed ? NAV_WIDTH.COLLAPSED : NAV_WIDTH.EXPANDED,
            transition: `width ${TRANSITION_MS.NAV}ms ease-in-out`,
          }}
        >
          <SideNav />
        </aside>

        {/* Content area */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ transition: `width ${TRANSITION_MS.NAV}ms ease-in-out` }}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay drawer */}
      <MobileDrawer />
    </div>
  )
}
