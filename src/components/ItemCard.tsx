import type { Item } from "../data/mockData"
import { StatusBadge, SeverityBadge } from "./StatusBadge"
import { typeColors } from "../data/mockData"

interface ItemCardProps {
  item: Item
  onClick: (item: Item) => void
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const typeColor = typeColors[item.type]

  return (
    <button
      onClick={() => onClick(item)}
      className="item-card w-full text-left bg-white dark:bg-[#151829] rounded-3xl p-4 active:scale-[0.97] transition-transform duration-150 border border-slate-100 dark:border-white/10 shadow-xs dark:shadow-none"
    >
      {/* Top row: ID + severity */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: typeColor }}
          />
          <span
            className="text-[12px] font-bold"
            style={{ color: typeColor, letterSpacing: "0.02em" }}
          >
            {item.id}
          </span>
        </div>
        <SeverityBadge severity={item.severity} />
      </div>

      {/* Title */}
      <p className="item-card-title text-[14px] font-semibold leading-snug mb-3 line-clamp-2 text-slate-900 dark:text-slate-100">
        {item.title}
      </p>

      {/* Progress bar (tasks) */}
      {item.type === "task" && item.progress !== undefined && (
        <div className="mb-3">
          <div className="item-card-progress-track w-full h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10">
            <div
              className="h-full rounded-full"
              style={{ width: `${item.progress}%`, backgroundColor: typeColor }}
            />
          </div>
          <p
            className="text-[11px] font-semibold mt-1"
            style={{ color: typeColor }}
          >
            {item.progress}
            <span
              style={{
                fontFamily:
                  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              %
            </span>{" "}
            complete
          </p>
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <StatusBadge status={item.status} />

        <div className="flex items-center gap-2">
          {/* Assignee avatars */}
          {item.assignees.length > 0 && (
            <div className="flex items-center">
              {item.assignees.slice(0, 3).map((a) => (
                <span
                  key={a.id}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white -ml-1.5 first:ml-0"
                  style={{ backgroundColor: a.color }}
                >
                  {a.initials}
                </span>
              ))}
            </div>
          )}

          {/* Due date */}
          <div className="flex items-center gap-1">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
            <span
              className="text-[11px] font-medium"
              style={{ color: "#94a3b8" }}
            >
              {item.dueDate.slice(5).replace("-", "/")}
            </span>
          </div>
        </div>
      </div>

      {/* Location tag */}
      {item.location.label !== "Location not set" && (
        <div className="flex items-center gap-1 mt-2">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span
            className="text-[11px] font-medium truncate"
            style={{ color: "#94a3b8", maxWidth: "220px" }}
          >
            {item.location.label}
          </span>
        </div>
      )}
    </button>
  )
}
