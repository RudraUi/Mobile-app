import { useState } from "react";
import { type Project, projectsList } from "../data/projectsData";

export interface AppHeaderProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSearchClick?: () => void;
  onSplitViewClick?: () => void;
  isSplitViewActive?: boolean;
  markupFilter: string;
  onFilterChange: (f: string) => void;
  onInviteClick?: () => void;
  onProfileClick?: () => void;
  onFilterClick?: () => void;
  isFilterActive?: boolean;
  userAvatar?: string;
  selectedProject?: Project;
  onSelectProject?: (p: Project) => void;
  projectName?: string;
  projectBadge?: string;
  projectBadgeBg?: string;
  onProjectClick?: () => void;
  isProjectOpen?: boolean;
}

const filters = [
  {
    id: "all",
    label: "All",
    icon: (
      <svg width="9" height="9" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
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
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1.5" y="1.5" width="13" height="13" rx="3" />
        <path d="m4.8 8 2.2 2.2 4.2-4.5" />
      </svg>
    ),
  },
  {
    id: "issue",
    label: "Issue",
    icon: (
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
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
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
        <path d="M2.8 2.2h7.8a1.5 1.5 0 0 1 1.5 1.5v9H4.2a1.5 1.5 0 0 1-1.4-1.5z" />
        <path d="m6.2 9.5 1-2.2 3.2-3.2.8.8-3.2 3.2z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

function StatusBar() {
  return (
    <div className="relative h-[50px] shrink-0 text-white" aria-hidden="true">
      <span className="absolute left-[48px] top-[14px] text-[16.5px] font-semibold tracking-[-0.35px]">9:41</span>

      <div className="absolute left-1/2 top-[10px] h-[30px] w-[116px] -translate-x-1/2 rounded-full bg-black">
        <span className="absolute right-[15px] top-[10px] h-[10px] w-[10px] rounded-full bg-[#071426] shadow-[inset_0_0_0_2.5px_#101a2b]" />
        <span className="absolute right-[18px] top-[13px] h-[4px] w-[4px] rounded-full bg-[#174f4a]" />
      </div>

      <div className="absolute right-[32px] top-[18px] flex items-center gap-[6px]">
        <svg width="18" height="12" viewBox="0 0 20 14" fill="none">
          <rect x="1" y="9" width="3" height="4" rx="1" fill="white" />
          <rect x="6" y="6.5" width="3" height="6.5" rx="1" fill="white" />
          <rect x="11" y="3.5" width="3" height="9.5" rx="1" fill="white" />
          <rect x="16" y="1" width="3" height="12" rx="1" fill="white" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 18 14" fill="none">
          <path d="M1.2 4.7a11.9 11.9 0 0 1 15.6 0M4 7.7a7.7 7.7 0 0 1 10 0M6.9 10.5a3.3 3.3 0 0 1 4.2 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9" cy="12.5" r="1.1" fill="white" />
        </svg>
        <svg width="24" height="12" viewBox="0 0 26 13" fill="none">
          <rect x=".75" y=".75" width="21.5" height="11.5" rx="3.2" stroke="white" strokeOpacity=".75" strokeWidth="1.5" />
          <rect x="2.8" y="2.8" width="16.7" height="7.4" rx="1.6" fill="white" />
          <path d="M24 4.3v4.4" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export function AppHeader({
  showSearch = true,
  searchQuery = "",
  onSearchChange,
  onSearchClick,
  onSplitViewClick,
  isSplitViewActive = false,
  markupFilter,
  onFilterChange,
  onInviteClick,
  onProfileClick,
  onFilterClick,
  isFilterActive = false,
  userAvatar,
  selectedProject,
  onSelectProject,
  projectName,
  projectBadge,
  projectBadgeBg,
  onProjectClick,
  isProjectOpen,
}: AppHeaderProps) {
  const [internalProjectOpen, setInternalProjectOpen] = useState(false);

  const currentProject =
    selectedProject ||
    projectsList.find((p) => p.name === projectName) ||
    projectsList[0];

  const effectiveBadge = projectBadge || currentProject.badge;
  const effectiveBadgeBg = projectBadgeBg || currentProject.badgeBg;
  const effectiveName = projectName || currentProject.name;

  const isDropdownVisible =
    typeof isProjectOpen === "boolean" ? isProjectOpen : internalProjectOpen;

  const handleToggleProject = () => {
    if (onProjectClick) {
      onProjectClick();
    } else {
      setInternalProjectOpen((v) => !v);
    }
  };

  const handleCloseProject = () => {
    setInternalProjectOpen(false);
    if (onProjectClick && isProjectOpen) {
      onProjectClick();
    }
  };

  return (
    <header className="home-header shrink-0 text-white shadow-md relative z-40">
      <StatusBar />

      <div className="flex h-[44px] items-center justify-between px-[16px] pt-1 pb-1 mb-2">
        {/* Project Selector Button with Anchored Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={handleToggleProject}
            className="flex min-w-0 items-center gap-[8px] cursor-pointer hover:opacity-90 active:scale-98 transition-all group"
            aria-label="Select workspace project"
          >
            <span
              className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] border border-white/25 text-[14px] font-bold text-white shadow-xs"
              style={{ backgroundColor: effectiveBadgeBg }}
            >
              {effectiveBadge}
            </span>
            <span className="text-[16px] font-semibold tracking-[-0.2px]">{effectiveName}</span>
            <div
              className="transition-transform duration-200"
              style={{ transform: isDropdownVisible ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <svg width="11" height="7" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                <path d="m2 2 4 4 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {/* Anchored Tooltip Popover directly under the project button */}
          {isDropdownVisible && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/10 backdrop-blur-2xs cursor-default"
                onClick={handleCloseProject}
              />
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-0 mt-2 w-60 bg-white/98 backdrop-blur-md rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.22)] border border-slate-100 p-1.5 z-50 animate-slide-up origin-top-left text-slate-800"
              >
                {/* Tooltip Triangle Pointer */}
                <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white rotate-45 border-t border-l border-slate-100 rounded-xs" />

                {/* Header */}
                <div className="flex items-center justify-between px-2.5 pt-1.5 pb-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Project
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">
                    {projectsList.length} workspaces
                  </span>
                </div>

                {/* Projects List */}
                <div className="space-y-0.5 max-h-[240px] overflow-y-auto">
                  {projectsList.map((project) => {
                    const isSelected = currentProject.id === project.id;
                    return (
                      <button
                        type="button"
                        key={project.id}
                        onClick={() => {
                          onSelectProject?.(project);
                          handleCloseProject();
                        }}
                        className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/90 text-[#0055ff] shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-white text-[12px] shadow-2xs shrink-0"
                            style={{ backgroundColor: project.badgeBg }}
                          >
                            {project.badge}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[12px] truncate ${isSelected ? "font-bold text-[#0055ff]" : "font-semibold text-slate-800"}`}>
                                {project.name}
                              </span>
                              <span className="text-[8.5px] font-bold px-1 py-0.2 rounded bg-black/5 text-slate-500 font-mono shrink-0">
                                {project.code}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium truncate leading-tight mt-0.5">
                              {project.location}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#0055ff] text-white flex items-center justify-center shrink-0 ml-1.5">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right side: Search, Filter, Invite, Profile */}
        <div className="flex items-center gap-[8px]">
          {/* Search Icon Button */}
          <button
            type="button"
            onClick={onSearchClick}
            className="w-[30px] h-[30px] rounded-full bg-white/[0.14] hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shadow-2xs"
            aria-label="Search items"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Filter Icon Button */}
          <button
            type="button"
            onClick={onFilterClick}
            className={`relative w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isFilterActive
                ? "bg-white text-[#0055ff] shadow-md scale-105"
                : "bg-white/[0.14] hover:bg-white/25 text-white shadow-2xs"
            }`}
            aria-label="Filter items"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M2.5 6.5h4.5M11.5 6.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="9" cy="6.5" r="2.2" fill={isFilterActive ? "#0055ff" : "white"} stroke="currentColor" strokeWidth="1.6" />
              <path d="M2.5 13.5h7.5M14.5 13.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12.5" cy="13.5" r="2.2" fill={isFilterActive ? "#0055ff" : "white"} stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {isFilterActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF2D55] rounded-full border-2 border-white" />
            )}
          </button>

          {/* Invite Member Icon Button */}
          <button
            type="button"
            onClick={onInviteClick}
            className="relative w-[30px] h-[30px] rounded-full bg-white/[0.14] hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shadow-2xs"
            aria-label="Add team member"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </button>

          {/* Profile Avatar */}
          <button
            type="button"
            onClick={onProfileClick}
            className="h-[30px] w-[30px] overflow-hidden rounded-full bg-[#7fb5dc] border border-white/40 shadow-xs cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            aria-label="Open profile"
          >
            <img
              src={userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"}
              alt="User profile"
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      </div>

      {/* Modern Capsule Navigation Tabs with 1:1 Equal Font and Icon Size */}
      <nav className="flex items-center gap-[5px] overflow-x-auto px-[16px] pb-[8px] no-scrollbar" aria-label="Work item filters">
        {filters.map((filter) => {
          const isActive = markupFilter === filter.id;
          return (
            <button
              type="button"
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`flex shrink-0 items-center gap-[3.5px] rounded-full px-2.5 py-[4.5px] text-[8.5px] font-extrabold leading-none transition-all duration-150 cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-white text-[#0055ff] shadow-xs"
                  : "bg-white/[0.14] hover:bg-white/25 text-white"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={`h-[9px] w-[9px] flex items-center justify-center shrink-0 ${isActive ? "text-[#0055ff]" : "text-white"}`}>
                {filter.icon}
              </span>
              <span className="translate-y-[0.2px]">{filter.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
