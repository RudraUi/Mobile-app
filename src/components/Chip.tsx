import type { ReactNode } from "react"

/**
 * The app's chip: one pill, three sizes, used for every filter, tag, token and
 * quick pick. Selectable chips render as buttons; static ones as spans. Pass
 * `color` for a tinted chip (status, severity, type) — the tint is derived from
 * that one colour so callers never hand-mix background and text.
 */

export type ChipSize = "xs" | "sm" | "md"

export const CHIP_SIZES: Record<ChipSize, string> = {
  xs: "h-5 gap-1 px-1.5 text-[9.5px]",
  sm: "h-6 gap-1.5 px-2.5 text-[10.5px]",
  md: "h-7 gap-1.5 px-3 text-[11px]",
}

const DOT_SIZE: Record<ChipSize, string> = {
  xs: "h-1 w-1",
  sm: "h-1.5 w-1.5",
  md: "h-1.5 w-1.5",
}

interface ChipProps {
  children: ReactNode
  size?: ChipSize
  /** Filled accent treatment. Ignored when `color` is set. */
  selected?: boolean
  /** Tints the chip from a single brand/status colour. */
  color?: string
  /** Solid fill instead of a tint. Only meaningful alongside `color`. */
  solid?: boolean
  dot?: string
  icon?: ReactNode
  count?: ReactNode
  onClick?: () => void
  /** Renders a trailing ×. Makes the chip a token rather than a filter. */
  onRemove?: () => void
  removeLabel?: string
  disabled?: boolean
  className?: string
  title?: string
}

export function Chip({
  children,
  size = "sm",
  selected = false,
  color,
  solid = false,
  dot,
  icon,
  count,
  onClick,
  onRemove,
  removeLabel,
  disabled = false,
  className = "",
  title,
}: ChipProps) {
  const interactive = Boolean(onClick) && !disabled

  const base = `inline-flex shrink-0 items-center justify-center rounded-full font-semibold whitespace-nowrap transition-all duration-150 ${CHIP_SIZES[size]}`

  const tone = color
    ? ""
    : selected
      ? "bg-[#0055ff] text-white shadow-xs shadow-blue-500/25"
      : "chip-neutral"

  const style = color
    ? solid
      ? { backgroundColor: color, color: "#fff" }
      : { backgroundColor: `${color}1a`, color }
    : undefined

  const body = (
    <>
      {dot && (
        <span
          className={`${DOT_SIZE[size]} shrink-0 rounded-full`}
          style={{ backgroundColor: dot }}
        />
      )}
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      <span className="min-w-0 truncate">{children}</span>
      {count !== undefined && (
        <span
          className={`shrink-0 tabular-nums ${
            selected || solid ? "opacity-75" : "opacity-55"
          }`}
        >
          {count}
        </span>
      )}
      {onRemove && (
        <span
          role="button"
          tabIndex={-1}
          aria-label={removeLabel ?? "Remove"}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className="-mr-0.5 flex h-3.5 w-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full opacity-50 transition-opacity hover:opacity-100"
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      )}
    </>
  )

  if (!interactive) {
    return (
      <span
        className={`${base} ${tone} ${className}`}
        style={style}
        title={title}
      >
        {body}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={selected}
      className={`${base} ${tone} cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={style}
    >
      {body}
    </button>
  )
}

export default Chip
