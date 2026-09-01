export interface AppHeaderProps {
  showSearch?: boolean;
  markupFilter: string;
  onFilterChange: (f: string) => void;
}

const filters = [
  {
    id: "all",
    label: "All",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "task",
    label: "Task",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    id: "issue",
    label: "Issue",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "rfi",
    label: "RFI",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    id: "fieldnote",
    label: "Field Note",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" />
      </svg>
    ),
  },
];

export function AppHeader({ showSearch = false, markupFilter, onFilterChange }: AppHeaderProps) {
  return (
    <div style={{ backgroundColor: "#2451FF", paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* Row 1: workspace + avatar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "white" }}
          >
            <span style={{ color: "#2451FF", fontSize: "13px", fontWeight: 700, fontFamily: "Inter, sans-serif" }}>S</span>
          </div>
          <span style={{ color: "white", fontSize: "15px", fontWeight: 700, fontFamily: "Inter, sans-serif" }}>Stalwart</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </button>
          <div
            className="w-8 h-8 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
          >
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: "#f59e0b", fontSize: "12px", fontWeight: 700, color: "white" }}
            >
              R
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: search bar */}
      {showSearch && (
        <div className="px-4 pb-2">
          <div
            className="flex items-center gap-2 h-10 rounded-2xl px-3"
            style={{ backgroundColor: "white" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={{ color: "#9CA3AF", fontSize: "13px", flex: 1, fontFamily: "Inter, sans-serif" }}>Search task</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
            </svg>
          </div>
        </div>
      )}

      {/* Row 3: filter chips */}
      <div className="flex gap-2 px-3 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {filters.map((f) => {
          const isActive = markupFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className="flex items-center gap-1.5 rounded-full shrink-0"
              style={{
                paddingLeft: "12px",
                paddingRight: "12px",
                paddingTop: "6px",
                paddingBottom: "6px",
                backgroundColor: isActive ? "white" : "rgba(255,255,255,0.2)",
                color: isActive ? "#2451FF" : "white",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {f.icon}
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
