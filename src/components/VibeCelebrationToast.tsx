import { useEffect, useState } from "react"
import type { Item } from "../types"

interface VibeCelebrationToastProps {
  item: Item
  onDismiss: () => void
  onViewItem: () => void
  /**
   * The app themes itself through `data-theme`, which Tailwind's `dark:`
   * variant does not follow here, so the surface is chosen explicitly.
   */
  isDark?: boolean
}

export function VibeCelebrationToast({
  item,
  onDismiss,
  onViewItem,
  isDark = false,
}: VibeCelebrationToastProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, 4200)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onDismiss()
    }, 320)
  }

  const getTypeTheme = (type: Item["type"]) => {
    switch (type) {
      case "issue":
        return {
          bg: "bg-red-500",
          text: "text-red-400",
          glow: "rgba(239, 68, 68, 0.35)",
          label: "Issue",
          border: "border-red-500/40",
        }
      case "task":
        return {
          bg: "bg-blue-500",
          text: "text-blue-400",
          glow: "rgba(59, 130, 246, 0.35)",
          label: "Task",
          border: "border-blue-500/40",
        }
      case "rfi":
        return {
          bg: "bg-amber-500",
          text: "text-amber-400",
          glow: "rgba(245, 158, 11, 0.35)",
          label: "RFI",
          border: "border-amber-500/40",
        }
      case "fieldnote":
        return {
          bg: "bg-emerald-500",
          text: "text-emerald-400",
          glow: "rgba(16, 185, 129, 0.35)",
          label: "Field Note",
          border: "border-emerald-500/40",
        }
      default:
        return {
          bg: "bg-teal-500",
          text: "text-teal-400",
          glow: "rgba(20, 184, 166, 0.35)",
          label: "Item",
          border: "border-teal-500/40",
        }
    }
  }

  const theme = getTypeTheme(item.type)

  return (
    <>
      {/* 1. Screen-level Vibe Shockwave Ripple radiating from bottom center */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-center justify-center overflow-hidden h-40">
        <div
          className="w-32 h-32 rounded-full border-2 border-emerald-400/50 bg-emerald-400/15 animate-vibe-shockwave"
          style={{ borderColor: theme.glow }}
        />
      </div>

      {/* 2. Floating Vibe Celebration Capsule */}
      <div
        className={`absolute top-3 inset-x-3 z-50 select-none ${
          isClosing ? "animate-vibe-pop-out" : "animate-vibe-pop-in"
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border p-2 shadow-[0_12px_30px_rgba(15,23,42,0.16)] ${
            isDark
              ? "border-white/15 bg-[#151829]"
              : "border-slate-200/80 bg-white"
          }`}
          style={{
            boxShadow: `0 10px 26px rgba(15,23,42,0.16), 0 0 18px ${theme.glow}`,
          }}
        >
          {/* Top subtle iridescent glow bar */}
          <div
            className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent to-transparent ${
              isDark ? "via-white/50" : "via-slate-300/70"
            }`}
          />

          <div className="flex items-center gap-2">
            {/* Pulsing type icon circle */}
            <div
              className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${theme.bg}`}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Content info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  ✨ Created!
                </span>
                <span
                  className={`text-[9px] ${isDark ? "text-white/40" : "text-slate-300"}`}
                >
                  ·
                </span>
                <span
                  className={`text-[9px] font-semibold ${
                    isDark ? "text-white/60" : "text-slate-400"
                  }`}
                >
                  #{item.id}
                </span>
              </div>
              <p
                className={`truncate text-[11.5px] font-semibold leading-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {item.title || `${theme.label} recorded`}
              </p>
            </div>

            {/* Quick View Button */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onViewItem}
                className={`flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all active:scale-95 ${
                  isDark
                    ? "border-white/15 bg-white/15 text-white hover:bg-white/25"
                    : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>View</span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isDark
                    ? "text-white/50 hover:bg-white/10 hover:text-white"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                }`}
                aria-label="Dismiss notification"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sparkle Confetti Particles */}
          <span className="pointer-events-none absolute -top-1 left-9 text-[13px] text-amber-300 animate-vibe-sparkle-1">
            ✦
          </span>
          <span className="pointer-events-none absolute -top-2 left-20 text-[14px] text-emerald-300 animate-vibe-sparkle-2">
            ✨
          </span>
          <span className="pointer-events-none absolute -top-1 right-16 text-[12px] text-cyan-300 animate-vibe-sparkle-3">
            ⭐
          </span>
          <span className="pointer-events-none absolute -top-2 right-7 text-[13px] text-purple-300 animate-vibe-sparkle-4">
            🎉
          </span>
        </div>
      </div>
    </>
  )
}
