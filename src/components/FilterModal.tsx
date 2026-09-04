interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  statusFilter: string
  onStatusChange: (status: string) => void
  priorityFilter: string
  onPriorityChange: (priority: string) => void
  typeFilter: string
  onTypeChange: (type: string) => void
  onReset: () => void
}

export function FilterModal({
  isOpen,
  onClose,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  typeFilter,
  onTypeChange,
  onReset,
}: FilterModalProps) {
  if (!isOpen) return null

  const statuses = [
    { id: "all", label: "All Statuses" },
    { id: "TO DO", label: "To Do" },
    { id: "IN PROGRESS", label: "In Progress" },
    { id: "REVIEW", label: "In Review" },
    { id: "COMPLETED", label: "Completed" },
  ]

  const priorities = [
    { id: "all", label: "All", dot: undefined },
    { id: "HIGH", label: "High", dot: "#EF4444" },
    { id: "MEDIUM", label: "Medium", dot: "#F59E0B" },
    { id: "LOW", label: "Low", dot: "#94A3B8" },
  ]

  const types = [
    { id: "all", label: "All" },
    { id: "task", label: "Tasks" },
    { id: "issue", label: "Issues" },
    { id: "rfi", label: "RFIs" },
    { id: "fieldnote", label: "Field Notes" },
  ]

  const activeCount =
    (statusFilter !== "all" ? 1 : 0) +
    (priorityFilter !== "all" ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0)

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/45 backdrop-blur-xs select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mx-auto flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#121524] shadow-[0_-12px_40px_rgba(0,0,0,0.25)] animate-slide-up max-h-[85vh]"
      >
        {/* Grab Handle */}
        <div className="shrink-0 pt-2.5 pb-1">
          <div
            className="mx-auto h-1 w-9 rounded-full bg-slate-300 dark:bg-white/20"
            aria-hidden="true"
          />
        </div>

        {/* Modern Compact Header with proper padding */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-500/15 text-[#0055ff] dark:text-blue-400 flex items-center justify-center shadow-2xs shrink-0">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path
                  d="M2.5 6.5h4.5M11.5 6.5h6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle
                  cx="9"
                  cy="6.5"
                  r="2.2"
                  fill="#0055ff"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M2.5 13.5h7.5M14.5 13.5h3"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle
                  cx="12.5"
                  cy="13.5"
                  r="2.2"
                  fill="#0055ff"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                Filters
              </h3>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-[#0055ff] dark:text-blue-400 text-[9px] font-bold leading-none">
                  {activeCount} active
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100/90 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close filters"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filter Sections - Balanced spacing & padding */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          {/* Type Filter */}
          <div>
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Item Type
            </span>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => {
                const isActive = typeFilter === t.id
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => onTypeChange(t.id)}
                    className={`h-7 px-3 rounded-full text-[11px] font-medium transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                      isActive
                        ? "bg-[#0055ff] text-white font-semibold shadow-xs shadow-blue-500/25"
                        : "bg-slate-100/90 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/10"
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Status
            </span>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => {
                const isActive = statusFilter === s.id
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => onStatusChange(s.id)}
                    className={`h-7 px-3 rounded-full text-[11px] font-medium transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                      isActive
                        ? "bg-[#0055ff] text-white font-semibold shadow-xs shadow-blue-500/25"
                        : "bg-slate-100/90 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/10"
                    }`}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Priority
            </span>
            <div className="flex flex-wrap gap-2">
              {priorities.map((p) => {
                const isActive = priorityFilter === p.id
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => onPriorityChange(p.id)}
                    className={`h-7 inline-flex items-center gap-1.5 px-3 rounded-full text-[11px] font-medium transition-all cursor-pointer active:scale-95 ${
                      isActive
                        ? "bg-[#0055ff] text-white font-semibold shadow-xs shadow-blue-500/25"
                        : "bg-slate-100/90 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/10"
                    }`}
                  >
                    {p.dot && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: isActive ? "#ffffff" : p.dot,
                        }}
                      />
                    )}
                    <span>{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Compact Modern Footer with proper padding */}
        <div className="px-5 pt-3 pb-6 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#161a2b]/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 text-[11px] font-semibold transition-all cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-8 px-4 rounded-full bg-[#0055ff] hover:bg-blue-600 active:scale-95 text-white text-[11.5px] font-semibold shadow-xs shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
