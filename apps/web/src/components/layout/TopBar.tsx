import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNavStore } from '@/store/navStore'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/Avatar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ROUTES } from '@/constants'

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export function TopBar() {
  const toggleNav = useNavStore((s) => s.toggleNav)
  const toggleMobileDrawer = useNavStore((s) => s.toggleMobileDrawer)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  function handleToggle() {
    if (window.innerWidth < 768) toggleMobileDrawer()
    else toggleNav()
  }

  return (
    <header className="h-14 shrink-0 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between px-4 z-30">
      {/* Left: hamburger */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Toggle navigation"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
      >
        <HamburgerIcon />
      </button>

      {/* Center: wordmark */}
      <span className="font-semibold text-stone-800 dark:text-stone-100 tracking-tight select-none">
        WellPath
      </span>

      {/* Right: theme toggle + avatar dropdown */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            aria-label="Account menu"
          >
            <Avatar
              name={user?.name ?? '?'}
              thumbnailUrl={user?.profilePhoto?.thumbnailUrl ?? undefined}
              size="sm"
              variant="thumbnail"
            />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-10 z-50 w-44 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg py-1 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { navigate(ROUTES.SETTINGS); setShowDropdown(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  Settings
                </button>
                <div className="h-px bg-stone-100 dark:bg-stone-700 my-1" />
                <button
                  type="button"
                  onClick={() => { logout(); setShowDropdown(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
