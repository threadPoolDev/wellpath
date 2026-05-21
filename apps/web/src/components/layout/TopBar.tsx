import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useNavStore } from '@/store/navStore'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/Avatar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { StreakPanel } from '@/features/streak/StreakPanel'
import { fetchStreak } from '@/features/streak/api'
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
  const [streakOpen, setStreakOpen] = useState(false)

  // Pre-fetch streak so the count shows in TopBar even before panel opens
  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: fetchStreak,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  })

  function handleToggle() {
    if (window.innerWidth < 768) toggleMobileDrawer()
    else toggleNav()
  }

  const streakCount = streakData?.current ?? 0

  return (
    <>
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

        {/* Right: streak + theme toggle + avatar dropdown */}
        <div className="flex items-center gap-1">
          {/* Flame streak button — always visible when user is logged in */}
          {user && (
            <button
              type="button"
              onClick={() => setStreakOpen(true)}
              aria-label={`Streak: ${streakCount} days`}
              className={`flex items-center gap-1 px-2 h-8 rounded-lg transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 ${
                streakCount === 0 ? 'opacity-40' : ''
              }`}
            >
              <span className="text-base leading-none select-none" aria-hidden="true">🔥</span>
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200 tabular-nums">
                {streakCount}
              </span>
            </button>
          )}

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

      {/* Streak Panel — rendered at body level, controlled by TopBar */}
      <StreakPanel isOpen={streakOpen} onClose={() => setStreakOpen(false)} />
    </>
  )
}
