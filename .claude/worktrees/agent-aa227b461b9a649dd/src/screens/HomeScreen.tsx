import { AppHeader } from "../components/AppHeader";
import { BottomNav, type MainTab } from "../components/BottomNav";
import type { Item } from "../data/mockData";

interface HomeScreenProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onCreateClick: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  markupFilter: string;
  onFilterChange: (f: string) => void;
}

export function HomeScreen({
  items,
  onItemClick,
  onCreateClick,
  activeTab,
  onTabChange,
  markupFilter,
  onFilterChange,
}: HomeScreenProps) {
  const recentItems = items.slice(0, 4);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#F6F8FF" }}>
      <AppHeader showSearch markupFilter={markupFilter} onFilterChange={onFilterChange} />

      <div className="flex-1 overflow-y-auto">
        {/* Stat cards row */}
        <div className="flex gap-3 px-4 py-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {/* Today */}
          <div className="rounded-2xl p-4 shrink-0 flex flex-col gap-2" style={{ width: "140px", backgroundColor: "white", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2451FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#1E2939", fontFamily: "Nunito, sans-serif", lineHeight: 1.2 }}>Today 02</div>
              <div style={{ fontSize: "11px", color: "#EF4444", fontFamily: "Inter, sans-serif", marginTop: "2px" }}>24 overdue</div>
            </div>
          </div>

          {/* Not Started */}
          <div className="rounded-2xl p-4 shrink-0 flex flex-col gap-2" style={{ width: "140px", backgroundColor: "#2451FF" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
            <div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontFamily: "Inter, sans-serif" }}>Not Started</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "white", fontFamily: "Nunito, sans-serif", lineHeight: 1.2 }}>16 tasks</div>
            </div>
          </div>

          {/* In Progress */}
          <div className="rounded-2xl p-4 shrink-0 flex flex-col gap-2" style={{ width: "140px", backgroundColor: "#7C3AED" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
            </svg>
            <div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontFamily: "Inter, sans-serif" }}>In Progress</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "white", fontFamily: "Nunito, sans-serif", lineHeight: 1.2 }}>12 active</div>
            </div>
          </div>

          {/* In Review */}
          <div className="rounded-2xl p-4 shrink-0 flex flex-col gap-2" style={{ width: "140px", backgroundColor: "#D97706" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontFamily: "Inter, sans-serif" }}>In Review</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "white", fontFamily: "Nunito, sans-serif", lineHeight: 1.2 }}>8 pending</div>
            </div>
          </div>
        </div>

        {/* Recents section */}
        <div className="px-4 mt-2">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#6C7B95", fontFamily: "Nunito, sans-serif" }}>Recents</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C7B95" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div className="flex flex-col gap-4 mt-3">
            {recentItems.map((item) => (
              <button
                key={item.id}
                className="flex items-center gap-3 text-left"
                onClick={() => onItemClick(item)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C7B95" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                <span
                  className="flex-1 truncate"
                  style={{ fontSize: "14px", fontWeight: 400, color: "#0F172B", fontFamily: "Inter, sans-serif" }}
                >
                  {item.title}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={item.severity === "HIGH" ? "#EF4444" : "#2451FF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Phases section */}
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: "16px", fontWeight: 600, color: "#1E2939", fontFamily: "Nunito, sans-serif" }}>Phases</span>
              <span style={{ fontSize: "12px", color: "#6C7B95", fontFamily: "Inter, sans-serif" }}>03</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C7B95" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {[
            { name: "Pre - construction", count: "45" },
            { name: "Construction", count: "04" },
            { name: "Site Survey", count: "12" },
          ].map((phase, i, arr) => (
            <div key={i}>
              <div className="flex items-center gap-3 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C7B95" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                <span className="flex-1" style={{ fontSize: "14px", color: "#1E2939", fontFamily: "Inter, sans-serif" }}>{phase.name}</span>
                <span style={{ fontSize: "13px", color: "#6C7B95", fontFamily: "Inter, sans-serif" }}>{phase.count}</span>
              </div>
              {i < arr.length - 1 && <div style={{ height: "1px", backgroundColor: "#F0F4FF" }} />}
            </div>
          ))}
        </div>

        {/* Category & Items rows */}
        <div className="px-4 mt-4 mb-6">
          <div style={{ height: "1px", backgroundColor: "#F0F4FF" }} />
          <button className="w-full flex items-center gap-3 py-3" onClick={onCreateClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E2939" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h16a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2v14a2 2 0 002 2z" /><path d="M14 2v6h6" />
            </svg>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#1E2939", fontFamily: "Nunito, sans-serif", flex: 1, textAlign: "left" }}>Category</span>
            <span style={{ fontSize: "13px", color: "#6C7B95", fontFamily: "Inter, sans-serif" }}>05</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C7B95" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div style={{ height: "1px", backgroundColor: "#F0F4FF" }} />
          <button className="w-full flex items-center gap-3 py-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E2939" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#1E2939", fontFamily: "Nunito, sans-serif", flex: 1, textAlign: "left" }}>Items</span>
            <span style={{ fontSize: "13px", color: "#6C7B95", fontFamily: "Inter, sans-serif" }}>12</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C7B95" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div style={{ height: "1px", backgroundColor: "#F0F4FF" }} />
        </div>
      </div>

      <BottomNav active={activeTab} onChange={onTabChange} onFabClick={onCreateClick} />
    </div>
  );
}
