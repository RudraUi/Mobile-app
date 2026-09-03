import type { ReactNode } from "react"

interface TopBarProps {
  title: string
  onBack?: () => void
  rightAction?: ReactNode
  subtitle?: string
  transparent?: boolean
}

export function TopBar({
  title,
  onBack,
  rightAction,
  subtitle,
  transparent,
}: TopBarProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 shrink-0"
      style={{
        backgroundColor: transparent ? "transparent" : "white",
        borderBottom: transparent ? "none" : "1px solid #f0f4ff",
        paddingTop: "14px",
        paddingBottom: "14px",
        boxShadow: transparent ? "none" : "0 1px 0 #f0f4ff",
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90"
          style={{ backgroundColor: "#f4f7ff" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a1f36"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        {subtitle && (
          <p
            className="text-[11px] font-bold uppercase tracking-wider mb-0.5"
            style={{ color: "#94a3b8" }}
          >
            {subtitle}
          </p>
        )}
        <h1
          className="text-[17px] font-bold truncate leading-tight"
          style={{ color: "#1a1f36" }}
        >
          {title}
        </h1>
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  )
}
