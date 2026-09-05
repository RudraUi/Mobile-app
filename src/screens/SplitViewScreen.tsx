import { useState, useRef, useCallback } from "react"
import {
  Building3D,
  FLOOR_HEIGHT,
  pinPosition,
  type ProjectedPin,
  type WorldPin,
} from "../components/Building3D"
import { BottomNav, type MainTab } from "../components/BottomNav"
import { MapView } from "../components/MapView"
import type { Item } from "../data/mockData"
import { FloatingMenu, MenuCaption, MenuItem } from "../components/FloatingMenu"

interface SplitViewScreenProps {
  items: Item[]
  onItemClick: (item: Item) => void
  onCreateClick: () => void
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  markupFilter: string
  onFilterChange: (f: string) => void
}

type PanelType = "drawing" | "3d" | "map" | "drone" | "walkthrough"

const PANEL_OPTIONS: { id: PanelType label: string }[] = [
  { id: "drawing", label: "Drawing" },
  { id: "3d", label: "3D BIM" },
  { id: "map", label: "Map" },
  { id: "drone", label: "Drone" },
  { id: "walkthrough", label: "Walkthrough" },
]

const BG_IMAGES: Record<string, string> = {
  "3d": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=860&h=400&fit=crop",
  drone:
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=860&h=400&fit=crop",
  walkthrough:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=860&h=400&fit=crop",
}

function PanelOptionIcon({ type }: { type: PanelType }) {
  switch (type) {
    case "drawing":
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <path d="M3 10h8v6H3" />
          <path d="M15 3v12" />
        </svg>
      )
    case "3d":
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2.5L20.5 7.4V16.6L12 21.5L3.5 16.6V7.4L12 2.5Z" />
          <path d="M12 12V21.5" />
          <path d="M12 12L20.5 7.4" />
          <path d="M12 12L3.5 7.4" />
        </svg>
      )
    case "map":
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21.5C12 21.5 19 14.8 19 9.5C19 5.36 15.64 2 12 2C8.36 2 5 5.36 5 9.5C5 14.8 12 21.5 12 21.5Z" />
          <circle cx="12" cy="9.5" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case "drone":
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="5" cy="5" r="2.6" />
          <circle cx="19" cy="5" r="2.6" />
          <circle cx="5" cy="19" r="2.6" />
          <circle cx="19" cy="19" r="2.6" />
          <path d="M7 7L17 17M17 7L7 17" strokeWidth="1.6" />
        </svg>
      )
    case "walkthrough":
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 10l5-3v10l-5-3v-4z" />
          <rect x="2" y="6" width="13" height="12" rx="2" />
        </svg>
      )
  }
}

/**
 * The BIM model inside a split panel. Same renderer as the 3D tab — the panel
 * is smaller and there is no level selector, so it opens a little further back
 * and carries three pins rather than six.
 */
function Panel3D({
  items,
  onItemClick,
}: {
  items: Item[]
  onItemClick: (item: Item) => void
}) {
  const pinRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const pinned = items.slice(0, 3)
  const floors = [6, 3, 1]
  const worldPins: WorldPin[] = pinned.map((item, i) => ({
    id: item.id,
    position: pinPosition(floors[i], i * 2),
    floor: floors[i],
    normal: [0, 0, -1],
  }))

  const place = (projected: ProjectedPin[]) => {
    for (const pin of projected) {
      const el = pinRefs.current[pin.id]
      if (!el) continue
      el.style.transform = `translate3d(${pin.x}px, ${pin.y}px, 0) scale(${pin.scale.toFixed(3)})`
      el.style.visibility = pin.visible ? "visible" : "hidden"
      el.style.zIndex = String(Math.round(1000 - pin.depth * 10))
    }
  }

  return (
    <div className="model-stage w-full h-full relative overflow-hidden">
      <Building3D pins={worldPins} onProjectPins={place} />

      <div className="absolute inset-0 pointer-events-none">
        {pinned.map((item, i) => {
          const color =
            item.type === "issue"
              ? "#EF4444"
              : item.type === "rfi"
                ? "#F59E0B"
                : "#0055ff"
          return (
            <div
              key={item.id}
              ref={(el) => {
                pinRefs.current[item.id] = el
              }}
              className="absolute left-0 top-0 pointer-events-none will-change-transform origin-top-left"
              style={{ visibility: "hidden", transformOrigin: "0 0" }}
            >
              <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full">
                <span className="mb-0.5 px-1 py-[0.5px] rounded-[3px] bg-white/95 border border-slate-200 text-[6.5px] font-bold text-[#0055ff] tabular-nums leading-tight">
                  +{(floors[i] * FLOOR_HEIGHT).toFixed(1)}m
                </span>
                <button
                  type="button"
                  onClick={() => onItemClick(item)}
                  aria-label={`Open ${item.title}`}
                  className="pointer-events-auto relative w-4.5 h-4.5 rounded-[9px_9px_9px_0] -rotate-45 flex items-center justify-center shadow-sm shadow-black/30 cursor-pointer active:scale-95 before:absolute before:-inset-2 before:content-['']"
                  style={{ backgroundColor: color }}
                >
                  <span className="rotate-45 text-white font-bold text-[8px]">
                    {item.type === "issue"
                      ? "!"
                      : item.type === "rfi"
                        ? "?"
                        : "T"}
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PanelContent({
  type,
  items,
  onItemClick,
}: {
  type: PanelType
  items: Item[]
  onItemClick: (item: Item) => void
}) {
  if (type === "drawing") {
    return (
      <div className="w-full h-full bg-[#f0f2f5]">
        <MapView items={items} onPinClick={onItemClick} />
      </div>
    )
  }

  if (type === "map") {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#EDF1F7]">
        <svg viewBox="0 0 430 300" className="w-full h-full">
          <defs>
            <pattern
              id="splitMapGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#DCE2EC"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="430" height="300" fill="url(#splitMapGrid)" />

          {/* Streets */}
          <rect x="0" y="40" width="430" height="24" fill="#D5DCE8" />
          <rect x="0" y="160" width="430" height="26" fill="#D5DCE8" />
          <rect x="70" y="0" width="24" height="300" fill="#D5DCE8" />
          <rect x="260" y="0" width="24" height="300" fill="#D5DCE8" />

          {/* Surrounding blocks */}
          <rect
            x="8"
            y="8"
            width="54"
            height="26"
            rx="3"
            fill="white"
            stroke="#CAD3E2"
            strokeWidth="1"
          />
          <rect
            x="102"
            y="8"
            width="148"
            height="26"
            rx="3"
            fill="white"
            stroke="#CAD3E2"
            strokeWidth="1"
          />
          <rect
            x="292"
            y="8"
            width="130"
            height="26"
            rx="3"
            fill="white"
            stroke="#CAD3E2"
            strokeWidth="1"
          />

          {/* Active Site Zone */}
          <rect
            x="100"
            y="70"
            width="152"
            height="82"
            rx="4"
            fill="#EEF7F4"
            stroke="#0D9488"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <rect
            x="115"
            y="82"
            width="122"
            height="58"
            rx="2"
            fill="white"
            stroke="#0D9488"
            strokeWidth="1.2"
          />
          <text
            x="176"
            y="112"
            textAnchor="middle"
            fontSize="9"
            fill="#0F766E"
            fontWeight="bold"
          >
            CONSTRUCTION SITE
          </text>
          <text
            x="176"
            y="124"
            textAnchor="middle"
            fontSize="7"
            fill="#14B8A6"
            fontWeight="600"
          >
            ZONE A · LEVEL 02
          </text>

          {/* GPS Marker */}
          <circle
            cx="140"
            cy="120"
            r="3.5"
            fill="#0055ff"
            stroke="white"
            strokeWidth="1.2"
          />
        </svg>

        {/* Floating Pins */}
        <div className="absolute inset-0 pointer-events-none">
          {items.slice(0, 3).map((item, i) => {
            const positions = [
              { x: 38, y: 38 },
              { x: 55, y: 34 },
              { x: 74, y: 65 },
            ]
            const pos = positions[i] || { x: 50, y: 50 }
            const color =
              item.type === "issue"
                ? "#EF4444"
                : item.type === "rfi"
                  ? "#F59E0B"
                  : "#0055ff"
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemClick(item)}
                className="absolute pointer-events-auto cursor-pointer"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div
                  className="w-6 h-6 rounded-[12px_12px_12px_0] -rotate-45 flex items-center justify-center shadow-md shadow-black/25"
                  style={{ backgroundColor: color }}
                >
                  <span className="rotate-45 text-white font-bold text-[9px]">
                    {item.type === "issue"
                      ? "!"
                      : item.type === "rfi"
                        ? "?"
                        : "T"}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (type === "3d") {
    return <Panel3D items={items} onItemClick={onItemClick} />
  }

  // Drone / Walkthrough
  const bgUrl = BG_IMAGES[type] || BG_IMAGES["drone"]
  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {type === "drone" && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 40 80 L 220 90 L 230 180 L 50 190 L 360 220"
            fill="none"
            stroke="#0055ff"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.8"
          />
        </svg>
      )}

      {/* Pins */}
      <div className="absolute inset-0 pointer-events-none">
        {items.slice(0, 3).map((item, i) => {
          const positions = [
            { x: 30, y: 38 },
            { x: 65, y: 48 },
            { x: 45, y: 72 },
          ]
          const pos = positions[i] || { x: 50, y: 50 }
          const color =
            item.type === "issue"
              ? "#EF4444"
              : item.type === "rfi"
                ? "#F59E0B"
                : "#0055ff"
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item)}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div
                className="w-6 h-6 rounded-[12px_12px_12px_0] -rotate-45 flex items-center justify-center shadow-md shadow-black/40"
                style={{ backgroundColor: color }}
              >
                <span className="rotate-45 text-white font-bold text-[9px]">
                  {item.type === "issue"
                    ? "!"
                    : item.type === "rfi"
                      ? "?"
                      : "T"}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MiniToggle({ on, onToggle }: { on: boolean onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-9 h-5 rounded-full transition-colors duration-200 relative flex-shrink-0 cursor-pointer p-0.5 outline-none ${
        on
          ? "bg-[#0055ff] shadow-[0_0_10px_rgba(0,85,255,0.4)]"
          : "bg-[#CBD5E1] dark:bg-slate-700/80 dark:ring-1 dark:ring-white/15"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white switch-thumb transition-transform duration-200 shadow-xs ${
          on ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  )
}

export function SplitViewScreen({
  items,
  onItemClick,
  onCreateClick,
  activeTab,
  onTabChange,
  markupFilter: _markupFilter,
  onFilterChange: _onFilterChange,
}: SplitViewScreenProps) {
  const [splitPos, setSplitPos] = useState(0.5)
  const [panelA, setPanelA] = useState<PanelType>("3d")
  const [panelB, setPanelB] = useState<PanelType>("drawing")
  const [dropdownOpenA, setDropdownOpenA] = useState(false)
  const [dropdownOpenB, setDropdownOpenB] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const [showIssues, setShowIssues] = useState(true)
  const [showTasks, setShowTasks] = useState(true)
  const [showRfis, setShowRfis] = useState(true)
  const [showFieldNotes, setShowFieldNotes] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const filteredItems = items.filter((item) => {
    if (item.type === "issue" && !showIssues) return false
    if (item.type === "task" && !showTasks) return false
    if (item.type === "rfi" && !showRfis) return false
    if (item.type === "fieldnote" && !showFieldNotes) return false
    return true
  })

  // Top / Bottom Horizontal Split Dragging
  const handleDividerPointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      draggingRef.current = true

      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!draggingRef.current || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const clientY =
          "touches" in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY
        const fraction = Math.min(
          Math.max((clientY - rect.top) / rect.height, 0.2),
          0.8,
        )
        setSplitPos(fraction)
      }

      const onUp = () => {
        draggingRef.current = false
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("touchmove", onMove)
        window.removeEventListener("mouseup", onUp)
        window.removeEventListener("touchend", onUp)
      }

      window.addEventListener("mousemove", onMove)
      window.addEventListener("touchmove", onMove)
      window.addEventListener("mouseup", onUp)
      window.addEventListener("touchend", onUp)
    },
    [],
  )

  return (
    <div className="relative flex flex-col h-full bg-white select-none overflow-hidden">
      {/* Main Split View Area (Top Panel + Bottom Panel with Horizontal Divider) */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 overflow-hidden bg-slate-900"
      >
        {/* Panel A (Top Panel) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: `${splitPos * 100}%`,
            overflow: "hidden",
          }}
        >
          <PanelContent
            type={panelA}
            items={filteredItems}
            onItemClick={onItemClick}
          />

          {/* Panel A Interactive On-Screen Dropdown (Top Left) */}
          <div className="absolute top-3 left-3 z-30">
            <button
              type="button"
              onClick={() => {
                setDropdownOpenA((v) => !v)
                setDropdownOpenB(false)
              }}
              className="flex items-center gap-1.5 bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-slate-800 h-[26px] px-2 rounded-lg text-[11px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100/90 transition-all cursor-pointer"
            >
              <span className="w-3.5 h-3.5 rounded bg-[#0055ff] text-white flex items-center justify-center text-[8.5px] font-extrabold shadow-2xs">
                A
              </span>
              <span className="leading-none">
                {PANEL_OPTIONS.find((p) => p.id === panelA)?.label}
              </span>
              <svg
                width="8"
                height="5"
                viewBox="0 0 10 6"
                fill="none"
                className={`transition-transform duration-200 ${
                  dropdownOpenA ? "rotate-180" : "rotate-0"
                }`}
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="#64748b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Panel A view menu */}
            {dropdownOpenA && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpenA(false)}
              />
            )}
            <FloatingMenu open={dropdownOpenA} widthClassName="w-36">
              <MenuCaption>Panel A view</MenuCaption>
              {PANEL_OPTIONS.map((opt) => {
                const isSelected = panelA === opt.id
                return (
                  <MenuItem
                    key={opt.id}
                    selected={isSelected}
                    onClick={() => {
                      setPanelA(opt.id)
                      setDropdownOpenA(false)
                    }}
                    leading={
                      <span
                        className={
                          isSelected ? "text-[#0055ff]" : "text-slate-400"
                        }
                      >
                        <PanelOptionIcon type={opt.id} />
                      </span>
                    }
                  >
                    {opt.label}
                  </MenuItem>
                )
              })}
            </FloatingMenu>
          </div>

          {/* Top Right Controls: Exit Split & Settings */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onTabChange("home")}
              className="h-7 px-2.5 rounded-lg bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-[#0055ff] flex items-center gap-1 text-[11px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100/90 transition-all cursor-pointer"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Exit Split</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-7 h-7 rounded-lg bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100/90 transition-all cursor-pointer"
              aria-label="View settings"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Panel B (Bottom Panel) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${splitPos * 100}%`,
            bottom: 0,
            overflow: "hidden",
          }}
        >
          <PanelContent
            type={panelB}
            items={filteredItems}
            onItemClick={onItemClick}
          />

          {/* Panel B Interactive On-Screen Dropdown (Top Left of Bottom Panel) */}
          <div className="absolute top-3 left-3 z-30">
            <button
              type="button"
              onClick={() => {
                setDropdownOpenB((v) => !v)
                setDropdownOpenA(false)
              }}
              className="flex items-center gap-1.5 bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-slate-800 h-[26px] px-2 rounded-lg text-[11px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100/90 transition-all cursor-pointer"
            >
              <span className="w-3.5 h-3.5 rounded bg-[#0055ff] text-white flex items-center justify-center text-[8.5px] font-extrabold shadow-2xs">
                B
              </span>
              <span className="leading-none">
                {PANEL_OPTIONS.find((p) => p.id === panelB)?.label}
              </span>
              <svg
                width="8"
                height="5"
                viewBox="0 0 10 6"
                fill="none"
                className={`transition-transform duration-200 ${
                  dropdownOpenB ? "rotate-180" : "rotate-0"
                }`}
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="#64748b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Panel B view menu */}
            {dropdownOpenB && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpenB(false)}
              />
            )}
            <FloatingMenu open={dropdownOpenB} widthClassName="w-36">
              <MenuCaption>Panel B view</MenuCaption>
              {PANEL_OPTIONS.map((opt) => {
                const isSelected = panelB === opt.id
                return (
                  <MenuItem
                    key={opt.id}
                    selected={isSelected}
                    onClick={() => {
                      setPanelB(opt.id)
                      setDropdownOpenB(false)
                    }}
                    leading={
                      <span
                        className={
                          isSelected ? "text-[#0055ff]" : "text-slate-400"
                        }
                      >
                        <PanelOptionIcon type={opt.id} />
                      </span>
                    }
                  >
                    {opt.label}
                  </MenuItem>
                )
              })}
            </FloatingMenu>
          </div>
        </div>

        {/* Horizontal Split Divider Bar & Handle */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${splitPos * 100}%`,
            transform: "translateY(-50%)",
            height: "26px",
            cursor: "ns-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 35,
          }}
          onMouseDown={handleDividerPointerDown}
          onTouchStart={handleDividerPointerDown}
        >
          {/* Subtle horizontal line behind handle */}
          <div className="absolute inset-x-0 h-[2px] bg-black/20 backdrop-blur-xs pointer-events-none" />

          {/* Centered pill grip handle */}
          <div className="w-12 h-3.5 bg-white shadow-md shadow-black/25 rounded-md flex items-center justify-center border border-slate-200 cursor-ns-resize active:scale-105 transition-transform z-10">
            <div className="w-5 h-0.5 bg-slate-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Modern Bottom Sheet Settings Modal */}
      {isSettingsModalOpen && (
        <div
          onClick={() => setIsSettingsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs select-none animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-white rounded-t-[28px] shadow-2xl overflow-hidden flex flex-col animate-slide-up border-t border-slate-100 pb-6"
          >
            {/* Grab Handle */}
            <div className="w-9 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
                  Markup Layers
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Toggle visibility of pins and overlays
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl border border-slate-100 px-3.5">
                  {[
                    {
                      label: "Issues",
                      icon: (
                        <span className="w-5 h-5 rounded-md bg-red-100 text-red-500 font-bold text-[10px] flex items-center justify-center">
                          !
                        </span>
                      ),
                      value: showIssues,
                      toggle: () => setShowIssues((v) => !v),
                    },
                    {
                      label: "Tasks",
                      icon: (
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      ),
                      value: showTasks,
                      toggle: () => setShowTasks((v) => !v),
                    },
                    {
                      label: "RFIs",
                      icon: (
                        <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-600 font-bold text-[10px] flex items-center justify-center">
                          ?
                        </span>
                      ),
                      value: showRfis,
                      toggle: () => setShowRfis((v) => !v),
                    },
                    {
                      label: "Field Notes",
                      icon: (
                        <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                          </svg>
                        </span>
                      ),
                      value: showFieldNotes,
                      toggle: () => setShowFieldNotes((v) => !v),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        {row.icon}
                        <span className="text-[13px] font-semibold text-slate-800">
                          {row.label}
                        </span>
                      </div>
                      <MiniToggle on={row.value} onToggle={row.toggle} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Done Button - Soft Rounded Blue Button */}
            <div className="px-5 pt-1">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#0055ff] text-white text-[13px] font-bold hover:bg-blue-600 active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                Apply & Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Navigation Bar */}
      <BottomNav
        active={activeTab}
        onChange={onTabChange}
        onFabClick={onCreateClick}
      />
    </div>
  )
}
