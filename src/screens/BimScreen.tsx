import { useRef, useState } from "react"
import {
  Building3D,
  type Building3DHandle,
  FLOOR_HEIGHT,
  pinPosition,
  type ProjectedPin,
  type WorldPin,
} from "../components/Building3D"
import { AppHeader } from "../components/AppHeader"
import { BottomNav, type MainTab } from "../components/BottomNav"
import { FilterModal } from "../components/FilterModal"
import { SearchModal } from "../components/SearchModal"
import type { Item, ItemType, Severity, Status } from "../data/mockData"
import { type Project, projectsList } from "../data/projectsData"

interface BimScreenProps {
  items: Item[]
  onItemClick: (item: Item) => void
  onCreateClick: () => void
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  markupFilter: string
  onFilterChange: (f: string) => void
  onInviteClick?: () => void
  onProfileClick?: () => void
  userAvatar?: string
  selectedProject?: Project
  onSelectProject?: (p: Project) => void
}

const FLOOR_COUNT = 8

export function BimScreen({
  items,
  onItemClick,
  onCreateClick,
  activeTab,
  onTabChange,
  markupFilter,
  onFilterChange,
  onInviteClick,
  onProfileClick,
  userAvatar,
  selectedProject = projectsList[0],
  onSelectProject,
}: BimScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<ItemType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all")
  const [filterPriority, setFilterPriority] = useState<Severity | "all">("all")

  const [navMode, setNavMode] = useState<"orbit" | "pan" | "walk">("orbit")
  const [selectedPinItem, setSelectedPinItem] = useState<Item | null>(null)
  const [activeFloor, setActiveFloor] = useState<number | null>(null)
  const [compass, setCompass] = useState(0)
  const viewerRef = useRef<Building3DHandle>(null)

  // Pin elements are positioned imperatively from the render loop — going
  // through React state every frame would re-render the tree on each orbit.
  const pinRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleProjectPins = (projected: ProjectedPin[]) => {
    for (const pin of projected) {
      const el = pinRefs.current[pin.id]
      if (!el) continue
      el.style.transform = `translate3d(${pin.x}px, ${pin.y}px, 0)`
      el.style.opacity = pin.visible ? "1" : "0"
      el.style.visibility = pin.visible ? "visible" : "hidden"
      el.style.zIndex = String(Math.round(1000 - pin.depth * 10))
    }
  }

  const handleCameraChange = (yaw: number) => {
    setCompass((current) =>
      Math.abs(current - yaw) > 1.5 ? Math.round(yaw) : current,
    )
  }

  const filteredItems = items.filter((item) => {
    if (markupFilter !== "all" && item.type !== markupFilter) return false
    if (filterType !== "all" && item.type !== filterType) return false
    if (filterStatus !== "all" && item.status !== filterStatus) return false
    if (filterPriority !== "all" && item.severity !== filterPriority)
      return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesTitle = item.title.toLowerCase().includes(q)
      const matchesId = item.id.toLowerCase().includes(q)
      const matchesDesc = item.description?.toLowerCase().includes(q)
      return matchesTitle || matchesId || matchesDesc
    }
    return true
  })

  const pinnedItems = filteredItems.slice(0, 6)
  // Distinct storeys, so elevation tags never land on the same line.
  const PIN_FLOORS = [6, 4, 2, 7, 1, 3]
  const pinFloor = (index: number) => PIN_FLOORS[index % PIN_FLOORS.length]
  const worldPins: WorldPin[] = pinnedItems.map((item, index) => ({
    id: item.id,
    position: pinPosition(pinFloor(index), index),
    floor: pinFloor(index),
  }))

  const getPinColor = (type: string) => {
    if (type === "issue") return "#EF4444"
    if (type === "rfi") return "#F59E0B"
    if (type === "task") return "#0055ff"
    return "#10B981"
  }

  const getPinIcon = (type: string) => {
    if (type === "issue") return "!"
    if (type === "rfi") return "?"
    if (type === "task") return "T"
    return "N"
  }

  return (
    <div className="model-stage flex flex-col h-full select-none overflow-hidden text-slate-900">
      {/* Standard AppHeader */}
      <AppHeader
        markupFilter={markupFilter}
        onFilterChange={onFilterChange}
        onSearchClick={() => setIsSearchOpen(true)}
        onSplitViewClick={() => onTabChange("splitview")}
        isSplitViewActive={activeTab === "splitview"}
        onFilterClick={() => setIsFilterModalOpen(true)}
        isFilterActive={
          filterType !== "all" ||
          filterStatus !== "all" ||
          filterPriority !== "all"
        }
        onInviteClick={onInviteClick}
        onProfileClick={onProfileClick}
        userAvatar={userAvatar}
        selectedProject={selectedProject}
        onSelectProject={onSelectProject}
      />

      {/* Main 3D BIM Viewport — a real model, rendered on canvas */}
      <div className="model-stage flex-1 relative overflow-hidden">
        <Building3D
          floors={FLOOR_COUNT}
          activeFloor={activeFloor}
          pins={worldPins}
          ref={viewerRef}
          onProjectPins={handleProjectPins}
          onCameraChange={handleCameraChange}
        />

        {/* Spatial pins, projected through the model's own camera.
            Only the 28px marker is interactive — the wrapper and the
            elevation tag stay transparent to pointers so a drag that starts
            near a pin still orbits the model. */}
        <div className="absolute inset-0 pointer-events-none">
          {pinnedItems.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => {
                pinRefs.current[item.id] = el
              }}
              className="absolute left-0 top-0 pointer-events-none will-change-transform"
              style={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full">
                <span className="mb-1 px-1.5 py-0.5 rounded-md bg-white/95 border border-slate-200 text-[8.5px] font-bold text-[#0055ff] shadow-2xs tabular-nums">
                  +{(pinFloor(idx) * FLOOR_HEIGHT).toFixed(1)}m
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPinItem(item)
                    onItemClick(item)
                  }}
                  aria-label={`Open ${item.title}`}
                  className="pointer-events-auto w-7 h-7 rounded-[14px_14px_14px_0] -rotate-45 flex items-center justify-center shadow-lg shadow-black/40 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: getPinColor(item.type) }}
                >
                  <span className="rotate-45 text-white font-black text-[11px] leading-none">
                    {getPinIcon(item.type)}
                  </span>
                </button>
                <div className="w-4 h-1.5 bg-black/40 rounded-full blur-[1px] mt-0.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Level selector — isolates one storey of the model */}
        <div className="absolute left-3.5 top-3.5 z-20 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setActiveFloor(null)}
            className={`h-6 rounded-lg px-2 text-[9.5px] font-bold backdrop-blur-md border transition-all cursor-pointer ${
              activeFloor === null
                ? "bg-[#0055ff] text-white border-[#0055ff]"
                : "bg-white/90 text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            ALL
          </button>
          {Array.from(
            { length: FLOOR_COUNT },
            (_, i) => FLOOR_COUNT - 1 - i,
          ).map((floor) => (
            <button
              key={floor}
              type="button"
              onClick={() =>
                setActiveFloor((current) => (current === floor ? null : floor))
              }
              className={`h-6 w-8 rounded-lg text-[9.5px] font-bold tabular-nums backdrop-blur-md border transition-all cursor-pointer ${
                activeFloor === floor
                  ? "bg-[#0055ff] text-white border-[#0055ff]"
                  : "bg-white/90 text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              L{floor}
            </button>
          ))}
        </div>

        {/* Top-Right 3D Controls (Split Screen, 3D View Cube & Zoom) */}
        <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-1.5">
          {/* Split Screen Button */}
          <button
            type="button"
            onClick={() => onTabChange("splitview")}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-slate-50 active:scale-95 backdrop-blur-md text-[#0055ff] flex items-center justify-center shadow-md shadow-slate-900/10 border border-slate-200 transition-all cursor-pointer"
            aria-label="Split Screen View"
            title="Split Screen View"
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <rect
                x="2.5"
                y="3"
                width="6.5"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <rect
                x="11"
                y="3"
                width="6.5"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </button>
          {/* View cube — shows the live heading, tap to restore the ISO view */}
          <button
            type="button"
            onClick={() => viewerRef.current?.reset()}
            title="Reset to isometric view"
            aria-label="Reset to isometric view"
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-slate-50 active:scale-95 backdrop-blur-md text-[#0055ff] flex flex-col items-center justify-center shadow-md shadow-slate-900/10 border border-slate-200 transition-all cursor-pointer"
          >
            <span className="text-[8px] font-extrabold leading-none tracking-tight">
              ISO
            </span>
            <span className="text-[7.5px] font-bold leading-none tabular-nums text-slate-400 mt-0.5">
              {compass}&deg;
            </span>
          </button>
          {/* Zoom In */}
          <button
            type="button"
            onClick={() => viewerRef.current?.zoomBy(-5)}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-slate-50 active:scale-95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md shadow-slate-900/10 border border-slate-200 transition-all cursor-pointer text-[15px] font-bold"
          >
            +
          </button>
          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => viewerRef.current?.zoomBy(5)}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-slate-50 active:scale-95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md shadow-slate-900/10 border border-slate-200 transition-all cursor-pointer text-[15px] font-bold"
          >
            -
          </button>
          {/* Mode Switcher (Orbit / Walk) */}
          <button
            type="button"
            onClick={() =>
              setNavMode((m) => (m === "orbit" ? "walk" : "orbit"))
            }
            className={`w-8 h-8 rounded-xl backdrop-blur-md flex items-center justify-center shadow-md shadow-slate-900/10 border border-slate-200 transition-all cursor-pointer ${
              navMode === "orbit"
                ? "bg-[#0055ff] text-white"
                : "bg-white/95 text-slate-600 hover:bg-slate-50"
            }`}
            title={`Mode: ${navMode}`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>

        {/* Bottom-Left Model Stats Pill */}
        <div className="absolute bottom-3.5 left-3.5 z-20 hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[9.5px] text-slate-500 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>IFC 4.3 · LOD 350 · 60 FPS</span>
        </div>

        {/* Bottom Floating Pin Preview Card */}
        {selectedPinItem && (
          <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
            <div className="bg-white/97 backdrop-blur-md p-3 rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.16)] border border-slate-200 flex items-center justify-between gap-3 text-slate-900">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                  style={{ backgroundColor: getPinColor(selectedPinItem.type) }}
                >
                  {getPinIcon(selectedPinItem.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      {selectedPinItem.id}
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                      {selectedPinItem.status}
                    </span>
                  </div>
                  <h4 className="text-[12px] font-bold text-white truncate">
                    {selectedPinItem.title}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onItemClick(selectedPinItem)}
                className="px-3 py-1.5 rounded-xl bg-[#0055ff] hover:bg-blue-600 text-white text-[11.5px] font-bold shrink-0 transition-all cursor-pointer shadow-xs"
              >
                Inspect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        statusFilter={filterStatus}
        onStatusChange={(s) => setFilterStatus(s as Status | "all")}
        priorityFilter={filterPriority}
        onPriorityChange={(p) => setFilterPriority(p as Severity | "all")}
        typeFilter={filterType}
        onTypeChange={(t) => setFilterType(t as ItemType | "all")}
        onReset={() => {
          setFilterType("all")
          setFilterStatus("all")
          setFilterPriority("all")
        }}
      />

      {/* Dedicated Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={items}
        onItemClick={onItemClick}
      />

      {/* Bottom Nav */}
      <BottomNav
        active={activeTab}
        onChange={onTabChange}
        onFabClick={onCreateClick}
      />
    </div>
  )
}
