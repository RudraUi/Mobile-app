import { useState } from "react"
import { AppHeader } from "../components/AppHeader"
import { BottomNav, type MainTab } from "../components/BottomNav"
import { FilterModal } from "../components/FilterModal"
import { SearchModal } from "../components/SearchModal"
import type { Item, ItemType, Severity, Status } from "../data/mockData"
import { type Project, projectsList } from "../data/projectsData"

interface WalkthroughScreenProps {
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

export function WalkthroughScreen({
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
}: WalkthroughScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<ItemType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all")
  const [filterPriority, setFilterPriority] = useState<Severity | "all">("all")

  const [captureDate, setCaptureDate] = useState("Sep 01 · 10:45 AM")
  const [compareMode, setCompareMode] = useState<"photo" | "split" | "cad">(
    "photo",
  )
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedPinItem, setSelectedPinItem] = useState<Item | null>(null)

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
    <div className="flex flex-col h-full bg-[#0F172A] select-none overflow-hidden text-white">
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

      {/* Main 360° Walkthrough Viewport */}
      <div className="flex-1 relative overflow-hidden bg-slate-950">
        {/* 360° Panoramic Background */}
        <div
          className="w-full h-full relative transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          <div
            className="w-full h-full relative"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=1000&fit=crop)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter:
                compareMode === "cad"
                  ? "grayscale(100%) invert(90%)"
                  : "contrast(1.05)",
            }}
          >
            {/* 360 Ambient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

            {/* 360° Waypoint Floor Arrows (Hotspots to jump to next 360 photo) */}
            <div className="absolute inset-0 pointer-events-none">
              {[
                { x: 38, y: 72, label: "Hallway Riser 02" },
                { x: 62, y: 68, label: "Main Corridor" },
                { x: 80, y: 78, label: "Stairwell B" },
              ].map((wp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCaptureDate("Aug 28 · 03:20 PM")}
                  className="absolute pointer-events-auto cursor-pointer group flex flex-col items-center"
                  style={{
                    left: `${wp.x}%`,
                    top: `${wp.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/60 flex items-center justify-center text-white text-[12px] group-hover:scale-115 group-active:scale-95 transition-all shadow-lg animate-pulse">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0055ff] border-2 border-white" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[8.5px] font-bold text-white shadow-md border border-white/20 whitespace-nowrap">
                    {wp.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Inspection Pins in 360 space */}
          <div className="absolute inset-0 pointer-events-none">
            {filteredItems.slice(0, 4).map((item, idx) => {
              const defaultPositions = [
                { x: 32, y: 40, elev: "Wall Framing" },
                { x: 65, y: 35, elev: "HVAC Duct" },
                { x: 48, y: 55, elev: "Conduit Box" },
                { x: 82, y: 48, elev: "Door Frame" },
              ]
              const pos = defaultPositions[idx] || {
                x: 50,
                y: 50,
                elev: "Inspection",
              }
              const color = getPinColor(item.type)
              const label = getPinIcon(item.type)

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedPinItem(item)
                    onItemClick(item)
                  }}
                  className="absolute pointer-events-auto cursor-pointer group active:scale-110 transition-transform"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-[14px_14px_14px_0] -rotate-45 flex items-center justify-center shadow-lg shadow-black/50 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      <span className="rotate-45 text-white font-black text-[11px] leading-none">
                        {label}
                      </span>
                    </div>
                    <span className="mt-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[8.5px] font-bold text-white shadow-md border border-white/20 whitespace-nowrap">
                      {pos.elev}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>



        {/* Top-Right 360 Controls (Split Screen, 360 Orientation & Zoom) */}
        <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-1.5">
          {/* Split Screen Button */}
          <button
            type="button"
            onClick={() => onTabChange("splitview")}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 backdrop-blur-md text-blue-400 flex items-center justify-center shadow-lg border border-slate-700/80 transition-all cursor-pointer"
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
          {/* Compass 360 Orientation */}
          <div className="w-8 h-8 rounded-xl bg-slate-900/90 backdrop-blur-md text-blue-400 flex items-center justify-center shadow-lg border border-slate-700/80">
            <span className="text-[9px] font-extrabold tracking-tight">
              360°
            </span>
          </div>
          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-slate-700/80 transition-all cursor-pointer text-[15px] font-bold"
          >
            +
          </button>
          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-slate-700/80 transition-all cursor-pointer text-[15px] font-bold"
          >
            -
          </button>
        </div>

        {/* Bottom-Left Mini Floor Plan Map Badge */}
        <div className="absolute bottom-3.5 left-3.5 z-20 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/70 text-[9.5px] text-slate-300 font-semibold shadow-lg">
          <div className="w-4 h-4 rounded-md bg-[#0055ff] text-white flex items-center justify-center text-[9px] font-bold">
            L2
          </div>
          <span>Zone B · Room 204</span>
        </div>

        {/* Bottom Floating Pin Preview Card */}
        {selectedPinItem && (
          <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
            <div className="bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                  style={{ backgroundColor: getPinColor(selectedPinItem.type) }}
                >
                  {getPinIcon(selectedPinItem.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      {selectedPinItem.id}
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
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
