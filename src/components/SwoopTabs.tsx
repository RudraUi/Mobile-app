import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

/**
 * The app's folder-style tab bar: a scrolling row of tabs with a sliding blue
 * card that swoops into a continuous baseline. Item detail, captures and the
 * data library all render through this so the shape stays identical.
 */

export interface SwoopTab<T extends string> {
  id: T
  label: string
  icon?: ReactNode
  count?: number
}

interface SwoopTabsProps<T extends string> {
  tabs: SwoopTab<T>[]
  active: T
  onChange: (id: T) => void
  /** Prefixes each tab's DOM id, so panels can point at them with aria. */
  idPrefix: string
  ariaLabel: string
  /** Extra keys that should re-measure the indicator (route changes, etc). */
  deps?: unknown[]
  className?: string
  panelIdPrefix?: string
}

export function SwoopTabs<T extends string>({
  tabs,
  active,
  onChange,
  idPrefix,
  ariaLabel,
  deps = [],
  className = "",
  panelIdPrefix,
}: SwoopTabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
  })
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    const activeEl = listRef.current?.querySelector<HTMLElement>(
      `#${idPrefix}-${active}`,
    )
    if (activeEl && listRef.current) {
      setIndicator({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        ready: true,
      })
      const container = listRef.current
      container.scrollTo({
        left: Math.max(
          0,
          activeEl.offsetLeft -
            container.offsetWidth / 2 +
            activeEl.offsetWidth / 2,
        ),
        behavior: "smooth",
      })
    }
    if (isFirstRender) {
      const timer = setTimeout(() => setIsFirstRender(false), 80)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isFirstRender, idPrefix, ...deps])

  const activeIndex = tabs.findIndex((t) => t.id === active)

  return (
    <nav
      className={`relative shrink-0 border-t border-slate-100 bg-white ${className}`}
      aria-label={ariaLabel}
    >
      {/* Continuous thin blue baseline spanning the bottom of the tab bar */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[1px] bg-[#0055ff]" />

      <div
        ref={listRef}
        role="tablist"
        className="relative flex items-end overflow-x-auto pl-0 pr-3.5 pt-2.5 no-scrollbar scroll-smooth"
      >
        {/* Sliding elastic active tab background */}
        {indicator.ready && (
          <div
            className={`pointer-events-none absolute bottom-0 z-15 h-[35px] bg-[#0055ff] shadow-xs ${
              indicator.left === 0
                ? "rounded-tl-none rounded-tr-xl"
                : "rounded-t-xl"
            } ${
              isFirstRender
                ? ""
                : "transition-all duration-320 ease-[cubic-bezier(0.34,1.45,0.64,1)]"
            }`}
            style={{
              left: `${indicator.left}px`,
              width: `${indicator.width}px`,
            }}
          >
            {/* Left swoop curve (hidden on the first tab) */}
            {activeIndex > 0 && (
              <svg
                className="pointer-events-none absolute -left-[11px] bottom-0 z-15 h-[12px] w-[12px]"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M 12 0 C 12 6.6 6.6 12 0 12 L 12 12 Z"
                  fill="#0055ff"
                />
              </svg>
            )}

            {/* Right swoop curve */}
            <svg
              className="pointer-events-none absolute -right-[11px] bottom-0 z-15 h-[12px] w-[12px]"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path d="M 0 0 C 0 6.6 5.4 12 12 12 L 0 12 Z" fill="#0055ff" />
            </svg>
          </div>
        )}

        {tabs.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              type="button"
              key={tab.id}
              id={`${idPrefix}-${tab.id}`}
              onClick={() => onChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={
                panelIdPrefix ? `${panelIdPrefix}-${tab.id}` : undefined
              }
              className={`group relative z-20 flex h-[35px] shrink-0 cursor-pointer items-center gap-1.5 px-3.5 text-left font-medium transition-all duration-200 active:scale-[0.96] ${
                isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.icon && (
                <span
                  className={`flex shrink-0 items-center transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {tab.icon}
                </span>
              )}

              <span className="whitespace-nowrap text-[12.5px] font-medium leading-none transition-colors duration-200">
                {tab.label}
              </span>

              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] tabular-nums transition-all duration-200 ${
                    isActive
                      ? "scale-105 bg-white/25 font-bold text-white"
                      : "scale-100 bg-slate-100 font-semibold text-slate-500 group-hover:bg-slate-200/70"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default SwoopTabs
