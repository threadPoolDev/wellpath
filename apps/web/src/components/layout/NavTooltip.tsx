export function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tooltip">
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg bg-stone-800 dark:bg-stone-700 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 z-50"
      >
        {label}
      </div>
    </div>
  )
}
