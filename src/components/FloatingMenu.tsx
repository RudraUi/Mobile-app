import type { CSSProperties, ReactNode } from "react"

/**
 * Compact floating menu system.
 *
 * The task-detail Status dropdown is the reference look: a small translucent
 * card, 11.5px semibold rows, a tiny uppercase caption and a blue check pill.
 * Every dropdown in the app renders through these primitives so they all stay
 * the same size and animate the same way.
 */

export type MenuAlign = "left" | "right" | "center"
export type MenuPlacement = "bottom" | "top"

export function FloatingMenu({
  open,
  align = "left",
  placement = "bottom",
  widthClassName = "w-40",
  maxHeightClassName,
  className = "",
  style,
  onClick,
  children,
}: {
  open: boolean
  align?: MenuAlign
  placement?: MenuPlacement
  widthClassName?: string
  maxHeightClassName?: string
  className?: string
  style?: CSSProperties
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  children: ReactNode
}) {
  const alignClass =
    align === "right"
      ? "right-0"
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0"

  const originClass =
    placement === "top"
      ? align === "right"
        ? "origin-bottom-right"
        : align === "center"
          ? "origin-bottom"
          : "origin-bottom-left"
      : align === "right"
        ? "origin-top-right"
        : align === "center"
          ? "origin-top"
          : "origin-top-left"

  const positionClass =
    placement === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"

  // Centered menus already carry a -translate-x-1/2, so the entrance offset has
  // to be folded into the same transform rather than fighting it.
  const motionClass = open
    ? align === "center"
      ? "pointer-events-auto scale-100 opacity-100"
      : "pointer-events-auto translate-y-0 scale-100 opacity-100"
    : align === "center"
      ? "pointer-events-none scale-[0.97] opacity-0"
      : placement === "top"
        ? "pointer-events-none translate-y-1.5 scale-[0.97] opacity-0"
        : "pointer-events-none -translate-y-1.5 scale-[0.97] opacity-0"

  return (
    <div
      onClick={onClick}
      style={style}
      className={`fm-surface absolute z-50 rounded-xl border p-1 backdrop-blur-xl transition-all duration-200 ease-out ${positionClass} ${alignClass} ${originClass} ${widthClassName} ${
        maxHeightClassName ? `${maxHeightClassName} overflow-y-auto` : ""
      } ${motionClass} ${className}`}
      aria-hidden={!open}
    >
      {children}
    </div>
  )
}

export function MenuCaption({ children }: { children: ReactNode }) {
  return (
    <div className="fm-caption px-2.5 pb-1 pt-1 text-[9px] font-bold uppercase tracking-wider">
      {children}
    </div>
  )
}

export function MenuCheck({ active }: { active: boolean }) {
  return (
    <span
      className={`ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0055ff] text-white transition-all duration-150 ${
        active ? "scale-100 opacity-100" : "scale-75 opacity-0"
      }`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  )
}

export function MenuDot({ color }: { color: string }) {
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

export function MenuItem({
  selected = false,
  onClick,
  leading,
  trailing,
  hint,
  children,
  className = "",
}: {
  selected?: boolean
  onClick?: () => void
  leading?: ReactNode
  trailing?: ReactNode
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fm-item flex min-h-8 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold transition-all duration-150 active:scale-[0.98] ${
        selected ? "fm-item-active" : ""
      } ${className}`}
      aria-current={selected || undefined}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {leading}
        <span className="truncate">{children}</span>
      </span>
      {hint && (
        <span className="fm-hint shrink-0 text-[9.5px] font-bold">{hint}</span>
      )}
      {trailing !== undefined ? trailing : <MenuCheck active={selected} />}
    </button>
  )
}

export default FloatingMenu
