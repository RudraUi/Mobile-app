import { useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { BottomNav, type MainTab } from "../components/BottomNav";
import { FilterModal } from "../components/FilterModal";
import { SearchModal } from "../components/SearchModal";
import type { Item, ItemType, Severity, Status } from "../data/mockData";
import { type Project, projectsList } from "../data/projectsData";

interface DroneScreenProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onCreateClick: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  markupFilter: string;
  onFilterChange: (f: string) => void;
  onInviteClick?: () => void;
  onProfileClick?: () => void;
  userAvatar?: string;
  selectedProject?: Project;
  onSelectProject?: (p: Project) => void;
}

export function DroneScreen({
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
}: DroneScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<ItemType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Severity | "all">("all");

  const [flightDate, setFlightDate] = useState("Sep 01 (Today)");
  const [isFlightDateDropdownOpen, setIsFlightDateDropdownOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPinItem, setSelectedPinItem] = useState<Item | null>(null);

  const filteredItems = items.filter((item) => {
    if (markupFilter !== "all" && item.type !== markupFilter) return false;
    if (filterType !== "all" && item.type !== filterType) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterPriority !== "all" && item.severity !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesId = item.id.toLowerCase().includes(q);
      const matchesDesc = item.description?.toLowerCase().includes(q);
      return matchesTitle || matchesId || matchesDesc;
    }
    return true;
  });

  const getPinColor = (type: string) => {
    if (type === "issue") return "#EF4444";
    if (type === "rfi") return "#F59E0B";
    if (type === "task") return "#0055ff";
    return "#10B981";
  };

  const getPinIcon = (type: string) => {
    if (type === "issue") return "!";
    if (type === "rfi") return "?";
    if (type === "task") return "T";
    return "N";
  };

  const flightDates = ["Sep 01 (Today)", "Aug 26 (Mission 08)", "Aug 18 (Mission 07)", "Aug 10 (Baseline)"];

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
        isFilterActive={filterType !== "all" || filterStatus !== "all" || filterPriority !== "all"}
        onInviteClick={onInviteClick}
        onProfileClick={onProfileClick}
        userAvatar={userAvatar}
        selectedProject={selectedProject}
        onSelectProject={onSelectProject}
      />

      {/* Main Drone Orthomosaic Viewport */}
      <div className="flex-1 relative overflow-hidden bg-slate-900">
        {/* Orthomosaic Canvas */}
        <div
          className="w-full h-full relative transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
        >
          {/* Aerial Background Imagery */}
          <div
            className="w-full h-full relative"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1000&h=1200&fit=crop)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "contrast(1.05)",
            }}
          >
            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />

            {/* Flight Path Waypoint Trail (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Waypoint Path */}
              <path
                d="M 60 120 L 360 140 L 370 280 L 70 300 L 80 460 L 350 480 L 340 620 L 90 640"
                fill="none"
                stroke="#0055ff"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.8"
              />
              {/* Waypoint Dots */}
              {[
                { x: 60, y: 120 },
                { x: 360, y: 140 },
                { x: 370, y: 280 },
                { x: 70, y: 300 },
                { x: 80, y: 460 },
                { x: 350, y: 480 },
                { x: 340, y: 620 },
                { x: 90, y: 640 },
              ].map((wp, i) => (
                <circle key={i} cx={wp.x} cy={wp.y} r="3.5" fill="#0055ff" stroke="white" strokeWidth="1.2" />
              ))}
            </svg>
          </div>

          {/* Interactive Inspection Hotspot Pins */}
          <div className="absolute inset-0 pointer-events-none">
            {filteredItems.slice(0, 5).map((item, idx) => {
              const defaultPositions = [
                { x: 32, y: 32, label: "AI Rebar Anomaly" },
                { x: 66, y: 42, label: "Slab Pour Zone" },
                { x: 44, y: 58, label: "Crane Clearance" },
                { x: 76, y: 68, label: "Stockpile Volume" },
                { x: 28, y: 78, label: "Perimeter Gate" },
              ];
              const pos = defaultPositions[idx] || { x: 50, y: 50, label: "Inspect Point" };
              const color = getPinColor(item.type);
              const label = getPinIcon(item.type);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedPinItem(item);
                    onItemClick(item);
                  }}
                  className="absolute pointer-events-auto cursor-pointer group active:scale-110 transition-transform"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="flex flex-col items-center">
                    {/* Hotspot Pin */}
                    <div
                      className="w-7 h-7 rounded-[14px_14px_14px_0] -rotate-45 flex items-center justify-center shadow-lg shadow-black/40 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      <span className="rotate-45 text-white font-black text-[11px] leading-none">
                        {label}
                      </span>
                    </div>

                    {/* AI Tag Chip */}
                    <span className="mt-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[8.5px] font-bold text-white shadow-md border border-white/20 whitespace-nowrap">
                      {pos.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top-Left Flight Date & Layer Mode Selector */}
        <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-2">
          {/* Flight Mission Date Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFlightDateDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md px-2 py-1 rounded-[8px] shadow-xs border border-slate-200/80 text-[10px] font-bold text-slate-800 transition-all cursor-pointer"
            >
              <div className="w-3.5 h-3.5 rounded bg-blue-50 text-[#0055ff] flex items-center justify-center text-[9px]">
                ✈
              </div>
              <span>{flightDate}</span>
              <svg width="7" height="4" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-200 ${isFlightDateDropdownOpen ? "rotate-180" : ""}`}>
                <path d="M1 1L5 5L9 1" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isFlightDateDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsFlightDateDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-1 w-38 bg-white/98 backdrop-blur-md rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-slate-200/80 p-1 z-40 animate-slide-up">
                  <div className="px-2 py-0.5 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Flight Missions
                  </div>
                  {flightDates.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setFlightDate(d);
                        setIsFlightDateDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded-lg text-[10px] transition-colors cursor-pointer ${
                        flightDate === d ? "bg-blue-50 text-[#0055ff] font-bold" : "text-slate-700 hover:bg-slate-50 font-medium"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top-Right Drone Controls (Split Screen, Zoom & AI Scan) */}
        <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-1.5">
          {/* Split Screen Button */}
          <button
            type="button"
            onClick={() => onTabChange("splitview")}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-[#0055ff] flex items-center justify-center shadow-md shadow-black/15 border border-slate-200/80 transition-all cursor-pointer"
            aria-label="Split Screen View"
            title="Split Screen View"
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="3" width="6.5" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <rect x="11" y="3" width="6.5" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md shadow-black/15 border border-slate-200/80 transition-all cursor-pointer text-[15px] font-bold"
          >
            +
          </button>
          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md shadow-black/15 border border-slate-200/80 transition-all cursor-pointer text-[15px] font-bold"
          >
            -
          </button>
          {/* Reset Zoom */}
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white active:scale-95 backdrop-blur-md text-blue-600 flex items-center justify-center shadow-md shadow-black/15 border border-slate-200/80 transition-all cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
        </div>

        {/* Bottom-Left Telemetry Pill */}
        <div className="absolute bottom-3.5 left-3.5 z-20 hidden sm:flex items-center gap-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[9px] text-slate-300 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Alt: 45m AGL · GSD: 0.8cm/px · DJI M300</span>
        </div>

        {/* Bottom Floating Pin Preview Card */}
        {selectedPinItem && (
          <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
            <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-slate-900">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                  style={{ backgroundColor: getPinColor(selectedPinItem.type) }}
                >
                  {getPinIcon(selectedPinItem.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">{selectedPinItem.id}</span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {selectedPinItem.status}
                    </span>
                  </div>
                  <h4 className="text-[12px] font-bold text-slate-900 truncate">{selectedPinItem.title}</h4>
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
          setFilterType("all");
          setFilterStatus("all");
          setFilterPriority("all");
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
      <BottomNav active={activeTab} onChange={onTabChange} onFabClick={onCreateClick} />
    </div>
  );
}
