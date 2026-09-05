import { useEffect, useState } from "react"
import type { Item } from "../types"

interface VibeCelebrationToastProps {
  item: Item
  onDismiss: () => void
  onViewItem: () => void
}

export function VibeCelebrationToast({
  item,
  onDismiss,
  onViewItem,
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-center justify-center overflow-hidden h-64">
        <div
          className="w-48 h-48 rounded-full border-2 border-emerald-400/50 bg-emerald-400/15 animate-vibe-shockwave"
          style={{ borderColor: theme.glow }}
        />
      </div>

      {/* 2. Floating Vibe Celebration Capsule */}
      <div
        className={`fixed top-3 inset-x-3.5 z-50 select-none ${
          isClosing ? "animate-vibe-pop-out" : "animate-vibe-pop-in"
        }`}
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-950/85 backdrop-blur-xl p-3 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
          style={{
            boxShadow: `0 18px 40px rgba(0,0,0,0.4), 0 0 28px ${theme.glow}`,
          }}
        >
          {/* Top subtle iridescent glow bar */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="flex items-center gap-3">
            {/* Pulsing type icon circle */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <span
                className={`h-2.5 w-2.5 rounded-full ${theme.bg} shadow-[0_0_10px_currentColor]`}
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Content info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span>✨ Created!</span>
                </span>
                <span className="text-white/40 text-[10px]">·</span>
                <span className={`text-[10.5px] font-semibold ${theme.text}`}>
                  #{item.id}
                </span>
              </div>
              <p className="truncate text-[13px] font-semibold text-white leading-tight mt-0.5">
                {item.title || `${theme.label} recorded`}
              </p>
            </div>

            {/* Quick View Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onViewItem}
                className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11.5px] font-semibold text-white transition-all hover:bg-white/25 active:scale-95 border border-white/15"
              >
                <span>View</span>
                <svg
                  width="11"
                  height="11"
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
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <svg
                  width="13"
                  height="13"
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
          <span className="pointer-events-none absolute -top-1 left-12 text-[13px] text-amber-300 animate-vibe-sparkle-1">
            ✦
          </span>
          <span className="pointer-events-none absolute -top-2 left-24 text-[14px] text-emerald-300 animate-vibe-sparkle-2">
            ✨
          </span>
          <span className="pointer-events-none absolute -top-1 right-20 text-[12px] text-cyan-300 animate-vibe-sparkle-3">
            ⭐
          </span>
          <span className="pointer-events-none absolute -top-2 right-8 text-[13px] text-purple-300 animate-vibe-sparkle-4">
            🎉
          </span>
        </div>
      </div>
    </>
  )
}
