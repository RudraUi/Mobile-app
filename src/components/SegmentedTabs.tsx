import type { ReactNode } from "react"

/**
 * The app's inline pill switch: a low track with one raised card on the active
 * option. Used for two-to-four mutually exclusive views that sit inside a
 * panel — calendar modes, record kinds, list/board. For a scrolling section
 * bar with icons, use SwoopTabs instead.
 */

export interface SegmentedTab<T extends string> {
  id: T
  label: string
  icon?: ReactNode
  count?: number
}

interface SegmentedTabsProps<T extends string> {
  tabs: SegmentedTab<T>[]
  active: T
  onChange: (id: T) => void
  /** "sm" is the compact 26px track; "md" the 30px one. */
  size?: "sm" | "md"
  className?: string
}

export function SegmentedTabs<T extends string>({
  tabs,
  active,
  onChange,
  size = "sm",
  className = "",
}: SegmentedTabsProps<T>) {
  const height = size === "sm" ? "h-6.5" : "h-7.5"
  const text = size === "sm" ? "text-[11px]" : "text-[11.5px]"

  return (
    <div
      className={`flex w-full rounded-lg bg-slate-100/80 p-0.5 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            type="button"
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`${height} ${text} flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md font-semibold transition-all duration-150 ${
              isActive
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon && <span className="flex shrink-0">{tab.icon}</span>}
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-[10px] tabular-nums text-slate-400">
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedTabs
