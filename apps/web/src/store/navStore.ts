import { create } from 'zustand'
import { LOCAL_STORAGE_KEYS, DASHBOARD_PANELS } from '@/constants'

type DashboardPanel = 'today' | 'calendar' | 'checkin'

interface NavStore {
  isNavCollapsed: boolean
  activeGroupId: string | null
  dashboardPanel: DashboardPanel
  isMobileDrawerOpen: boolean

  toggleNav: () => void
  setActiveGroup: (groupId: string | null) => void
  setDashboardPanel: (panel: DashboardPanel) => void
  toggleMobileDrawer: () => void
}

export const useNavStore = create<NavStore>((set) => ({
  isNavCollapsed: localStorage.getItem(LOCAL_STORAGE_KEYS.NAV_COLLAPSED) === 'true',
  activeGroupId: null,
  dashboardPanel: DASHBOARD_PANELS.TODAY,
  isMobileDrawerOpen: false,

  toggleNav: () =>
    set((state) => {
      const next = !state.isNavCollapsed
      localStorage.setItem(LOCAL_STORAGE_KEYS.NAV_COLLAPSED, String(next))
      return { isNavCollapsed: next }
    }),

  setActiveGroup: (groupId) => set({ activeGroupId: groupId }),
  setDashboardPanel: (panel) => set({ dashboardPanel: panel }),
  toggleMobileDrawer: () => set((state) => ({ isMobileDrawerOpen: !state.isMobileDrawerOpen })),
}))
