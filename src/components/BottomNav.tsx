import { useRef, useEffect, useState } from "react"

export type MainTab = "home" | "map" | "drawing" | "bim" | "drone" | "walkthrough" | "splitview"

interface BottomNavProps {
  active: MainTab
  onChange: (tab: MainTab) => void
  onFabClick?: () => void
}

interface Tab {
  id: MainTab
  label: string
}

const baseTabs: Tab[] = [
  { id: "home", label: "Home" },
  { id: "map", label: "Map" },
  { id: "drawing", label: "Drawing" },
  { id: "bim", label: "3D BIM" },
  { id: "drone", label: "Drone" },
  { id: "walkthrough", label: "Walkthrough" },
]

const ACTIVE_BG = "#EFF6FF"

function TabGlyph({ id, filled }: { id: MainTab; filled: boolean }) {
  const color = filled ? "#0055FF" : "#64748B"

  switch (id) {
    case "home":
      return filled ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 10.2L10.8 3.5C11.5 2.9 12.5 2.9 13.2 3.5L21 10.2C21.6 10.7 22 11.5 22 12.3V19.5C22 20.9 20.9 22 19.5 22H4.5C3.1 22 2 20.9 2 19.5V12.3C2 11.5 2.4 10.7 3 10.2Z"
            fill={color}
          />
          <path d="M9.5 22V16.5C9.5 15.4 10.4 14.5 11.5 14.5H12.5C13.6 14.5 14.5 15.4 14.5 16.5V22" fill={ACTIVE_BG} />
        </svg>
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 10.2L10.8 3.5C11.5 2.9 12.5 2.9 13.2 3.5L21 10.2C21.6 10.7 22 11.5 22 12.3V19.5C22 20.9 20.9 22 19.5 22H15.5C14.7 22 14 21.3 14 20.5V16C14 14.9 13.1 14 12 14C10.9 14 10 14.9 10 16V20.5C10 21.3 9.3 22 8.5 22H4.5C3.1 22 2 20.9 2 19.5V12.3C2 11.5 2.4 10.7 3 10.2Z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "map":
      return filled ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21.5C12 21.5 19.5 14.8 19.5 9.5C19.5 5.36 16.14 2 12 2C7.86 2 4.5 5.36 4.5 9.5C4.5 14.8 12 21.5 12 21.5Z"
            fill={color}
          />
          <circle cx="12" cy="9.5" r="2.3" fill={ACTIVE_BG} />
        </svg>
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21.5C12 21.5 19.5 14.8 19.5 9.5C19.5 5.36 16.14 2 12 2C7.86 2 4.5 5.36 4.5 9.5C4.5 14.8 12 21.5 12 21.5Z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.5" r="2.8" stroke={color} strokeWidth="1.8" />
        </svg>
      )
    case "drawing":
      return filled ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" fill={color} />
          <path
            d="M3 10H10V17H3"
            stroke={ACTIVE_BG}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 3V14H21"
            stroke={ACTIVE_BG}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 10H10V17H3"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 3V14H21"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "bim":
      return filled ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M12 2.2L20.5 7.1V16.9L12 21.8L3.5 16.9V7.1L12 2.2Z" fill={color} />
          <path
            d="M12 12V21.8M12 12L20.5 7.1M12 12L3.5 7.1"
            stroke={ACTIVE_BG}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.2L20.5 7.1V16.9L12 21.8L3.5 16.9V7.1L12 2.2Z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 12V21.8M12 12L20.5 7.1M12 12L3.5 7.1"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      )
    case "drone":
      return filled ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 7L10 10M17 7L14 10M7 17L10 14M17 17L14 14"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="5" cy="5" r="2.6" fill={color} />
          <circle cx="19" cy="5" r="2.6" fill={color} />
          <circle cx="5" cy="19" r="2.6" fill={color} />
          <circle cx="19" cy="19" r="2.6" fill={color} />
          <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" fill={color} />
        </svg>
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 7L10 10M17 7L14 10M7 17L10 14M17 17L14 14"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="5" cy="5" r="2.6" stroke={color} strokeWidth="1.8" />
          <circle cx="19" cy="5" r="2.6" stroke={color} strokeWidth="1.8" />
          <circle cx="5" cy="19" r="2.6" stroke={color} strokeWidth="1.8" />
          <circle cx="19" cy="19" r="2.6" stroke={color} strokeWidth="1.8" />
          <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" stroke={color} strokeWidth="1.8" />
        </svg>
      )
    case "walkthrough":
      return filled ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill={color}>
          <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
          <path d="M9.8 8.9 6 10v5h2v-3.6l1.7-.7-1.9 9.3H9.9l1.6-6.5 1.9 1.8V21h2v-6.4l-2-1.9.6-2.9c1.2 1.4 3 2.3 5 2.3v-2c-1.7 0-3.2-.9-4-2.2l-1-1.6c-.4-.6-1.1-1-1.8-1-.3 0-.5 0-.8.1L9.8 8.9z" />
        </svg>
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="4" r="2.2" stroke={color} strokeWidth="1.8" />
          <path
            d="m9 20 3-6 2 3 2.5 3M6 12l4-2.5 3 2 4-2"
            stroke={color}
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "splitview":
      return filled ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="3.5" width="7" height="17" rx="2" fill={color} />
          <rect x="13.5" y="3.5" width="7" height="17" rx="2" fill={color} />
        </svg>
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <rect
            x="3.5"
            y="3.5"
            width="7"
            height="17"
            rx="2"
            stroke={color}
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="13.5"
            y="3.5"
            width="7"
            height="17"
            rx="2"
            stroke={color}
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

const ICON_EASE = "cubic-bezier(0.34, 1.35, 0.5, 1)"

/* Outline and filled glyphs are stacked so the swap cross-fades instead of snapping. */
function TabIcon({ id, active }: { id: MainTab; active: boolean }) {
  return (
    <span className="relative block w-[19px] h-[19px]">
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: active ? 0 : 1,
          transform: active ? "scale(0.72)" : "scale(1)",
          transition: `opacity 260ms ease, transform 320ms ${ICON_EASE}`,
        }}
      >
        <TabGlyph id={id} filled={false} />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: active ? 1 : 0,
          transform: active ? "scale(1)" : "scale(0.72)",
          transition: `opacity 260ms ease, transform 320ms ${ICON_EASE}`,
        }}
      >
        <TabGlyph id={id} filled />
      </span>
    </span>
  )
}

function TabButton({
  tab,
  isActive,
  justPopped,
  onSelect,
}: {
  tab: Tab
  isActive: boolean
  justPopped: boolean
  onSelect: (tab: MainTab) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tab.id)}
      className="flex-1 flex flex-col items-center justify-center py-0.5 bg-transparent border-none outline-none cursor-pointer group active:scale-90 transition-transform duration-100"
    >
      {/* Active Pill Capsule Background around Icon */}
      <div className="relative w-[36px] h-[26px] rounded-full flex items-center justify-center">
        <span
          className={`absolute inset-0 rounded-full bg-blue-50 shadow-2xs ${
            justPopped ? "animate-nav-pill" : ""
          }`}
          style={
            justPopped
              ? undefined
              : {
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "scale(1)" : "scale(0.5)",
                  transition: `opacity 240ms ease, transform 340ms ${ICON_EASE}`,
                }
          }
        />
        <span
          className={`absolute inset-0 rounded-full bg-slate-100/0 group-hover:bg-slate-100/70 transition-colors duration-200 ${
            isActive ? "hidden" : ""
          }`}
        />
        <span className={`relative ${justPopped ? "animate-nav-icon-pop" : ""}`}>
          <TabIcon id={tab.id} active={isActive} />
        </span>
      </div>

      {/* Tab Label with Micro-dot indicator when active */}
      <div className="flex flex-col items-center mt-0.5">
        <span
          className={`text-[9.5px] leading-none transition-colors duration-200 truncate ${
            isActive
              ? "font-extrabold text-[#0055FF]"
              : "font-semibold text-slate-500 group-hover:text-slate-700"
          } ${justPopped ? "animate-nav-label" : ""}`}
        >
          {tab.label}
        </span>
        <span
          className="w-1 h-1 rounded-full bg-[#0055FF] mt-0.5"
          style={{
            opacity: isActive ? 1 : 0,
            transform: isActive ? "scale(1)" : "scale(0)",
            transition: `opacity 200ms ease, transform 300ms ${ICON_EASE}`,
          }}
        />
      </div>
    </button>
  )
}

export function BottomNav({ active, onChange, onFabClick }: BottomNavProps) {
  const leftTabs = baseTabs.slice(0, 3)
  const rightTabs = baseTabs.slice(3)

  const containerRef = useRef<HTMLDivElement>(null)

  /* Tab that just became active, so its icon can play the spring pop once. */
  const [popped, setPopped] = useState<MainTab | null>(null)
  const prevActive = useRef(active)

  useEffect(() => {
    if (prevActive.current === active) return
    prevActive.current = active
    setPopped(active)
    const timer = setTimeout(() => setPopped(null), 480)
    return () => clearTimeout(timer)
  }, [active])

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-white flex flex-col justify-between select-none z-30 flex-shrink-0"
      style={{
        height: "68px",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Crisp White Arch Dome at top center matching squircle curve */}
      <div
        className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-[60px] h-[34px] bg-white pointer-events-none z-30"
        style={{
          borderTopLeftRadius: "22px",
          borderTopRightRadius: "22px",
        }}
      />

      {/* Blue Squircle FAB (+) Button */}
      <button
        type="button"
        onClick={onFabClick}
        className="absolute -top-[14px] left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer z-40 active:scale-95 transition-transform shadow-none"
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "18px",
          backgroundColor: "#0055FF",
          border: "3.5px solid #ffffff",
          outline: "none",
          boxShadow: "none",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* 6 Direct Tabs Row (3 Left, 3 Right) */}
      <div className="flex items-center w-full pt-1 px-1 flex-1">
        {/* Left 3 Tabs: Home, Map, Drawing */}
        <div className="flex flex-1 items-center justify-around">
          {leftTabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={active === tab.id}
              justPopped={popped === tab.id}
              onSelect={onChange}
            />
          ))}
        </div>

        {/* Center Space for Squircle FAB */}
        <div style={{ width: "56px", flexShrink: 0 }} />

        {/* Right 3 Tabs: 3D BIM, Drone, Walkthrough */}
        <div className="flex flex-1 items-center justify-around">
          {rightTabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={active === tab.id}
              justPopped={popped === tab.id}
              onSelect={onChange}
            />
          ))}
        </div>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="flex justify-center pb-1.5 pt-0">
        <div
          className="rounded-full"
          style={{
            width: "134px",
            height: "4px",
            backgroundColor: "#C8CDD6",
          }}
        />
      </div>
    </div>
  )
}
