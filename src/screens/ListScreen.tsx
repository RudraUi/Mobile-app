import { useState, useMemo, useRef } from "react";
import type { MainTab } from "../components/BottomNav";
import type { Item, ItemType, Severity, Status } from "../data/mockData";
import {
  typeColors,
  availablePhases,
  availableCategories,
} from "../data/mockData";
import { type Project, projectsList } from "../data/projectsData";
import { SearchModal } from "../components/SearchModal";
import { ListSkeleton, PullIndicator } from "../components/SkeletonLoader";

export type ViewMode = "list" | "kanban";

export type SortOption =
  | "dueDate-asc"
  | "dueDate-desc"
  | "severity-desc"
  | "title-asc"
  | "id-asc"
  | "status";

export interface ListFilterInitialParams {
  type?: ItemType | "all";
  phase?: string;
  category?: string;
  status?: string;
  viewMode?: ViewMode;
}

interface ListScreenProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onCreateClick: () => void;
  onBack: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  selectedProject?: Project;
  onSelectProject?: (p: Project) => void;
  userAvatar?: string;
  onUpdateStatus?: (id: string, newStatus: Status) => void;
  initialParams?: ListFilterInitialParams;
}

const KANBAN_COLUMNS: {
  id: Status;
  title: string;
  color: string;
  columnBg: string;
  headerTextColor: string;
  countBg: string;
}[] = [
  {
    id: "TO DO",
    title: "To Do",
    color: "#2563EB",
    columnBg: "bg-[#DCEBFE]",
    headerTextColor: "text-[#1D4ED8]",
    countBg: "bg-white text-[#1D4ED8] font-bold shadow-2xs",
  },
  {
    id: "IN PROGRESS",
    title: "In Progress",
    color: "#8B5CF6",
    columnBg: "bg-[#EAE0FE]",
    headerTextColor: "text-[#6D28D9]",
    countBg: "bg-white text-[#6D28D9] font-bold shadow-2xs",
  },
  {
    id: "REVIEW",
    title: "In Review",
    color: "#D97706",
    columnBg: "bg-[#FEEDB8]",
    headerTextColor: "text-[#B45309]",
    countBg: "bg-white text-[#B45309] font-bold shadow-2xs",
  },
  {
    id: "BLOCKED",
    title: "Blocked",
    color: "#EF4444",
    columnBg: "bg-[#FFD6D9]",
    headerTextColor: "text-[#BE123C]",
    countBg: "bg-white text-[#BE123C] font-bold shadow-2xs",
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color: "#10B981",
    columnBg: "bg-[#CEF2DC]",
    headerTextColor: "text-[#047857]",
    countBg: "bg-white text-[#047857] font-bold shadow-2xs",
  },
];

const SEVERITY_WEIGHT: Record<Severity, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const CANONICAL_STATUSES: { id: Status | "all"; label: string; dot?: string }[] = [
  { id: "all", label: "All" },
  { id: "TO DO", label: "To Do", dot: "#2563EB" },
  { id: "IN PROGRESS", label: "In Progress", dot: "#8B5CF6" },
  { id: "REVIEW", label: "In Review", dot: "#D97706" },
  { id: "BLOCKED", label: "Blocked", dot: "#EF4444" },
  { id: "COMPLETED", label: "Completed", dot: "#10B981" },
];

const CANONICAL_PHASES = [
  { id: "all", label: "All" },
  { id: "Pre - construction Tasks", label: "Pre-Construction" },
  { id: "Construction Execution", label: "Construction" },
  { id: "Testing & Handover", label: "Testing & Handover" },
  { id: "Site Survey & Foundation", label: "Site Survey" },
];

const CANONICAL_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "Structural", label: "Structural" },
  { id: "MEP & HVAC", label: "MEP & HVAC" },
  { id: "Architectural", label: "Architectural" },
  { id: "Safety & Fire", label: "Safety & Fire" },
  { id: "Finishing", label: "Finishing" },
  { id: "Civil & Earthworks", label: "Civil" },
];

const CANONICAL_SORTS: { id: SortOption; label: string }[] = [
  { id: "dueDate-asc", label: "Due Date (Earliest)" },
  { id: "dueDate-desc", label: "Due Date (Latest)" },
  { id: "severity-desc", label: "Severity (High)" },
  { id: "title-asc", label: "Title (A-Z)" },
  { id: "id-asc", label: "Item ID" },
];

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

function FlagIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15s1-0.8 4-0.8 5 1.6 8 1.6 4-0.8 4-0.8V3s-1 0.8-4 0.8-5-1.6-8-1.6-4 0.8-4 0.8z" fill={color} />
      <line x1="4" y1="22" x2="4" y2="2" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const filters: { id: ItemType | "all"; label: string; icon: React.ReactNode }[] = [
  {
    id: "all",
    label: "All",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" style={{ width: "13px", height: "13px", minWidth: "13px", minHeight: "13px" }}>
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" />
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" />
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" />
        <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "task",
    label: "Task",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: "13px", height: "13px", minWidth: "13px", minHeight: "13px" }}>
        <rect x="1.5" y="1.5" width="13" height="13" rx="3" />
        <path d="m4.8 8 2.2 2.2 4.2-4.5" />
      </svg>
    ),
  },
  {
    id: "issue",
    label: "Issue",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" aria-hidden="true" style={{ width: "13px", height: "13px", minWidth: "13px", minHeight: "13px" }}>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.8v3.6" />
        <circle cx="8" cy="11.2" r=".9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "rfi",
    label: "RFI",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" style={{ width: "13px", height: "13px", minWidth: "13px", minHeight: "13px" }}>
        <path d="M3.5 1.5h6l4 4v9h-10z" />
        <path d="M9.5 1.5v4h4" />
        <path d="M5.5 7.5h4M5.5 10.5h3.2" />
      </svg>
    ),
  },
  {
    id: "fieldnote",
    label: "Field Note",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" style={{ width: "13px", height: "13px", minWidth: "13px", minHeight: "13px" }}>
        <path d="M2.8 2.2h7.8a1.5 1.5 0 0 1 1.5 1.5v9H4.2a1.5 1.5 0 0 1-1.4-1.5z" />
        <path d="m6.2 9.5 1-2.2 3.2-3.2.8.8-3.2 3.2z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function ListScreen({
  items,
  onItemClick,
  onCreateClick,
  onBack,
  activeTab,
  onTabChange,
  selectedProject = projectsList[0],
  onUpdateStatus,
  initialParams,
}: ListScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialParams?.viewMode || "list");
  const [typeFilter, setTypeFilter] = useState<ItemType | "all">(initialParams?.type || "all");
  const [phaseFilter, setPhaseFilter] = useState<string>(initialParams?.phase || "all");
  const [categoryFilter, setCategoryFilter] = useState<string>(initialParams?.category || "all");
  const [statusFilter, setStatusFilter] = useState<string>(initialParams?.status || "all");
  const [sortBy, setSortBy] = useState<SortOption>("dueDate-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modal state for single unified Filter & Sort
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Scroll detection state to smoothly flatten curve on scroll
  const [isScrolled, setIsScrolled] = useState(false);

  const handleMainScroll = (e: React.UIEvent<HTMLElement>) => {
    const top = e.currentTarget.scrollTop;
    if (top > 8 && !isScrolled) {
      setIsScrolled(true);
    } else if (top <= 8 && isScrolled) {
      setIsScrolled(false);
    }
  };

  // Drag and drop state for Kanban
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

  // Status moving popover state
  const [statusMenuTargetId, setStatusMenuTargetId] = useState<string | null>(null);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (phaseFilter !== "all" && item.phase !== phaseFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesPhase = item.phase?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        return matchesTitle || matchesId || matchesDesc || matchesPhase || matchesCategory;
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "dueDate-asc":
          return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
        case "dueDate-desc":
          return (b.dueDate || "0000").localeCompare(a.dueDate || "0000");
        case "severity-desc":
          return SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "id-asc":
          return a.id.localeCompare(b.id);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [items, typeFilter, phaseFilter, categoryFilter, statusFilter, searchQuery, sortBy]);

  const activeFiltersCount =
    (typeFilter !== "all" ? 1 : 0) +
    (phaseFilter !== "all" ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleResetFilters = () => {
    setTypeFilter("all");
    setPhaseFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
    setSortBy("dueDate-asc");
    setOpenDropdown(null);
  };

  // Kanban status move handler
  const handleMoveStatus = (itemId: string, newStatus: Status) => {
    onUpdateStatus?.(itemId, newStatus);
    setStatusMenuTargetId(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: Status) => {
    e.preventDefault();
    setDragOverColumn(colId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, colId: Status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedItemId;
    if (id && onUpdateStatus) {
      onUpdateStatus(id, colId);
    }
    setDraggedItemId(null);
    setDragOverColumn(null);
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

  return (
    <div
      onClick={() => {
        if (statusMenuTargetId) setStatusMenuTargetId(null);
      }}
      className="flex h-full min-h-0 flex-col bg-[#0055FF] text-[#18243D] select-none"
    >
      {/* Dynamic Top Header with Project Badge, Title & View Switcher */}
      <header className="bg-[#0055FF] text-white pt-2.5 pb-2 px-0 shrink-0 relative z-30">
        {/* Top Status Bar Spacer */}
        <div className="h-2" />

        <div className="flex items-center justify-between gap-2 px-3.5 h-[38px]">
          {/* Simple Back Arrow */}
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Simple Title + Count */}
          <div className="min-w-0 flex-1 pl-1 text-left">
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight truncate">
              All Work Items
            </h1>
            <p className="text-[10.5px] font-medium text-blue-100 leading-tight truncate">
              {filteredAndSortedItems.length} of {items.length} items
            </p>
          </div>

          {/* Top Right Action Icons: Search, Filter, View Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Search items"
              aria-label="Search items"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Filter & Sort Icon */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`relative w-8 h-8 rounded-full active:scale-95 flex items-center justify-center transition-all cursor-pointer ${
                activeFiltersCount > 0
                  ? "bg-white text-[#0055ff] shadow-xs"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
              title="Filter and Sort"
              aria-label="Open filter and sort"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center leading-none">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Single Small Icon to Switch View */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "list" ? "kanban" : "list")}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
              title={viewMode === "list" ? "Switch to Kanban Board" : "Switch to List View"}
              aria-label="Switch view"
            >
              {viewMode === "list" ? (
                /* Shows Kanban board icon when in list view */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="5" height="18" rx="1.5" />
                  <rect x="10.5" y="3" width="5" height="12" rx="1.5" />
                  <rect x="18" y="3" width="5" height="15" rx="1.5" />
                </svg>
              ) : (
                /* Shows List icon when in kanban view */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Modern Capsule Navigation Tabs with Balanced 12px Font and 13px Icon Size */}
        <nav className="mt-3 flex items-center gap-[6px] overflow-x-auto px-[16px] pb-[16px] no-scrollbar" aria-label="Work item filters">
          {filters.map((filter) => {
            const isActive = typeFilter === filter.id;
            return (
              <button
                type="button"
                key={filter.id}
                onClick={() => setTypeFilter(filter.id)}
                className={`flex shrink-0 items-center gap-[5px] rounded-full px-[12px] py-[6px] font-bold leading-none transition-all duration-150 cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-white text-[#0055ff] shadow-xs"
                    : "bg-white/[0.14] hover:bg-white/25 text-white"
                }`}
                style={{ fontSize: "12px" }}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={`shrink-0 flex items-center justify-center ${isActive ? "text-[#0055ff]" : "text-white"}`} style={{ width: "13px", height: "13px" }}>
                  {filter.icon}
                </span>
                <span style={{ fontSize: "12px", lineHeight: "1", fontWeight: 700 }}>{filter.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Modern, Compact Filter & Sort Modal */}
      {isFilterModalOpen && (
        <div
          onClick={() => setIsFilterModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[305px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.22)] overflow-hidden flex flex-col border border-slate-100 animate-slide-up"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-slate-900 tracking-tight">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0055ff] text-[10px] font-bold">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer text-[12px]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Filter Sections with modern rounded-full pills */}
            <div className="p-3.5 space-y-3 overflow-y-auto max-h-[44vh] no-scrollbar">
              {/* Status */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CANONICAL_STATUSES.map((s) => {
                    const isSelected = statusFilter === s.id;
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setStatusFilter(s.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#0055ff] text-white font-bold shadow-xs"
                            : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80"
                        }`}
                      >
                        {s.dot && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-white" : ""}`}
                            style={isSelected ? undefined : { backgroundColor: s.dot }}
                          />
                        )}
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phase */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Phase
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CANONICAL_PHASES.map((p) => {
                    const isSelected = phaseFilter === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPhaseFilter(p.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-[#0055ff] text-white font-bold shadow-xs"
                            : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Category
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CANONICAL_CATEGORIES.map((c) => {
                    const isSelected = categoryFilter === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCategoryFilter(c.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-[#0055ff] text-white font-bold shadow-xs"
                            : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Sort By
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CANONICAL_SORTS.map((s) => {
                    const isSelected = sortBy === s.id;
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setSortBy(s.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-[#0055ff] text-white font-bold shadow-xs"
                            : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={activeFiltersCount === 0}
                className="text-[11.5px] font-bold text-slate-400 hover:text-slate-700 disabled:opacity-35 disabled:hover:text-slate-400 cursor-pointer transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="h-8 px-5 rounded-full bg-[#0055ff] text-white text-[11.5px] font-bold hover:bg-blue-600 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: View 1 (List View) or View 2 (Kanban Board) */}
      <main
        ref={mainRef}
        onScroll={handleMainScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`min-h-0 flex-1 overflow-y-auto no-scrollbar flex flex-col bg-white relative z-10 transition-[border-radius,box-shadow] duration-300 ease-out ${
          isScrolled
            ? "rounded-t-none shadow-md"
            : "rounded-t-[28px] shadow-[0_-8px_25px_rgba(0,0,0,0.06)]"
        }`}
      >
        <PullIndicator
          isPulling={isPulling}
          isRefreshing={isRefreshing}
          pullDistance={pullDistance}
        />

        {isRefreshing ? (
          <div className="flex-1 p-4 bg-white">
            <ListSkeleton />
          </div>
        ) : viewMode === "list" ? (
          /* ========================================================= */
          /* VIEW 1: LIST VIEW (Matching the Home Page Item UI Style)  */
          /* ========================================================= */
          <div className="flex-1 pt-4 pb-12 bg-white divide-y divide-slate-100">
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map((item) => {
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
                    className="flex min-h-[58px] w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/80 active:bg-slate-100/60 cursor-pointer group"
                  >
                    {/* Item Type Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${getItemTypeColors(
                        item.type
                      )}`}
                    >
                      {getItemTypeIcon(item.type)}
                    </div>

                    {/* Simple 2-Lined Details */}
                    <div className="min-w-0 flex-1">
                      {/* Line 1: Title */}
                      <h4 className="text-[13.5px] font-bold text-[#0F172A] leading-snug group-hover:text-[#0055ff] transition-colors truncate">
                        {item.title}
                      </h4>

                      {/* Line 2: ID · Status · Category · Due Date */}
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-1 truncate">
                        <span className="font-bold text-slate-500 font-mono">{item.id}</span>
                        <span>·</span>
                        <span
                          className={`capitalize font-semibold ${
                            item.status === "COMPLETED"
                              ? "text-emerald-600"
                              : item.status === "IN PROGRESS"
                              ? "text-purple-600"
                              : item.status === "REVIEW"
                              ? "text-amber-600"
                              : item.status === "BLOCKED"
                              ? "text-rose-600"
                              : "text-blue-600"
                          }`}
                        >
                          {item.status.toLowerCase()}
                        </span>
                        {item.category && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[120px]">{item.category}</span>
                          </>
                        )}
                        {item.dueDate && (
                          <>
                            <span>·</span>
                            <span className="shrink-0">{item.dueDate}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right-side severity flag & chevron */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <FlagIcon color={flagColor} />
                      <span className="text-slate-300 group-hover:text-slate-500 transition-colors text-[14px] font-bold">
                        ›
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white mt-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0055FF] flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h4 className="text-[14.5px] font-bold text-slate-800">No matching items found</h4>
                <p className="text-[11.5px] text-slate-400 mt-1 max-w-[240px] mx-auto">
                  Try adjusting your phase, category, or type filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-1.5 rounded-xl bg-[#0055FF] text-white text-[11.5px] font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: KANBAN BOARD VIEW (Horizontal Scrolling Columns)   */
          /* ========================================================= */
          <div className="flex-1 overflow-x-auto p-3.5 pt-4 flex gap-3 no-scrollbar select-none bg-slate-50/60 rounded-t-[28px]" style={{ minHeight: "100%" }}>
            {KANBAN_COLUMNS.map((column) => {
              const columnItems = filteredAndSortedItems.filter((i) => i.status === column.id);
              const isDragOver = dragOverColumn === column.id;

              return (
                <div
                  key={column.id}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`flex flex-col w-[265px] shrink-0 rounded-2xl ${column.columnBg} transition-all duration-200 overflow-hidden ${
                    isDragOver ? "ring-2 ring-[#0055FF]/40" : ""
                  }`}
                  style={{ maxHeight: "calc(100vh - 145px)" }}
                >
                  {/* Column Header (Simple, soothing, seamless background) */}
                  <div className="px-3.5 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                      <h3 className={`text-[13.5px] font-bold ${column.headerTextColor} tracking-tight`}>
                        {column.title}
                      </h3>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${column.countBg}`}>
                        {columnItems.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={onCreateClick}
                      className="w-5 h-5 rounded-md hover:bg-black/5 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                      title={`Add new ${column.title} item`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>

                  {/* Column Cards Container: Compact spacing, no elevation, no border */}
                  <div className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-2 no-scrollbar">
                    {columnItems.length > 0 ? (
                      columnItems.map((item) => {
                        const flagColor =
                          item.severity === "HIGH"
                            ? "#FF001F"
                            : item.severity === "MEDIUM"
                            ? "#FF6D00"
                            : "#1558F5";

                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onClick={() => onItemClick(item)}
                            className="bg-white rounded-xl p-2.5 active:scale-[0.98] transition-all cursor-pointer group relative"
                          >
                            {/* Row 1: Type Icon + ID + Severity Flag + 3-dot Menu */}
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`flex h-4.5 w-4.5 items-center justify-center rounded font-bold text-[8.5px] ${getItemTypeColors(
                                    item.type
                                  )}`}
                                >
                                  {getItemTypeIcon(item.type)}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 font-mono truncate">
                                  {item.id}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <FlagIcon color={flagColor} />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStatusMenuTargetId(statusMenuTargetId === item.id ? null : item.id);
                                  }}
                                  className="w-4.5 h-4.5 rounded text-slate-300 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Move status"
                                >
                                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                                    <circle cx="8" cy="3" r="1.5" />
                                    <circle cx="8" cy="8" r="1.5" />
                                    <circle cx="8" cy="13" r="1.5" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Status Quick Move Menu Popover */}
                            {statusMenuTargetId === item.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-2 top-7 w-40 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] p-1 z-50 animate-slide-up"
                              >
                                <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  Move to:
                                </div>
                                {KANBAN_COLUMNS.map((c) => (
                                  <button
                                    type="button"
                                    key={c.id}
                                    onClick={() => handleMoveStatus(item.id, c.id)}
                                    className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                      item.status === c.id ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                                    <span>{c.title}</span>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Row 2: Title (Compact, low height) */}
                            <h4 className="text-[12.5px] font-semibold text-slate-800 leading-snug group-hover:text-[#0055FF] transition-colors line-clamp-2 mt-1">
                              {item.title}
                            </h4>

                            {/* Row 3: Meta (Category / Due date / Assignees - compact single row) */}
                            <div className="flex items-center justify-between gap-1.5 mt-2 pt-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {item.dueDate && (
                                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-slate-400 shrink-0">
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect x="3" y="4" width="18" height="18" rx="2" />
                                      <line x1="16" y1="2" x2="16" y2="6" />
                                      <line x1="8" y1="2" x2="8" y2="6" />
                                      <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {item.dueDate.slice(5)}
                                  </span>
                                )}

                                {item.category && (
                                  <span className="text-[9px] font-medium text-slate-500 bg-slate-100/90 px-1.5 py-0.2 rounded truncate max-w-[85px]">
                                    {item.category}
                                  </span>
                                )}
                              </div>

                              {item.assignees && item.assignees.length > 0 && (
                                <div className="flex items-center -space-x-1 shrink-0">
                                  {item.assignees.slice(0, 2).map((a) => (
                                    <span
                                      key={a.id}
                                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[7.5px] font-bold border border-white"
                                      style={{ backgroundColor: a.color }}
                                      title={a.name}
                                    >
                                      {a.initials}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Empty Column Placeholder */
                      <div className="py-4 px-3 rounded-xl text-center bg-white/40">
                        <p className="text-[11px] font-semibold text-slate-400">No items in {column.title}</p>
                        <button
                          type="button"
                          onClick={onCreateClick}
                          className="mt-1.5 text-[10.5px] font-bold text-[#0055FF] hover:underline cursor-pointer"
                        >
                          + Add item
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Full Page Search Overlay */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={items}
        onItemClick={(item) => {
          setIsSearchOpen(false);
          onItemClick(item);
        }}
      />
    </div>
  );
}

