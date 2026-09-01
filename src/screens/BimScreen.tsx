import { useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { BottomNav, type MainTab } from "../components/BottomNav";
import { FilterModal } from "../components/FilterModal";
import { SearchModal } from "../components/SearchModal";
import type { Item, ItemType, Severity, Status } from "../data/mockData";
import { type Project, projectsList } from "../data/projectsData";

interface BimScreenProps {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<ItemType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Severity | "all">("all");

  const [navMode, setNavMode] = useState<"orbit" | "pan" | "walk">("orbit");
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

  return (
    <div className="flex flex-col h-full bg-[#111827] select-none overflow-hidden text-white">
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

      {/* Main 3D BIM Viewport */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
        {/* 3D BIM Model Canvas with Grid & 3D Lighting */}
        <div
          className="w-full h-full relative transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
        >
          {/* 3D Background Architecture Render */}
          <div
            className="w-full h-full relative"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1000&h=1200&fit=crop)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.85) contrast(1.1)",
            }}
          >
            {/* 3D Wireframe / Depth Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19]/90 via-transparent to-[#0b0f19]/60 pointer-events-none" />

            {/* Subtle 3D Coordinate Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
              <defs>
                <pattern id="bimGrid3D" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60A5FA" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#bimGrid3D)" />
            </svg>
          </div>

          {/* 3D Spatial Pins Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {filteredItems.slice(0, 5).map((item, idx) => {
              const defaultPositions = [
                { x: 35, y: 38, elev: "+14.2m" },
                { x: 68, y: 46, elev: "+8.5m" },
                { x: 42, y: 62, elev: "+3.0m" },
                { x: 74, y: 30, elev: "+18.0m" },
                { x: 25, y: 72, elev: "+0.0m" },
              ];
              const pos = defaultPositions[idx] || { x: 50, y: 50, elev: "+0.0m" };
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
                    {/* 3D Elevation Tag */}
                    <span className="mb-1 px-1.5 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-[8.5px] font-bold text-blue-300 shadow-md">
                      {pos.elev}
                    </span>

                    {/* Spatial Pin Icon */}
                    <div
                      className="w-7 h-7 rounded-[14px_14px_14px_0] -rotate-45 flex items-center justify-center shadow-lg shadow-black/40 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      <span className="rotate-45 text-white font-black text-[11px] leading-none">
                        {label}
                      </span>
                    </div>

                    {/* 3D Ground Shadow Ring */}
                    <div className="w-4 h-1.5 bg-black/40 rounded-full blur-[1px] mt-0.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top-Right 3D Controls (Split Screen, 3D View Cube & Zoom) */}
        <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-1.5">
          {/* Split Screen Button */}
          <button
            type="button"
            onClick={() => onTabChange("splitview")}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 backdrop-blur-md text-blue-400 flex items-center justify-center shadow-lg shadow-black/30 border border-slate-700/80 transition-all cursor-pointer"
            aria-label="Split Screen View"
            title="Split Screen View"
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="3" width="6.5" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <rect x="11" y="3" width="6.5" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          {/* 3D View Cube */}
          <div className="w-8 h-8 rounded-xl bg-slate-900/90 backdrop-blur-md text-blue-400 flex items-center justify-center shadow-lg shadow-black/30 border border-slate-700/80">
            <span className="text-[9px] font-extrabold tracking-tight">ISO</span>
          </div>
          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 backdrop-blur-md text-white flex items-center justify-center shadow-lg shadow-black/30 border border-slate-700/80 transition-all cursor-pointer text-[15px] font-bold"
          >
            +
          </button>
          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 backdrop-blur-md text-white flex items-center justify-center shadow-lg shadow-black/30 border border-slate-700/80 transition-all cursor-pointer text-[15px] font-bold"
          >
            -
          </button>
          {/* Mode Switcher (Orbit / Walk) */}
          <button
            type="button"
            onClick={() => setNavMode((m) => (m === "orbit" ? "walk" : "orbit"))}
            className={`w-8 h-8 rounded-xl backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/30 border border-slate-700/80 transition-all cursor-pointer ${
              navMode === "orbit" ? "bg-[#0055ff] text-white" : "bg-slate-900/90 text-slate-300"
            }`}
            title={`Mode: ${navMode}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>

        {/* Bottom-Left Model Stats Pill */}
        <div className="absolute bottom-3.5 left-3.5 z-20 hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[9.5px] text-slate-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>IFC 4.3 · LOD 350 · 60 FPS</span>
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
                    <span className="text-[10px] font-bold text-slate-400">{selectedPinItem.id}</span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {selectedPinItem.status}
                    </span>
                  </div>
                  <h4 className="text-[12px] font-bold text-white truncate">{selectedPinItem.title}</h4>
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
