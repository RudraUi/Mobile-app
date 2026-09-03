import { useRef, useLayoutEffect, useState } from "react"

interface TabItem<T extends string> {
  id: T
  label: string
  count?: number
}

interface SegmentedTabsProps<T extends string> {
  tabs: TabItem<T>[]
  active: T
  onChange: (id: T) => void
  color?: string
}

export function SegmentedTabs<T extends string>({
  tabs,
  active,
  onChange,
  color = "#0052ff",
}: SegmentedTabsProps<T>) {
  const activeIndex = tabs.findIndex((t) => t.id === active)
  const total = tabs.length
  const containerRef = useRef<HTMLDivElement>(null)
  const [pillStyle, setPillStyle] = useState<{ left: string width: string }>({
    left: "0%",
    width: `${100 / total}%`,
  })

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const buttons = container.querySelectorAll<HTMLButtonElement>("button")
    const btn = buttons[activeIndex]
    if (!btn) return
    const left = btn.offsetLeft
    const width = btn.offsetWidth
    setPillStyle({ left: `${left}px`, width: `${width}px` })
  }, [activeIndex, tabs])

  return (
    <div
      ref={containerRef}
      style={{
        background: "#f0f2f7",
        borderRadius: "1rem",
        padding: "4px",
        position: "relative",
        display: "flex",
      }}
    >
      {/* Sliding active pill */}
      <div
        style={{
          position: "absolute",
          top: "4px",
          bottom: "4px",
          left: pillStyle.left,
          width: pillStyle.width,
          background: "white",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
          transition: "all 200ms cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "6px 8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "0.75rem",
              transition: "color 200ms",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: isActive ? color : "#94a3b8",
                transition: "color 200ms",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "999px",
                  padding: "1px 6px",
                  background: isActive ? `${color}18` : "#e0e3ea",
                  color: isActive ? color : "#94a3b8",
                  transition: "background 200ms, color 200ms",
                }}
              >
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
