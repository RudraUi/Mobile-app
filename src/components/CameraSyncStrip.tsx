import { useEffect, useRef, useState } from "react"

export type CameraSyncStatus =
  | "idle"
  | "connecting"
  | "downloading"
  | "syncing"
  | "complete"
  | "error"

export interface CameraSyncState {
  status: CameraSyncStatus
  /** 0 - 100 */
  progress: number
  filesDone: number
  filesTotal: number
  deviceName: string
  /** e.g. "4.2 MB/s" */
  speed?: string
  errorMessage?: string
}

const STATUS_COPY: Record<
  CameraSyncStatus,
  { label: (s: CameraSyncState) => string; bar: string }
> = {
  idle: { label: () => "", bar: "" },
  connecting: {
    label: (s) => `Connecting to ${s.deviceName}`,
    bar: "bg-white/70",
  },
  downloading: {
    label: (s) => `Importing from ${s.deviceName}`,
    bar: "bg-white",
  },
  syncing: {
    label: () => "Syncing captures to project",
    bar: "bg-white",
  },
  complete: {
    label: (s) => `${s.filesTotal} captures imported`,
    bar: "bg-emerald-300",
  },
  error: {
    label: (s) => s.errorMessage || "Transfer interrupted",
    bar: "bg-rose-300",
  },
}

function StatusGlyph({ status }: { status: CameraSyncStatus }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    width: 11,
    height: 11,
  }

  if (status === "complete") {
    return (
      <svg {...common} strokeWidth={3}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  if (status === "error") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  }
  if (status === "syncing") {
    return (
      <svg {...common} className="animate-spin-slow">
        <path d="M21 12a9 9 0 1 1-6.22-8.56" />
        <polyline points="21 3 21 9 15 9" />
      </svg>
    )
  }
  /* camera glyph for connecting / downloading */
  return (
    <svg {...common}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="3.6" />
    </svg>
  )
}

interface CameraSyncStripProps {
  state: CameraSyncState
  onCancel?: () => void
}

/**
 * Thin transfer strip that sits directly under the summary cards and reports
 * camera -> mobile download / sync progress.
 */
export function CameraSyncStrip({ state, onCancel }: CameraSyncStripProps) {
  if (state.status === "idle") return null

  const { status, progress, filesDone, filesTotal, speed } = state
  const copy = STATUS_COPY[status]
  const isActive = status === "downloading" || status === "syncing"
  const pct = Math.max(0, Math.min(100, Math.round(progress)))

  return (
    <div
      className="mt-2.5 mx-4 rounded-xl bg-white/[0.16] ring-1 ring-white/15 backdrop-blur-md px-2.5 pt-1.5 pb-2 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-1.5 text-white">
        <span
          className={`flex items-center justify-center w-[17px] h-[17px] rounded-md shrink-0 ${
            status === "complete"
              ? "bg-emerald-400/25 text-emerald-100"
              : status === "error"
                ? "bg-rose-400/25 text-rose-100"
                : "bg-white/20 text-white"
          }`}
        >
          <StatusGlyph status={status} />
        </span>

        <span className="text-[10.5px] font-bold tracking-[-0.1px] truncate">
          {copy.label(state)}
        </span>

        {isActive && (
          <span className="text-[10px] font-semibold text-blue-100/80 whitespace-nowrap shrink-0">
            · {filesDone}/{filesTotal}
            {speed ? ` · ${speed}` : ""}
          </span>
        )}

        <span className="ml-auto flex items-center gap-1.5 shrink-0">
          {isActive && (
            <span className="text-[10.5px] font-extrabold tabular-nums text-white">
              {pct}%
            </span>
          )}
          {isActive && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel transfer"
              title="Cancel transfer"
              className="w-4 h-4 rounded-full flex items-center justify-center text-blue-100/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </span>
      </div>

      {/* Thin progress track */}
      <div className="mt-1.5 h-[3px] w-full rounded-full bg-white/20 overflow-hidden">
        {status === "connecting" ? (
          <div className="h-full w-1/3 rounded-full bg-white/70 animate-sync-indeterminate" />
        ) : (
          <div
            className={`relative h-full rounded-full transition-[width] duration-500 ease-out ${copy.bar}`}
            style={{ width: `${status === "complete" ? 100 : pct}%` }}
          >
            {isActive && (
              <span className="absolute inset-0 rounded-full animate-sync-sweep" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const IDLE_STATE: CameraSyncState = {
  status: "idle",
  progress: 0,
  filesDone: 0,
  filesTotal: 0,
  deviceName: "Camera",
}

/**
 * Prototype driver: simulates a camera -> mobile import so the strip can be
 * seen end to end. Swap for the real transfer state when the SDK is wired.
 */
export function useDemoCameraSync(
  { filesTotal = 60, deviceName = "Insta360 X4" } = {},
): [CameraSyncState, () => void] {
  const [state, setState] = useState<CameraSyncState>({
    ...IDLE_STATE,
    status: "connecting",
    filesTotal,
    deviceName,
  })
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current.forEach((t) => window.clearInterval(t))
    timers.current = []
  }

  useEffect(() => {
    if (state.status === "connecting") {
      const t = window.setTimeout(
        () => setState((p) => ({ ...p, status: "downloading" })),
        1100,
      )
      timers.current.push(t)
      return () => window.clearTimeout(t)
    }

    if (state.status === "downloading") {
      const id = window.setInterval(() => {
        setState((p) => {
          const next = Math.min(100, p.progress + 3 + Math.random() * 4)
          return {
            ...p,
            progress: next,
            filesDone: Math.round((next / 100) * p.filesTotal),
            speed: `${(3.4 + Math.random()).toFixed(1)} MB/s`,
            status: next >= 100 ? "syncing" : "downloading",
          }
        })
      }, 420)
      timers.current.push(id)
      return () => window.clearInterval(id)
    }

    if (state.status === "syncing") {
      const t = window.setTimeout(
        () =>
          setState((p) => ({
            ...p,
            status: "complete",
            progress: 100,
            filesDone: p.filesTotal,
          })),
        1400,
      )
      timers.current.push(t)
      return () => window.clearTimeout(t)
    }

    if (state.status === "complete") {
      const t = window.setTimeout(
        () => setState((p) => ({ ...p, status: "idle" })),
        2600,
      )
      timers.current.push(t)
      return () => window.clearTimeout(t)
    }
  }, [state.status])

  const cancel = () => {
    clearTimers()
    setState((p) => ({ ...p, status: "idle" }))
  }

  return [state, cancel]
}

export default CameraSyncStrip
