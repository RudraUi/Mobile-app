import { useEffect, useState } from "react"
import useOverlayPresence from "../hooks/useOverlayPresence"
import { FloatingMenu, MenuCaption, MenuItem } from "./FloatingMenu"
import type { UserProfileData } from "../screens/ProfileScreen"
import type { Project } from "../data/projectsData"
import { mockCaptureFiles } from "../data/captureFiles"
import {
  categoryFileCount,
  dataCategories,
  type DataCategoryId,
} from "../data/dataLibrary"

export interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfileData
  onOpenProfile: () => void
  projects: Project[]
  selectedProject: Project
  onSelectProject: (project: Project) => void
  onOpenDataCategory?: (id: DataCategoryId) => void
  /** Highlights whichever data bucket the user is currently viewing. */
  activeDataCategory?: DataCategoryId | null
  onSignOut?: () => void
}

export function SideDrawer({
  isOpen,
  onClose,
  profile,
  onOpenProfile,
  projects,
  selectedProject,
  onSelectProject,
  onOpenDataCategory,
  activeDataCategory,
  onSignOut,
}: SideDrawerProps) {
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false)
  const [isDataExpanded, setIsDataExpanded] = useState(false)

  /* Reopening the drawer while a data bucket is on screen shows the list
     already expanded, with that bucket highlighted. */
  useEffect(() => {
    if (isOpen && activeDataCategory) setIsDataExpanded(true)
  }, [isOpen, activeDataCategory])

  const isPresent = useOverlayPresence(isOpen)
  if (!isPresent) return null

  return (
    <div
      data-overlay-state={isOpen ? "open" : "closing"}
      inert={!isOpen}
      className="absolute inset-0 z-50 overflow-hidden flex select-none"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 cursor-pointer animate-fade-in"
        onClick={onClose}
        aria-label="Close drawer"
      />

      {/* Drawer Panel */}
      <aside
        className="relative z-10 w-[84%] max-w-[325px] h-full bg-white shadow-2xl flex flex-col animate-drawer-slide-in text-slate-800"
        aria-label="Main navigation menu"
      >
        {/* Drawer Header: Profile Section + Close (X) Icon at Top Right */}
        <div className="relative px-4 pt-4 pb-3 shrink-0">
          {/* Close Cross Button - pinned to top right */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full hover:bg-slate-100 active:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close drawer"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Left: User Avatar + Name & Email (Borderless, Clickable to open profile) */}
          <div
            onClick={() => {
              onClose()
              onOpenProfile()
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClose()
                onOpenProfile()
              }
            }}
            aria-label={`Open profile for ${profile.name}`}
            className="flex items-center gap-3 pr-8 cursor-pointer group select-none transition-opacity hover:opacity-90 active:opacity-80"
            title="View full profile"
          >
            {/* User Avatar (DP) */}
            <div className="relative shrink-0">
              <div className="w-[48px] h-[48px] rounded-full overflow-hidden ring-2 ring-[#0055ff]/20 shadow-xs bg-slate-100 group-hover:ring-[#0055ff]/40 transition-all">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {/* User Details */}
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-slate-900 truncate leading-tight group-hover:text-[#0055ff] transition-colors">
                {profile.name}
              </h3>
              <p className="text-[12px] text-slate-500 truncate font-medium mt-0.5 group-hover:text-slate-700 transition-colors">
                {profile.email}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3.5 pt-2 pb-3 space-y-4 no-scrollbar">
          {/* SECTION 2: Projects Dropdown */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Projects
              </span>
              <span className="text-[9.5px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">
                {projects.length} workspaces
              </span>
            </div>

            {/* Dropdown Container */}
            <div className="relative">
              {/* Dropdown Trigger: Currently Selected Project (Thin & Compact) */}
              <button
                type="button"
                onClick={() => setIsProjectsDropdownOpen((prev) => !prev)}
                className={`w-full py-1.5 px-2.5 rounded-xl border transition-all cursor-pointer group flex items-center justify-between text-left active:scale-98 ${
                  isProjectsDropdownOpen
                    ? "bg-blue-50/90 border-blue-300 ring-2 ring-blue-100 shadow-xs"
                    : "bg-blue-50/60 hover:bg-blue-50/80 border-blue-200/80 shadow-2xs"
                }`}
                aria-expanded={isProjectsDropdownOpen}
                aria-haspopup="listbox"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-5.5 h-5.5 rounded-md flex items-center justify-center font-extrabold text-white text-[11px] shadow-2xs shrink-0"
                    style={{ backgroundColor: selectedProject.badgeBg }}
                  >
                    {selectedProject.badge}
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[12.5px] font-bold text-[#0055ff] truncate">
                      {selectedProject.name}
                    </span>
                    <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-[#0055ff]/10 text-[#0055ff] font-mono shrink-0">
                      {selectedProject.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#0055ff] text-white text-[9px] font-bold tracking-tight shadow-2xs">
                    Active
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-slate-400 transition-transform duration-200 ${
                      isProjectsDropdownOpen
                        ? "rotate-180 text-[#0055ff]"
                        : "rotate-0"
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </button>

              {/* Floating options list — compact, floats over the content below */}
              {isProjectsDropdownOpen && (
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsProjectsDropdownOpen(false)}
                />
              )}
              <FloatingMenu
                open={isProjectsDropdownOpen}
                widthClassName="w-full"
                maxHeightClassName="max-h-[196px]"
              >
                <MenuCaption>Switch project</MenuCaption>
                {projects.map((project) => {
                  const isSelected = selectedProject.id === project.id
                  return (
                    <MenuItem
                      key={project.id}
                      selected={isSelected}
                      onClick={() => {
                        onSelectProject(project)
                        setIsProjectsDropdownOpen(false)
                      }}
                      leading={
                        <span
                          className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded font-extrabold text-white text-[9px] shadow-2xs"
                          style={{ backgroundColor: project.badgeBg }}
                        >
                          {project.badge}
                        </span>
                      }
                      hint={<span className="font-mono">{project.code}</span>}
                    >
                      {project.name}
                    </MenuItem>
                  )
                })}
              </FloatingMenu>
            </div>
          </div>

          {/* SECTION 3: Data, Captures, Docs */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Workspace Data
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Data Item — expands into the five workspace data buckets */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsDataExpanded((prev) => !prev)}
                  aria-expanded={isDataExpanded}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group active:scale-98 ${
                    isDataExpanded ? "bg-blue-50/60" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isDataExpanded
                          ? "bg-[#0055ff] text-white"
                          : "bg-blue-50 text-[#0055ff] group-hover:bg-[#0055ff] group-hover:text-white"
                      }`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                      </svg>
                    </span>
                    <div>
                      <div
                        className={`text-[12.5px] font-bold transition-colors ${
                          isDataExpanded
                            ? "text-[#0055ff]"
                            : "text-slate-800 group-hover:text-[#0055ff]"
                        }`}
                      >
                        Data
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Telemetry, models &amp; logs
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums transition-colors ${
                        isDataExpanded
                          ? "bg-[#0055ff]/10 text-[#0055ff]"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {dataCategories.length}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-all duration-200 ${
                        isDataExpanded
                          ? "rotate-90 text-[#0055ff]"
                          : "text-slate-300 group-hover:text-[#0055ff] group-hover:translate-x-0.5"
                      }`}
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </button>

                {/* Expanded data buckets */}
                {isDataExpanded && (
                  <div className="mt-1 space-y-0.5 animate-slide-up origin-top">
                    {dataCategories.map((category) => {
                      const isActive = activeDataCategory === category.id
                      /* Survey Data opens the capture library, so it counts
                         captures rather than uploaded files. */
                      const count =
                        category.id === "survey"
                          ? mockCaptureFiles.length
                          : categoryFileCount(category)
                      return (
                        <button
                          type="button"
                          key={category.id}
                          onClick={() => {
                            onClose()
                            onOpenDataCategory?.(category.id)
                          }}
                          className={`w-full py-2 pl-2.5 pr-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer group/item active:scale-98 ${
                            isActive
                              ? "bg-blue-50"
                              : "hover:bg-slate-50 active:bg-slate-100"
                          }`}
                        >
                          <span
                            className={`shrink-0 transition-colors ${
                              isActive
                                ? "text-[#0055ff]"
                                : "text-slate-500 group-hover/item:text-[#0055ff]"
                            }`}
                          >
                            <DataCategoryIcon name={category.icon} />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-[12.5px] transition-colors ${
                                isActive
                                  ? "font-bold text-[#0055ff]"
                                  : "font-semibold text-slate-700 group-hover/item:text-slate-900"
                              }`}
                            >
                              {category.label}
                            </span>
                          </span>

                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums transition-colors ${
                              isActive
                                ? "bg-[#0055ff]/10 text-[#0055ff]"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {count}
                          </span>

                          <span
                            className={`shrink-0 transition-colors ${
                              isActive
                                ? "text-[#0055ff]"
                                : "text-slate-300 group-hover/item:text-slate-500"
                            }`}
                            aria-hidden="true"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <circle cx="5" cy="12" r="1.6" />
                              <circle cx="12" cy="12" r="1.6" />
                              <circle cx="19" cy="12" r="1.6" />
                            </svg>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              {/* Docs Item */}
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Docs is coming soon"
                className="w-full p-2.5 rounded-xl flex items-center justify-between text-left cursor-not-allowed opacity-70"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-[12.5px] font-bold text-slate-400">
                      Docs
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">
                      Specifications, plans &amp; reports
                    </div>
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Upcoming
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer: Sign Out & Version */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-slate-400 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose()
              onSignOut?.()
            }}
            className="flex items-center gap-1.5 text-[11.5px] font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
          <span className="text-[10px] font-mono text-slate-400">
            v1.0.4 · BIM Mobile
          </span>
        </div>
      </aside>
    </div>
  )
}

/** The small line icon shown beside each data bucket in the drawer. */
function DataCategoryIcon({ name }: { name: string }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (name) {
    case "drawings":
      return (
        <svg {...common}>
          <rect x="3" y="3.5" width="18" height="17" rx="3" />
          <path d="M3 9h18M9 9v11.5" />
        </svg>
      )
    case "cube":
      return (
        <svg {...common}>
          <path d="M12 2.8 20.5 7.4v9.2L12 21.2 3.5 16.6V7.4Z" />
          <path d="m3.5 7.4 8.5 4.6 8.5-4.6M12 12v9.2" />
        </svg>
      )
    case "survey":
      return (
        <svg {...common}>
          <path d="M5.5 4h13M12 4v4" />
          <path d="M8.5 8h7l-1.2 3h-4.6Z" />
          <path d="m10.4 11-2.9 9M13.6 11l2.9 9M12 11v9" />
        </svg>
      )
    case "submissions":
      return (
        <svg {...common}>
          <path d="M5 3.5 19.5 12 5 20.5Z" />
        </svg>
      )
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 3 9 4.5-9 4.5-9-4.5Z" />
          <path d="m3 12.5 9 4.5 9-4.5" />
          <path d="m3 17 9 4.5 9-4.5" />
        </svg>
      )
    default:
      return null
  }
}

export default SideDrawer
