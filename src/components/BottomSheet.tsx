import type { ReactNode } from "react"
import useOverlayPresence from "../hooks/useOverlayPresence"

/**
 * The app's only overlay shape. Everything that would otherwise be a centred
 * modal opens from the bottom edge instead: scrim, grab handle, a quiet header,
 * a scrolling body and an optional pinned footer. Keeping this in one place is
 * what stops sheets drifting apart in radius, padding and exit motion.
 */

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  /** Sits under the title — a count, a hint, whatever the sheet needs. */
  subtitle?: ReactNode
  /** Small pill beside the title. */
  badge?: ReactNode
  /** Pinned under the scrolling body. */
  footer?: ReactNode
  children: ReactNode
  maxHeightClassName?: string
  /** Hide the close button when the footer already dismisses the sheet. */
  showClose?: boolean
  ariaLabel?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  footer,
  children,
  maxHeightClassName = "max-h-[82vh]",
  showClose = true,
  ariaLabel,
}: BottomSheetProps) {
  const isPresent = useOverlayPresence(isOpen)
  if (!isPresent) return null

  return (
    <div
      data-overlay-state={isOpen ? "open" : "closing"}
      inert={!isOpen}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/40 backdrop-blur-xs select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`ui-surface relative z-10 mx-auto flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] border-t shadow-[0_-12px_40px_rgba(15,23,42,0.22)] animate-slide-up ${maxHeightClassName}`}
      >
        {/* Grab handle */}
        <div className="shrink-0 pt-2.5 pb-1">
          <div
            className="mx-auto h-1 w-9 rounded-full bg-slate-300 dark:bg-white/20"
            aria-hidden="true"
          />
        </div>

        {/* Header */}
        <div className="ui-divider flex shrink-0 items-start justify-between gap-3 border-b px-5 pb-3 pt-1.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="ui-text text-[14px] font-bold leading-tight tracking-tight">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p className="ui-text-dim mt-0.5 text-[11px] font-medium leading-tight">
                {subtitle}
              </p>
            )}
          </div>

          {showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="ui-text-dim flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="ui-divider ui-surface shrink-0 border-t px-5 pb-6 pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/** A labelled block of controls inside a sheet. */
export function SheetSection({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <span className="ui-text-dim mb-2 block px-0.5 text-[9.5px] font-bold uppercase tracking-wider">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

export default BottomSheet
