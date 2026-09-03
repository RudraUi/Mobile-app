import type { ReactNode } from "react"
import { BackButton } from "./BackButton"

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
      {onBack && <BackButton onClick={onBack} />}
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
