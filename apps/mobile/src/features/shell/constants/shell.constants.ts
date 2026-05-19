export const TABS = {
  TODAY: 'index',
  ROUTINE: 'routine',
  GROUPS: 'groups',
  HISTORY: 'history',
  SETTINGS: 'settings',
  RELATIONSHIPS: 'relationships',
} as const

export const TAB_LABELS = {
  TODAY: 'Today',
  ROUTINE: 'Routine',
  GROUPS: 'Groups',
  HISTORY: 'History',
  SETTINGS: 'Settings',
  MORE: 'More',
  RELATIONSHIPS: 'Relationships',
} as const

// Icons are emoji strings — swapped for @expo/vector-icons in a future polish pass
export const TAB_ICONS: Record<string, { default: string; active: string }> = {
  index:         { default: '🏠', active: '🏠' },
  routine:       { default: '📅', active: '📅' },
  groups:        { default: '👥', active: '👥' },
  history:       { default: '📊', active: '📊' },
  settings:      { default: '⚙️', active: '⚙️' },
  more:          { default: '···', active: '···' },
  relationships: { default: '💑', active: '💑' },
}

export const MORE_SHEET_OPTIONS = [
  { key: 'relationships', label: 'Relationships ♥', icon: '💑' },
  { key: 'settings',      label: 'Settings',         icon: '⚙️' },
] as const

export const TAB_BAR_HEIGHT = 60   // px — used for bottom inset calculations
export const MORE_SHEET_SNAP_POINT = 240  // px height of the More sheet

export const SHELL_STRINGS = {
  MORE_SHEET_TITLE: 'More',
  BIOMETRIC_PROMPT: 'Unlock WellPath',
  LOCKED_MESSAGE: 'Unlock WellPath to continue',
} as const
