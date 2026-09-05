import { useState } from "react"
import { AppHeader } from "../components/AppHeader"
import { BottomNav, type MainTab } from "../components/BottomNav"
import { FilterModal } from "../components/FilterModal"
import { SearchModal } from "../components/SearchModal"
import { MapView } from "../components/MapView"
import type { Item, ItemType, Severity, Status } from "../data/mockData"
import { type Project, projectsList } from "../data/projectsData"
import { FloatingMenu, MenuCaption, MenuItem } from "../components/FloatingMenu"

interface DrawingScreenProps {
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

export function DrawingScreen({
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
}: DrawingScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<ItemType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all")
  const [filterPriority, setFilterPriority] = useState<Severity | "all">("all")

  const [currentLevel, setCurrentLevel] = useState("Level 02")
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showDimensions, setShowDimensions] = useState(true)
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

  const levels = [
    "Roof Deck",
    "Level 03",
    "Level 02",
    "Level 01",
    "Basement B1",
  ]

  return (
    <div className="flex flex-col h-full bg-[#f6f7f9] select-none overflow-hidden">
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

      {/* Wayfinding Top Banner matching user screenshot */}
      <div className="bg-[#FFFDF0] border-b border-[#FDE68A]/80 px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-2xs">
        <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] shrink-0 shadow-xs" />
        <div className="min-w-0">
          <h3 className="text-[12.5px] font-bold text-[#854D0E] leading-snug">
            Walk to the start point
          </h3>
          <p className="text-[11px] font-medium text-[#B45309] leading-snug">
            10.6 m away · follow the amber line
          </p>
        </div>
      </div>

      {/* Main Drawing Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#f8fafc]">
        {/* Drawing Canvas Container */}
        <div
          className="w-full h-full transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          <MapView
            items={filteredItems}
            onPinClick={(item) => {
              setSelectedPinItem(item)
              onItemClick(item)
            }}
          />
        </div>

        {/* Top-Right Floating Controls (Split Screen & Fit view) */}
        <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-1.5">
          {/* Split Screen Button */}
          <button
            type="button"
            onClick={() => onTabChange("splitview")}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-[#0055ff] flex items-center justify-center shadow-md shadow-black/10 border border-slate-200/80 transition-all cursor-pointer"
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
          {/* Reset Zoom / Fit */}
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md shadow-black/10 border border-slate-200/80 transition-all cursor-pointer"
            aria-label="Fit view"
            title="Fit view"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
        </div>

        {/* Bottom-Right Zoom Pill (matching screenshot) */}
        <div className="absolute bottom-5 right-3.5 z-20 flex flex-col bg-white rounded-xl shadow-md border border-slate-200/90 overflow-hidden">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.2))}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors text-[16px] font-medium cursor-pointer"
            aria-label="Zoom in"
          >
            +
          </button>
          <div className="w-full h-px bg-slate-100" />
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.7))}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors text-[16px] font-medium cursor-pointer"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        {/* Bottom Floating Pin Preview Card (if a pin is selected) */}
        {selectedPinItem && (
          <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
            <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-black/15 border border-slate-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px] shrink-0 ${
                    selectedPinItem.type === "issue"
                      ? "bg-red-500"
                      : selectedPinItem.type === "rfi"
                        ? "bg-amber-500"
                        : "bg-blue-600"
                  }`}
                >
                  {selectedPinItem.type === "issue"
                    ? "!"
                    : selectedPinItem.type === "rfi"
                      ? "?"
                      : "T"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      {selectedPinItem.id}
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {selectedPinItem.status}
                    </span>
                  </div>
                  <h4 className="text-[12px] font-bold text-slate-900 truncate">
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
