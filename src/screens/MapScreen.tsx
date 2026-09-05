import { useState } from "react"
import { AppHeader } from "../components/AppHeader"
import { BottomNav, type MainTab } from "../components/BottomNav"
import { FilterModal } from "../components/FilterModal"
import { SearchModal } from "../components/SearchModal"
import type { Item, ItemType, Severity, Status } from "../data/mockData"
import { type Project, projectsList } from "../data/projectsData"

interface MapScreenProps {
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

export function MapScreen({
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
}: MapScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<ItemType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all")
  const [filterPriority, setFilterPriority] = useState<Severity | "all">("all")

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

      {/* Main Map Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#E5E9F0]">
        {/* Map Canvas */}
        <div
          className="w-full h-full transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          <svg
            viewBox="0 0 430 750"
            className="w-full h-full"
            style={{ background: "#EDF1F7" }}
          >
            <defs>
              <pattern
                id="mapGrid"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke="#DCE2EC"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>
            <rect width="430" height="750" fill="url(#mapGrid)" />

            {/* Road network */}
            <rect x="0" y="80" width="430" height="36" fill="#D5DCE8" />
            <rect x="0" y="320" width="430" height="42" fill="#D5DCE8" />
            <rect x="0" y="580" width="430" height="36" fill="#D5DCE8" />
            <rect x="80" y="0" width="38" height="750" fill="#D5DCE8" />
            <rect x="300" y="0" width="38" height="750" fill="#D5DCE8" />

            {/* Road names */}
            <text
              x="215"
              y="103"
              textAnchor="middle"
              fontSize="9.5"
              fill="#8A99AD"
              fontWeight="600"
              fontFamily="sans-serif"
              letterSpacing="0.8"
            >
              WEST HIGHLAND AVE
            </text>
            <text
              x="215"
              y="346"
              textAnchor="middle"
              fontSize="10"
              fill="#8A99AD"
              fontWeight="600"
              fontFamily="sans-serif"
              letterSpacing="0.8"
            >
              METRO BOULEVARD
            </text>
            <text
              x="215"
              y="603"
              textAnchor="middle"
              fontSize="9.5"
              fill="#8A99AD"
              fontWeight="600"
              fontFamily="sans-serif"
              letterSpacing="0.8"
            >
              HARBOR STREET
            </text>

            {/* Surrounding City Blocks */}
            <rect
              x="12"
              y="12"
              width="56"
              height="56"
              rx="4"
              fill="white"
              stroke="#CAD3E2"
              strokeWidth="1.2"
            />
            <rect
              x="130"
              y="12"
              width="158"
              height="56"
              rx="4"
              fill="white"
              stroke="#CAD3E2"
              strokeWidth="1.2"
            />
            <rect
              x="350"
              y="12"
              width="68"
              height="56"
              rx="4"
              fill="white"
              stroke="#CAD3E2"
              strokeWidth="1.2"
            />

            <rect
              x="12"
              y="128"
              width="56"
              height="180"
              rx="4"
              fill="white"
              stroke="#CAD3E2"
              strokeWidth="1.2"
            />
            <rect
              x="350"
              y="128"
              width="68"
              height="180"
              rx="4"
              fill="white"
              stroke="#CAD3E2"
              strokeWidth="1.2"
            />

            <rect
              x="12"
              y="374"
              width="56"
              height="194"
              rx="4"
              fill="white"
              stroke="#CAD3E2"
              strokeWidth="1.2"
            />
            <rect
              x="350"
              y="374"
              width="68"
              height="194"
              rx="4"
              fill="white"
              stroke="#CAD3E2"
              strokeWidth="1.2"
            />

            <rect
              x="12"
              y="628"
              width="56"
              height="100"
              rx="4"
              fill="white"
              stroke="#CAD3E2"
              strokeWidth="1.2"
            />
            <rect
              x="130"
              y="628"
              width="158"
              height="100"
              rx="4"
              fill="white"
              stroke="#CAD3E2"
              strokeWidth="1.2"
            />
            <rect
              x="350"
              y="628"
              width="68"
              height="100"
              rx="4"
              fill="white"
              stroke="#CAD3E2"
              strokeWidth="1.2"
            />

            {/* ACTIVE PROJECT CONSTRUCTION SITE (Center Zone) */}
            {/* Site Boundary dashed line */}
            <rect
              x="128"
              y="126"
              width="162"
              height="184"
              rx="6"
              fill="#EEF7F4"
              stroke="#0D9488"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Tower Crane Arc */}
            <circle
              cx="209"
              cy="218"
              r="64"
              fill="none"
              stroke="#0D9488"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.6"
            />
            <circle cx="209" cy="218" r="3" fill="#0D9488" />
            <line
              x1="209"
              y1="218"
              x2="260"
              y2="180"
              stroke="#0D9488"
              strokeWidth="1.5"
            />

            {/* Building Footprint (Core) */}
            <rect
              x="148"
              y="156"
              width="122"
              height="124"
              rx="3"
              fill="white"
              stroke="#0D9488"
              strokeWidth="1.5"
            />
            <text
              x="209"
              y="214"
              textAnchor="middle"
              fontSize="10.5"
              fill="#0F766E"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              {selectedProject.name.toUpperCase()}
            </text>
            <text
              x="209"
              y="228"
              textAnchor="middle"
              fontSize="8"
              fill="#14B8A6"
              fontWeight="600"
              fontFamily="sans-serif"
            >
              ZONE A · LEVEL 02 IN PROGRESS
            </text>

            {/* Site Gate Marker */}
            <rect x="128" y="196" width="6" height="24" fill="#0D9488" rx="2" />
            <text
              x="120"
              y="212"
              textAnchor="end"
              fontSize="7.5"
              fill="#0F766E"
              fontWeight="bold"
            >
              GATE 1
            </text>

            {/* GPS Location Tracker Dot */}
            <circle cx="178" cy="254" r="10" fill="#0055ff" fillOpacity="0.2">
              <animate
                attributeName="r"
                values="6;14;6"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                values="0.3;0.05;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="178"
              cy="254"
              r="4.5"
              fill="#0055ff"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>

          {/* Interactive Item Pins Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {filteredItems.slice(0, 6).map((item, idx) => {
              const defaultPositions = [
                { x: 42, y: 26 },
                { x: 58, y: 32 },
                { x: 38, y: 44 },
                { x: 62, y: 58 },
                { x: 48, y: 68 },
                { x: 32, y: 76 },
              ]
              const pos = defaultPositions[idx] || { x: 50, y: 50 }
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
                      className="w-7 h-7 rounded-[14px_14px_14px_0] -rotate-45 flex items-center justify-center shadow-lg shadow-black/25 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      <span className="rotate-45 text-white font-black text-[11px] leading-none">
                        {label}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Top-Right Map Controls (Split Screen, Compass, Zoom In, Zoom Out, Recenter) */}
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
          {/* Compass Needle */}
          <div className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md shadow-black/10 border border-slate-200/80">
            <div className="flex flex-col items-center">
              <span className="text-[7.5px] font-extrabold text-red-500 leading-none">
                N
              </span>
              <div className="w-0.5 h-2.5 bg-slate-400 rounded-full my-0.5" />
            </div>
          </div>
          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md shadow-black/10 border border-slate-200/80 transition-all cursor-pointer text-[15px] font-bold"
            aria-label="Zoom in"
          >
            +
          </button>
          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md shadow-black/10 border border-slate-200/80 transition-all cursor-pointer text-[15px] font-bold"
            aria-label="Zoom out"
          >
            -
          </button>
          {/* Recenter Location */}
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-blue-600 flex items-center justify-center shadow-md shadow-black/10 border border-slate-200/80 transition-all cursor-pointer"
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
              <circle cx="12" cy="12" r="7" />
              <line x1="12" y1="1" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="1" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="23" y2="12" />
            </svg>
          </button>
        </div>

        {/* Bottom Floating Pin Preview Card (if clicked) */}
        {selectedPinItem && (
          <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
            <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-black/15 border border-slate-200/80 flex items-center justify-between gap-3">
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
