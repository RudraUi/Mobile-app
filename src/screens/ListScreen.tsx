import { useState } from "react";
import { BottomNav, type MainTab } from "../components/BottomNav";
import { ItemCard } from "../components/ItemCard";
import { TopBar } from "../components/TopBar";
import { SelectDropdown } from "../components/SelectDropdown";
import type { Item, ItemType } from "../data/mockData";
import { typeLabels, typeColors, statusColors } from "../data/mockData";

type Tab = "home" | "issues" | "tasks" | "fieldnotes" | "rfis";

const TAB_TO_TYPE: Record<string, ItemType> = {
  issues: "issue",
  tasks: "task",
  fieldnotes: "fieldnote",
  rfis: "rfi",
  home: "task",
};

const statusOptions = [
  { value: "All", label: "All Statuses", dot: "#c8d1e0" },
  { value: "TO DO", label: "To Do", dot: statusColors["TO DO"].text },
  { value: "IN PROGRESS", label: "In Progress", dot: "#7c3aed" },
  { value: "COMPLETED", label: "Completed", dot: "#15803d" },
  { value: "REVIEW", label: "Review", dot: "#b45309" },
  { value: "BLOCKED", label: "Blocked", dot: "#dc2626" },
  { value: "APPROVED", label: "Approved", dot: "#15803d" },
];

interface ListScreenProps {
  items: Item[];
  activeTab: Tab | MainTab;
  onTabChange: (tab: MainTab) => void;
  onItemClick: (item: Item) => void;
  onCreateClick: () => void;
}

export function ListScreen({ items, activeTab, onTabChange, onItemClick, onCreateClick }: ListScreenProps) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const type = TAB_TO_TYPE[activeTab];
  const all = items.filter((i) => i.type === type);
  const filtered = all.filter((i) => {
    const matchStatus = statusFilter === "All" || i.status === statusFilter;
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const typeColor = typeColors[type];
  const label = typeLabels[type];
  const doneCount = all.filter((i) => i.status === "COMPLETED").length;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#f4f7ff" }}>
      <TopBar
        title={`${label}s`}
        subtitle={`${filtered.length} of ${all.length}`}
        rightAction={
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-white text-[13px] font-bold active:scale-95 transition-transform"
            style={{ backgroundColor: typeColor, boxShadow: `0 4px 12px ${typeColor}40` }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>
        }
      />

      {/* Search + filter row */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 shrink-0">
        {/* Search */}
        <div
          className="flex-1 flex items-center gap-2.5 bg-white rounded-2xl px-3.5 h-11"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1.5px solid #f0f4ff" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8d1e0" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}s…`}
            className="flex-1 text-[13px] bg-transparent outline-none font-medium"
            style={{ color: "#1a1f36" }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c8d1e0" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Status filter dropdown */}
        <div style={{ width: "150px", flexShrink: 0 }}>
          <SelectDropdown
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            renderTrigger={(sel) => (
              <div
                className="flex items-center gap-2 h-11 px-3.5 rounded-2xl bg-white"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1.5px solid #f0f4ff" }}
              >
                {sel?.dot && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sel.dot }} />
                )}
                <span className="flex-1 text-[13px] font-bold truncate" style={{ color: "#1a1f36" }}>
                  {statusFilter === "All" ? "Status" : sel?.label ?? statusFilter}
                </span>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="#c8d1e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#e8eeff" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: all.length ? `${(doneCount / all.length) * 100}%` : "0%",
                backgroundColor: typeColor,
              }}
            />
          </div>
          <span className="text-[11px] font-bold shrink-0" style={{ color: "#94a3b8" }}>
            {doneCount}/{all.length} done
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${typeColor}12` }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={typeColor} strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold" style={{ color: "#1a1f36" }}>No {label.toLowerCase()}s found</p>
              <p className="text-[13px] mt-1" style={{ color: "#94a3b8" }}>
                {search ? "Try a different search" : "Create one to get started"}
              </p>
            </div>
            {!search && (
              <button
                onClick={onCreateClick}
                className="px-5 py-2.5 rounded-xl text-white text-[13px] font-bold"
                style={{ backgroundColor: typeColor }}
              >
                + New {label}
              </button>
            )}
          </div>
        ) : (
          filtered.map((item, i) => (
            <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <ItemCard item={item} onClick={onItemClick} />
            </div>
          ))
        )}
      </div>

      <BottomNav active={(activeTab as MainTab) || "home"} onChange={onTabChange} />
    </div>
  );
}
