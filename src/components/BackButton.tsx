interface BackButtonProps {
  onClick: () => void
  /** Screen reader label — defaults to "Go back". */
  label?: string
  className?: string
}

/**
 * The single back affordance for every screen. Import this rather than
 * hand-rolling another chevron so the shape, size and motion stay identical
 * app-wide.
 */
export function BackButton({
  onClick,
  label = "Go back",
  className = "",
}: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-200 dark:hover:bg-white/15 active:scale-95 ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )
}

export default BackButton
