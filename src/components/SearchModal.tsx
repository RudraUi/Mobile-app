import { useState, useRef, useEffect } from "react";
import type { Item, ItemType } from "../data/mockData";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  onItemClick: (item: Item) => void;
}

const recentSearches = [
  "Level 03 duct",
  "Drainage clash",
  "Rebar clearance",
  "Concrete test",
];

export function SearchModal({ isOpen, onClose, items, onItemClick }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredResults = query.trim()
    ? items.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.severity.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
        );
      })
    : [];

  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case "task":
        return (
          <div className="w-6 h-6 rounded-md bg-blue-50 text-[#0055ff] flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="3" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="m6 10 2.5 2.5L14 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      case "issue":
        return (
          <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="2" />
              <path d="M10 6v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="10" cy="14" r="1.1" fill="currentColor" />
            </svg>
          </div>
        );
      case "rfi":
        return (
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <path d="M5 2.5h7l4 4v11H5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M12 2.5v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "fieldnote":
        return (
          <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <path d="M4 3h10a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.8" />
              <path d="m8 12 1.5-3.5 5-5 1.5 1.5-5 5z" fill="currentColor" />
            </svg>
          </div>
        );
    }
  };

  const getPriorityColor = (sev: string) => {
    if (sev === "HIGH") return "#DC2626";
    if (sev === "MEDIUM") return "#D97706";
    return "#2563EB";
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white select-none animate-fade-in">
      {/* Clean Minimal Search Bar Header */}
      <div className="shrink-0 bg-white border-b border-slate-100 px-3.5 pt-3.5 pb-2.5">
        <div className="flex items-center gap-2">
          {/* Back Icon */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Back"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Search Input Box */}
          <div className="flex-1 flex items-center gap-2 bg-slate-100/90 rounded-full px-3 py-1.5 border border-slate-200/80 focus-within:border-[#0055ff] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100/80 transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, issues, RFIs..."
              className="w-full bg-transparent text-[12.5px] text-[#0F172A] placeholder:text-slate-400 outline-none font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="w-4 h-4 rounded-full bg-slate-300 hover:bg-slate-400 text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] font-bold text-[#0055ff] hover:opacity-80 transition-opacity px-1 cursor-pointer shrink-0"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Default View (No Query Typed) */}
        {!query.trim() ? (
          <div className="space-y-4 pt-1">
            {/* Recent Searches */}
            <div>
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Recent Searches
              </span>
              <div className="flex flex-wrap gap-1">
                {recentSearches.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setQuery(s)}
                    className="flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold transition-all cursor-pointer active:scale-95"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.4">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Recent Items (Clean minimal list) */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Recent Items
              </span>
              <div className="divide-y divide-slate-100">
                {items.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onItemClick(item);
                      onClose();
                    }}
                    className="py-2.5 flex items-center justify-between gap-2.5 hover:bg-slate-50 rounded-xl px-1.5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getTypeIcon(item.type)}
                      <div className="min-w-0">
                        <h4 className="text-[12.5px] font-bold text-[#0F172A] truncate group-hover:text-[#0055ff] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[10.5px] text-slate-400 font-mono font-medium">
                          {item.id} · Level 03
                        </p>
                      </div>
                    </div>

                    <span className="text-slate-300 group-hover:text-[#0055ff] text-[14px] shrink-0 font-bold">
                      ›
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Live Results List (Clean & Spacious) */
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                {filteredResults.length} {filteredResults.length === 1 ? "Result" : "Results"}
              </span>
            </div>

            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[13px] font-bold text-slate-700">No matching items</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try a different search term</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredResults.map((item) => {
                  const priorityColor = getPriorityColor(item.severity);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onItemClick(item);
                        onClose();
                      }}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl px-2 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getTypeIcon(item.type)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {item.id}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span
                              className="text-[9.5px] font-bold capitalize"
                              style={{ color: priorityColor }}
                            >
                              {item.severity}
                            </span>
                          </div>
                          <h4 className="text-[12.5px] font-bold text-[#0F172A] truncate group-hover:text-[#0055ff] transition-colors">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9.5px] font-bold">
                          {item.status}
                        </span>
                        <span className="text-slate-300 group-hover:text-[#0055ff] text-[14px] font-bold">
                          ›
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
