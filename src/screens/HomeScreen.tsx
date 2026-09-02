import { useState, useRef } from "react";
import { AppHeader } from "../components/AppHeader";
import { BottomNav, type MainTab } from "../components/BottomNav";
import { FilterModal } from "../components/FilterModal";
import { SearchModal } from "../components/SearchModal";
import { HomeSkeleton, PullIndicator } from "../components/SkeletonLoader";
import type { Item, ItemType, Severity, Status } from "../data/mockData";
import { type Project, projectsList } from "../data/projectsData";

interface HomeScreenProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onCreateClick: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  markupFilter: string;
  onFilterChange: (filter: string) => void;
  onInviteClick?: () => void;
  onProfileClick?: () => void;
  userAvatar?: string;
  selectedProject?: Project;
  onSelectProject?: (p: Project) => void;
  onViewAll?: (params?: {
    type?: ItemType | "all";
    phase?: string;
    category?: string;
    status?: string;
    viewMode?: "list" | "kanban";
  }) => void;
}

function Chevron({ direction = "down" }: { direction?: "down" | "right" }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {direction === "down" ? (
        <path d="m4 6 4 4 4-4" stroke="#687998" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="m6 4 4 4-4 4" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function StatIcon({ id, color = "#ffffff" }: { id: string; color?: string }) {
  if (id === "today") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
        <line x1="2.5" y1="6.5" x2="13.5" y2="6.5" />
        <line x1="5.5" y1="2" x2="5.5" y2="4.5" />
        <line x1="10.5" y1="2" x2="10.5" y2="4.5" />
        <circle cx="5.5" cy="9.5" r="0.75" fill={color} stroke="none" />
        <circle cx="8" cy="9.5" r="0.75" fill={color} stroke="none" />
        <circle cx="10.5" cy="9.5" r="0.75" fill={color} stroke="none" />
      </svg>
    );
  }
  if (id === "not-started") {
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.6" />
        <path d="M6.8 5.8L10.5 8L6.8 10.2V5.8Z" fill={color} />
      </svg>
    );
  }
  if (id === "in-progress") {
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2.5A5.5 5.5 0 1 0 13.5 8" strokeDasharray="2 1.5" />
        <polyline points="8 4.8 8 8 10.2 9.5" />
      </svg>
    );
  }
  if (id === "in-review") {
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path d="M1.5 8S4 4.2 8 4.2s6.5 3.8 6.5 3.8-2.5 3.8-6.5 3.8S1.5 8 1.5 8Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="2" fill={color} />
      </svg>
    );
  }
  if (id === "blocked") {
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6">
        <circle cx="8" cy="8" r="6" />
        <line x1="3.8" y1="12.2" x2="12.2" y2="3.8" />
      </svg>
    );
  }
  if (id === "completed") {
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.6" />
        <polyline points="5.5 8 7.2 9.8 10.8 6.2" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}

function ChecklistIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 19 19" fill="none" aria-hidden="true">
      <path d="m1.7 5 1.3 1.3 2.1-2.1M1.7 10 3 11.3l2.1-2.1M1.7 15 3 16.3l2.1-2.1" stroke="#475569" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.2 5.3h9M7.2 10.3h9M7.2 15.3h9" stroke="#475569" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}

function PhaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m1.8 8.7 1.5 1.5 2.5-2.7" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.2 5.2h8M8.2 10h8M8.2 14.8h8" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FlagIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15s1-0.8 4-0.8 5 1.6 8 1.6 4-0.8 4-0.8V3s-1 0.8-4 0.8-5-1.6-8-1.6-4 0.8-4 0.8z" fill={color} />
      <line x1="4" y1="22" x2="4" y2="2" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function SectionHeader({
  title,
  count,
  isOpen = true,
  onToggle,
}: {
  title: string;
  count?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-[32px] w-full items-center justify-between cursor-pointer group text-left px-1"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-[15px] font-bold text-[#0F172A] tracking-tight group-hover:text-[#0055ff] transition-colors">
          {title}
        </h2>
        {count && (
          <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      <div
        className="flex h-6 w-6 items-center justify-center text-slate-400 group-hover:text-slate-700 transition-transform duration-200"
        style={{
          transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
        }}
      >
        <Chevron direction="down" />
      </div>
    </button>
  );
}

function getItemTypeIcon(type: ItemType) {
  switch (type) {
    case "task":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1.5" y="1.5" width="13" height="13" rx="3" />
          <path d="m4.8 8 2.2 2.2 4.2-4.5" />
        </svg>
      );
    case "issue":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 4.8v3.6" />
          <circle cx="8" cy="11.2" r=".9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "rfi":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
          <path d="M3.5 1.5h6l4 4v9h-10z" />
          <path d="M9.5 1.5v4h4" />
          <path d="M5.5 7.5h4M5.5 10.5h3.2" />
        </svg>
      );
    case "fieldnote":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
          <path d="M2.8 2.2h7.8a1.5 1.5 0 0 1 1.5 1.5v9H4.2a1.5 1.5 0 0 1-1.4-1.5z" />
          <path d="m6.2 9.5 1-2.2 3.2-3.2.8.8-3.2 3.2z" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

function getItemTypeColors(type: ItemType) {
  switch (type) {
    case "task":
      return "bg-blue-50 text-[#0055ff]";
    case "issue":
      return "bg-red-50 text-red-600";
    case "rfi":
      return "bg-amber-50 text-amber-600";
    case "fieldnote":
      return "bg-emerald-50 text-emerald-600";
  }
}

export function HomeScreen({
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
  onViewAll,
}: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [isPhasesOpen, setIsPhasesOpen] = useState(true);

  // Active data based on selected project and top header tab
  const currentConfig =
    selectedProject.tabData[markupFilter] ||
    selectedProject.tabData.all ||
    projectsList[0].tabData.all;

  const isFilterActive = statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all";

  const handleResetFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
    setSearchQuery("");
  };

  // Pull to Refresh & Skeleton Loader state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const mainRef = useRef<HTMLElement>(null);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1100);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mainRef.current && mainRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0 && mainRef.current && mainRef.current.scrollTop === 0) {
      setPullDistance(Math.min(diff * 0.4, 60));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 35 && !isRefreshing) {
      triggerRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDownRef.current = false;
  };

  // Filter items dynamically based on search and filters
  const filteredWorkItems = items.filter((item) => {
    if (markupFilter !== "all" && item.type !== markupFilter) return false;
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (priorityFilter !== "all" && item.severity !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesId = item.id.toLowerCase().includes(q);
      const matchesDesc = item.description?.toLowerCase().includes(q);
      return matchesTitle || matchesId || matchesDesc;
    }
    return true;
  });

  const isSearchingOrFiltering = searchQuery.trim().length > 0 || isFilterActive;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0055ff] text-[#18243D]">
      <AppHeader
        markupFilter={markupFilter}
        onFilterChange={onFilterChange}
        onSearchClick={() => setIsSearchOpen(true)}
        onSplitViewClick={() => onTabChange("splitview")}
        isSplitViewActive={activeTab === "splitview"}
        onInviteClick={onInviteClick}
        onProfileClick={onProfileClick}
        onFilterClick={() => setIsFilterModalOpen(true)}
        isFilterActive={isFilterActive}
        userAvatar={userAvatar}
        selectedProject={selectedProject}
        onSelectProject={(p) => {
          onSelectProject?.(p);
          triggerRefresh();
        }}
      />

      <main
        ref={mainRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="min-h-0 flex-1 overflow-y-auto bg-[#0055ff] flex flex-col no-scrollbar"
      >
        {/* Pull To Refresh Indicator */}
        <PullIndicator
          isPulling={isPulling}
          isRefreshing={isRefreshing}
          pullDistance={pullDistance}
        />

        {/* Shimmer Skeleton Loader on Refresh */}
        {isRefreshing ? (
          <div className="p-4 space-y-3 flex-1 bg-[#F5F6F8] rounded-t-[26px] min-h-full">
            <HomeSkeleton />
          </div>
        ) : isSearchingOrFiltering ? (
          <div className="p-4 space-y-3 flex-1 bg-[#F5F6F8] rounded-t-[26px] min-h-full">
            {/* Filter tags bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[13px] font-bold text-slate-700">
                  {filteredWorkItems.length} {filteredWorkItems.length === 1 ? "result" : "results"} found
                </span>
                {searchQuery && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#0055ff] text-[11px] font-bold">
                    "{searchQuery}"
                  </span>
                )}
                {typeFilter !== "all" && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-bold">
                    Type: {typeFilter}
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-bold">
                    Status: {statusFilter}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[12px] font-bold text-[#0055ff] hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </div>

            {/* Results List */}
            {filteredWorkItems.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {filteredWorkItems.map((item) => {
                  const flagColor =
                    item.severity === "HIGH"
                      ? "#FF001F"
                      : item.severity === "MEDIUM"
                      ? "#FF6D00"
                      : "#1558F5";
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => onItemClick(item)}
                      className="w-full p-3.5 flex items-start gap-3 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                          item.type === "issue"
                            ? "bg-red-50 text-red-500"
                            : item.type === "task"
                            ? "bg-blue-50 text-[#0055ff]"
                            : item.type === "rfi"
                            ? "bg-amber-50 text-amber-500"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {item.type === "issue" ? "!" : item.type === "task" ? "T" : item.type === "rfi" ? "?" : "FN"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-bold text-slate-400 font-mono">{item.id}</span>
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                              item.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.status === "IN PROGRESS"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <h4 className="text-[13.5px] font-bold text-slate-900 leading-snug">{item.title}</h4>
                        {item.description && (
                          <p className="text-[11.5px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <span className="shrink-0 mt-1"><FlagIcon color={flagColor} /></span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h4 className="text-[15px] font-bold text-slate-800">No matching items found</h4>
                <p className="text-[12px] text-slate-400 mt-1 max-w-[220px] mx-auto">
                  Try adjusting your search terms or clearing active filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#0055ff] text-white text-[12.5px] font-bold hover:bg-blue-600 cursor-pointer shadow-xs"
                >
                  Reset Search & Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Standard Home View - Dynamically Adapts to Selected Project & Top Tab */
          <div key={selectedProject.id + markupFilter} className="animate-fade-in flex flex-col flex-1 min-h-full bg-[#0055ff]">
            {/* Top Cards Section inside Expanded Blue Section */}
            <section className="bg-[#0055ff] pt-2 pb-7 shrink-0" aria-label="Task summary">
              <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="flex gap-2.5 overflow-x-auto px-4 select-none cursor-grab active:cursor-grabbing no-scrollbar"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                }}
              >
                {currentConfig.statCards.map((card) => (
                  <button
                    type="button"
                    key={card.id}
                    onClick={(e) => {
                      if (hasMovedRef.current) {
                        e.preventDefault();
                        return;
                      }
                      const statusMap: Record<string, string> = {
                        "today": "all",
                        "not-started": "TO DO",
                        "in-progress": "IN PROGRESS",
                        "in-review": "REVIEW",
                        "blocked": "BLOCKED",
                        "completed": "COMPLETED",
                      };
                      onViewAll?.({
                        type: markupFilter === "all" ? "all" : (markupFilter as ItemType),
                        status: statusMap[card.id] || "all",
                        viewMode: "list",
                      });
                    }}
                    className="flex flex-col justify-between rounded-[18px] p-3.5 text-left transition-all active:scale-[0.97] flex-shrink-0 cursor-pointer bg-white/[0.18] hover:bg-white/[0.26] backdrop-blur-md text-white"
                    style={{
                      width: "136px",
                      height: "96px",
                    }}
                  >
                    {/* Icon Badge in translucent light-blue / white box */}
                    <div className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-white/20 text-white">
                      <StatIcon id={card.id} color="#ffffff" />
                    </div>

                    {/* Text Content */}
                    <div className="mt-auto">
                      <div className="text-[13.5px] font-bold leading-tight tracking-[-0.2px] whitespace-nowrap text-white">
                        {card.title}
                      </div>
                      <div className="text-[11px] font-medium leading-tight mt-0.5 whitespace-nowrap text-blue-100/90">
                        {card.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
                <div className="w-1 flex-shrink-0" aria-hidden="true" />
              </div>
            </section>

            {/* Rounded Top White Bottom Container Sheet */}
            <div className="rounded-t-[30px] bg-white pt-5 pb-8 shadow-[0_-10px_35px_rgba(0,0,0,0.08)] flex-1 min-h-full flex flex-col -mt-3 z-10 relative">
              {/* Recents Section for Current Tab */}
              <section className="px-4" aria-labelledby="recents-heading">
                <div id="recents-heading" className="flex h-[32px] w-full items-center justify-between px-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-[#0F172A] tracking-tight">
                      Recents
                    </h2>
                    <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {String(currentConfig.recentRows.length).padStart(2, "0")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onViewAll?.({
                        type: markupFilter === "all" ? "all" : (markupFilter as ItemType),
                        viewMode: "list",
                      })
                    }
                    className="text-[11px] font-bold text-[#0055ff] hover:underline flex items-center gap-0.5 cursor-pointer px-1 py-0.5"
                  >
                    <span>View all</span>
                    <span className="text-[11.5px] font-semibold leading-none">›</span>
                  </button>
                </div>
                <div className="mt-2 space-y-1 animate-fade-in">
                    {currentConfig.recentRows.map((row) => {
                      const matchingItem = items.find((candidate) => candidate.id === row.id || candidate.title === row.title);
                      const itemToOpen = matchingItem || {
                        id: row.id,
                        type: row.type,
                        title: row.title,
                        description: `Inspection & coordination for ${row.title} at ${selectedProject.name}`,
                        status: row.status,
                        severity: row.severity,
                        assignees: [{ id: "you", name: "Anil Kumar", initials: "AK", color: "#1558F5" }],
                        dueDate: "2026-09-15",
                        location: { x: 200, y: 300, label: `${selectedProject.name}, ${selectedProject.location}` },
                        photos: [],
                        activity: [{ id: "init", text: "Logged in field", date: "01 Sep 2026" }],
                        tags: [row.type.toUpperCase(), selectedProject.code],
                      };

                      return (
                        <button
                          type="button"
                          key={row.id + row.title}
                          onClick={() => onItemClick(itemToOpen)}
                          className="flex min-h-[48px] w-full items-center gap-3 px-2 py-1.5 rounded-2xl text-left transition-all hover:bg-slate-50 active:bg-slate-100 cursor-pointer group"
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${getItemTypeColors(row.type)}`}>
                            {getItemTypeIcon(row.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[13.5px] font-bold text-[#0F172A] leading-snug group-hover:text-[#0055ff] transition-colors truncate">
                              {row.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-0.5">
                              <span className="font-bold text-slate-500">{row.id}</span>
                              <span>·</span>
                              <span className="capitalize">{row.status.toLowerCase()}</span>
                              <span>·</span>
                              <span className="capitalize">{row.severity.toLowerCase()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <FlagIcon color={row.flag} />
                            <span className="text-slate-300 group-hover:text-slate-500 transition-colors text-[13px] font-bold">›</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
              </section>

              {/* Divider */}
              <div className="mx-4 my-3.5 h-[1px] bg-slate-100" />

              {/* Phases Section for Current Tab */}
              <section className="px-4" aria-labelledby="phases-heading">
                <div id="phases-heading">
                  <SectionHeader
                    title="Phases"
                    count={String(currentConfig.phases.length).padStart(2, "0")}
                    isOpen={isPhasesOpen}
                    onToggle={() => setIsPhasesOpen((v) => !v)}
                  />
                </div>
                {isPhasesOpen && (
                  <div className="mt-2 space-y-1 animate-fade-in">
                    {currentConfig.phases.map((phase) => (
                      <button
                        type="button"
                        key={phase.name}
                        onClick={() =>
                          onViewAll?.({
                            phase: phase.name,
                            type: markupFilter === "all" ? "all" : (markupFilter as ItemType),
                            viewMode: "list",
                          })
                        }
                        className="flex min-h-[46px] w-full items-center gap-3 px-2 py-1.5 rounded-2xl text-left transition-all hover:bg-slate-50 active:bg-slate-100 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[13.5px] font-bold text-[#0F172A] leading-snug group-hover:text-[#0055ff] transition-colors truncate">
                            {phase.name}
                          </h4>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5">Active milestone phase</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-extrabold text-slate-600 px-2.5 py-0.5 bg-slate-100 rounded-full">
                            {phase.count}
                          </span>
                          <span className="text-slate-300 group-hover:text-slate-500 transition-colors text-[13px] font-bold">›</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Divider */}
              <div className="mx-4 my-3.5 h-[1px] bg-slate-100" />

              {/* Category & Items Section for Current Tab */}
              <section className="px-4 space-y-1" aria-label="Browse task groups">
                <button
                  type="button"
                  onClick={() =>
                    onViewAll?.({
                      type: markupFilter === "all" ? "all" : (markupFilter as ItemType),
                      category: "all",
                      viewMode: "list",
                    })
                  }
                  className="flex min-h-[46px] w-full items-center gap-3 px-2 py-1.5 rounded-2xl text-left transition-all hover:bg-slate-50 active:bg-slate-100 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2.5L20.5 7.4V16.6L12 21.5L3.5 16.6V7.4L12 2.5Z" />
                      <path d="M12 12V21.5" />
                      <path d="M12 12L20.5 7.4" />
                      <path d="M12 12L3.5 7.4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13.5px] font-bold text-[#0F172A] leading-snug group-hover:text-[#0055ff] transition-colors">
                      Category
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Spatial disciplines & packages</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-extrabold text-indigo-600 px-2.5 py-0.5 bg-indigo-50 rounded-full">
                      {currentConfig.categoryCount}
                    </span>
                    <span className="text-slate-300 group-hover:text-slate-500 transition-colors text-[13px] font-bold">›</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onViewAll?.({
                      type: markupFilter === "all" ? "all" : (markupFilter as ItemType),
                      viewMode: "list",
                    })
                  }
                  className="flex min-h-[46px] w-full items-center gap-3 px-2 py-1.5 rounded-2xl text-left transition-all hover:bg-slate-50 active:bg-slate-100 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0055ff] flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13.5px] font-bold text-[#0F172A] leading-snug group-hover:text-[#0055ff] transition-colors">
                      {currentConfig.itemLabel}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Active deliverables & punch lists</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-extrabold text-[#0055ff] px-2.5 py-0.5 bg-blue-50 rounded-full">
                      {currentConfig.itemCount}
                    </span>
                    <span className="text-slate-300 group-hover:text-slate-500 transition-colors text-[13px] font-bold">›</span>
                  </div>
                </button>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        onReset={handleResetFilters}
      />

      {/* Dedicated Search Overlay Screen */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={items}
        onItemClick={onItemClick}
      />

      <BottomNav active={activeTab} onChange={onTabChange} onFabClick={onCreateClick} />
    </div>
  );
}
