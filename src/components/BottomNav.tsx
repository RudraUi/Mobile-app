import { useRef, useEffect, useState } from "react"

export type MainTab = "home" | "map" | "drawing" | "bim" | "drone" | "walkthrough" | "splitview"

interface BottomNavProps {
  active: MainTab
  onChange: (tab: MainTab) => void
  onFabClick?: () => void
}

const baseTabs: { id: MainTab label: string }[] = [
  { id: "home", label: "Home" },
  { id: "map", label: "Map" },
  { id: "drawing", label: "Drawing" },
  { id: "bim", label: "3D BIM" },
  { id: "drone", label: "Drone" },
  { id: "walkthrough", label: "Walkthrough" },
]

function TabIcon({ id, active }: { id: MainTab active: boolean }) {
  const color = active ? "#0055FF" : "#64748B"

  switch (id) {
    case "home":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 10.2L10.8 3.5C11.5 2.9 12.5 2.9 13.2 3.5L21 10.2C21.6 10.7 22 11.5 22 12.3V19.5C22 20.9 20.9 22 19.5 22H15.5C14.7 22 14 21.3 14 20.5V16C14 14.9 13.1 14 12 14C10.9 14 10 14.9 10 16V20.5C10 21.3 9.3 22 8.5 22H4.5C3.1 22 2 20.9 2 19.5V12.3C2 11.5 2.4 10.7 3 10.2Z"
            fill={active ? color : "none"}
            fillOpacity={active ? 0.18 : 0}
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "map":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21.5C12 21.5 19.5 14.8 19.5 9.5C19.5 5.36 16.14 2 12 2C7.86 2 4.5 5.36 4.5 9.5C4.5 14.8 12 21.5 12 21.5Z"
            fill={active ? color : "none"}
            fillOpacity={active ? 0.18 : 0}
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.5" r="2.8" fill={color} />
        </svg>
      )
    case "drawing":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            fill={active ? color : "none"}
            fillOpacity={active ? 0.16 : 0}
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 10H10V17H3"
            stroke={color}
            strokeWidth={active ? "1.9" : "1.75"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 3V14H21"
            stroke={color}
            strokeWidth={active ? "1.9" : "1.75"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "bim":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.2L20.5 7.1V16.9L12 21.8L3.5 16.9V7.1L12 2.2Z"
            fill={active ? color : "none"}
            fillOpacity={active ? 0.18 : 0}
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 12V21.8"
            stroke={color}
            strokeWidth={active ? "1.9" : "1.75"}
            strokeLinecap="round"
          />
          <path
            d="M12 12L20.5 7.1"
            stroke={color}
            strokeWidth={active ? "1.9" : "1.75"}
            strokeLinecap="round"
          />
          <path
            d="M12 12L3.5 7.1"
            stroke={color}
            strokeWidth={active ? "1.9" : "1.75"}
            strokeLinecap="round"
          />
        </svg>
      )
    case "drone":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <circle
            cx="5"
            cy="5"
            r="2.6"
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            fill={active ? color : "none"}
            fillOpacity={active ? 0.25 : 0}
          />
          <circle
            cx="19"
            cy="5"
            r="2.6"
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            fill={active ? color : "none"}
            fillOpacity={active ? 0.25 : 0}
          />
          <circle
            cx="5"
            cy="19"
            r="2.6"
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            fill={active ? color : "none"}
            fillOpacity={active ? 0.25 : 0}
          />
          <circle
            cx="19"
            cy="19"
            r="2.6"
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            fill={active ? color : "none"}
            fillOpacity={active ? 0.25 : 0}
          />
          <path
            d="M7 7L10 10"
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            strokeLinecap="round"
          />
          <path
            d="M17 7L14 10"
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            strokeLinecap="round"
          />
          <path
            d="M7 17L10 14"
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            strokeLinecap="round"
          />
          <path
            d="M17 17L14 14"
            stroke={color}
            strokeWidth={active ? "2" : "1.8"}
            strokeLinecap="round"
          />
          <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" fill={color} />
        </svg>
      )
    case "walkthrough":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="4" r="2.2" fill={color} />
          <path
            d="m9 20 3-6 2 3 2.5 3M6 12l4-2.5 3 2 4-2"
            stroke={color}
            strokeWidth={active ? "2.1" : "1.85"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "splitview":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <rect
            x="3.5"
            y="3.5"
            width="7"
            height="17"
            rx="2"
            fill={active ? color : "none"}
            fillOpacity={active ? 0.18 : 0}
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
            fill={active ? color : "none"}
            fillOpacity={active ? 0.18 : 0}
            stroke={color}
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

export function BottomNav({ active, onChange, onFabClick }: BottomNavProps) {
  const leftTabs = baseTabs.slice(0, 3)
  const rightTabs = baseTabs.slice(3)

  const containerRef = useRef<HTMLDivElement>(null)

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
          {leftTabs.map((tab) => {
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className="flex-1 flex flex-col items-center justify-center py-0.5 bg-transparent border-none outline-none cursor-pointer group active:scale-95 transition-all"
              >
                {/* Active Pill Capsule Background around Icon */}
                <div
                  className={`w-[36px] h-[26px] rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-[#0055FF] shadow-2xs scale-105"
                      : "text-slate-500 hover:text-slate-700 group-hover:bg-slate-50/80"
                  }`}
                >
                  <TabIcon id={tab.id} active={isActive} />
                </div>

                {/* Tab Label with Micro-dot indicator when active */}
                <div className="flex flex-col items-center mt-0.5">
                  <span
                    className={`text-[9.5px] leading-none transition-colors duration-150 truncate ${
                      isActive
                        ? "font-extrabold text-[#0055FF]"
                        : "font-semibold text-slate-500 group-hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-[#0055FF] mt-0.5 animate-scale-in" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Center Space for Squircle FAB */}
        <div style={{ width: "56px", flexShrink: 0 }} />

        {/* Right 3 Tabs: 3D BIM, Drone, Walkthrough */}
        <div className="flex flex-1 items-center justify-around">
          {rightTabs.map((tab) => {
            const isActive = active === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className="flex-1 flex flex-col items-center justify-center py-0.5 bg-transparent border-none outline-none cursor-pointer group active:scale-95 transition-all"
              >
                {/* Active Pill Capsule Background around Icon */}
                <div
                  className={`w-[36px] h-[26px] rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-[#0055FF] shadow-2xs scale-105"
                      : "text-slate-500 hover:text-slate-700 group-hover:bg-slate-50/80"
                  }`}
                >
                  <TabIcon id={tab.id} active={isActive} />
                </div>

                {/* Tab Label with Micro-dot indicator when active */}
                <div className="flex flex-col items-center mt-0.5">
                  <span
                    className={`text-[9.5px] leading-none transition-colors duration-150 truncate ${
                      isActive
                        ? "font-extrabold text-[#0055FF]"
                        : "font-semibold text-slate-500 group-hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-[#0055FF] mt-0.5 animate-scale-in" />
                  )}
                </div>
              </button>
            )
          })}
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
