import { useEffect, useRef, useState } from "react"
import {
  captureSessions,
  formatFileSize,
  mockCaptureFiles,
  type CaptureFile,
  type CaptureFileKind,
} from "../data/captureFiles"
import { BackButton } from "../components/BackButton"
import { SwoopTabs } from "../components/SwoopTabs"

interface CapturesScreenProps {
  onBack: () => void
  onOpenCapture?: () => void
}

type StorageFilter = "all" | "camera" | "device" | "cloud"
type SyncJob = "local" | "cloud"

const kindStyles: Record<CaptureFileKind, { label: string chip: string }> = {
  panorama: { label: "360°", chip: "bg-cyan-50 text-cyan-700" },
  photo: { label: "PHOTO", chip: "bg-blue-50 text-blue-700" },
  video: { label: "VIDEO", chip: "bg-violet-50 text-violet-700" },
  scan: { label: "SCAN", chip: "bg-amber-50 text-amber-700" },
}

const filters: { id: StorageFilter label: string icon: string }[] = [
  { id: "all", label: "All", icon: "list" },
  { id: "camera", label: "Camera", icon: "camera" },
  { id: "device", label: "Device", icon: "phone" },
  { id: "cloud", label: "Cloud", icon: "cloud" },
]

function Icon({
  name,
  size = 16,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  }
  switch (name) {
    case "back":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      )
    case "camera":
      return (
        <svg {...common}>
          <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      )
    case "phone":
      return (
        <svg {...common}>
          <rect x="6" y="2.5" width="12" height="19" rx="3" />
          <path d="M10.5 18.5h3" />
        </svg>
      )
    case "cloud":
      return (
        <svg {...common}>
          <path d="M7 18a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.3 9.5 3.75 3.75 0 0 1 17 18Z" />
        </svg>
      )
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3.5v11.5M7.6 10.6 12 15l4.4-4.4M4.5 19.5h15" />
        </svg>
      )
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 15.5V4M7.6 8.4 12 4l4.4 4.4M4.5 19.5h15" />
        </svg>
      )
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 6.5h16M9.5 6.5V4.5h5v2m-8 0 1 13.5h8.8l1-13.5M10.3 10.3v6M13.7 10.3v6" />
        </svg>
      )
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      )
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7.4" height="7.4" rx="2.1" />
          <rect x="13.6" y="3" width="7.4" height="7.4" rx="2.1" />
          <rect x="3" y="13.6" width="7.4" height="7.4" rx="2.1" />
          <rect x="13.6" y="13.6" width="7.4" height="7.4" rx="2.1" />
        </svg>
      )
    case "list":
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="15" rx="2.8" />
          <path d="M3 9.5h18M3 14.5h18" />
        </svg>
      )
    case "more":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <circle cx="12" cy="5" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
        </svg>
      )
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2l2 2.5h7.8A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z" />
        </svg>
      )
    default:
      return null
  }
}

export function CapturesScreen({ onBack, onOpenCapture }: CapturesScreenProps) {
  const [files, setFiles] = useState<CaptureFile[]>(mockCaptureFiles)
  const [filter, setFilter] = useState<StorageFilter>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [job, setJob] = useState<SyncJob | null>(null)
  const [progress, setProgress] = useState(0)
  const [isCameraConnected, setIsCameraConnected] = useState(true)
  const [isSyncSheetOpen, setIsSyncSheetOpen] = useState(false)
  const [menuFile, setMenuFile] = useState<CaptureFile | null>(null)
  const [toast, setToast] = useState("")
  const jobRef = useRef<number | null>(null)
  const toastRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (jobRef.current) window.clearInterval(jobRef.current)
      if (toastRef.current) window.clearTimeout(toastRef.current)
    },
    [],
  )


  const showToast = (message: string) => {
    setToast(message)
    if (toastRef.current) window.clearTimeout(toastRef.current)
    toastRef.current = window.setTimeout(() => setToast(""), 1900)
  }

  const onDevice = files.filter((f) => f.onDevice)
  const inCloud = files.filter((f) => f.inCloud)
  const cameraOnly = files.filter((f) => f.onCamera && !f.onDevice)
  const notBackedUp = files.filter((f) => f.onDevice && !f.inCloud)

  const deviceBytes = onDevice.reduce((sum, f) => sum + f.sizeMb, 0)
  const cloudBytes = inCloud.reduce((sum, f) => sum + f.sizeMb, 0)
  const cameraBytes = cameraOnly.reduce((sum, f) => sum + f.sizeMb, 0)
  const totalBytes = deviceBytes + cameraBytes || 1
  const pendingCount = cameraOnly.length + notBackedUp.length

  const counts: Record<StorageFilter, number> = {
    all: files.length,
    camera: files.filter((f) => f.onCamera).length,
    device: onDevice.length,
    cloud: inCloud.length,
  }

  const visible = files.filter((file) => {
    if (filter === "camera") return file.onCamera
    if (filter === "device") return file.onDevice
    if (filter === "cloud") return file.inCloud
    return true
  })

  /* Files a job would actually move: the selection if there is one, else
     everything still missing from that destination. */
  const targetsFor = (which: SyncJob) => {
    const pool = which === "local" ? cameraOnly : notBackedUp
    if (selected.size === 0) return pool
    return pool.filter((file) => selected.has(file.id))
  }

  const runSync = (which: SyncJob) => {
    const targets = targetsFor(which)
    if (job || targets.length === 0) return
    const ids = new Set(targets.map((f) => f.id))

    setJob(which)
    setProgress(0)
    jobRef.current = window.setInterval(() => {
      setProgress((current) => {
        const next = current + (which === "local" ? 9 : 6)
        if (next >= 100) {
          if (jobRef.current) window.clearInterval(jobRef.current)
          jobRef.current = null
          setFiles((list) =>
            list.map((file) =>
              ids.has(file.id)
                ? which === "local"
                  ? { ...file, onDevice: true }
                  : { ...file, inCloud: true }
                : file,
            ),
          )
          setJob(null)
          setSelected(new Set())
          showToast(
            which === "local"
              ? `${targets.length} file${
                  targets.length === 1 ? "" : "s"
                } downloaded`
              : `${targets.length} file${
                  targets.length === 1 ? "" : "s"
                } backed up`,
          )
          return 100
        }
        return next
      })
    }, 110)
  }

  const toggleSelect = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const removeSelected = () => {
    const count = selected.size
    setFiles((list) =>
      list.map((file) =>
        selected.has(file.id) ? { ...file, onDevice: false } : file,
      ),
    )
    setSelected(new Set())
    showToast(`Freed ${count} file${count === 1 ? "" : "s"} from this device`)
  }

  /* Single quiet dot instead of three badges: cloud beats device beats
     camera-only, so the dot always shows the file's safest known copy. */
  const statusDot = (file: CaptureFile) =>
    file.inCloud
      ? "bg-emerald-500"
      : file.onDevice
        ? "bg-[#0055ff]"
        : "bg-slate-300"

  const localTargets = targetsFor("local").length
  const cloudTargets = targetsFor("cloud").length

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-100 bg-white px-3 pb-3 pt-3">
        <div className="flex items-center gap-1.5">
          <BackButton onClick={onBack} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[16px] font-bold leading-tight text-slate-900">
              Captures
            </h1>
            <p className="text-[11px] text-slate-400">
              {files.length} files · {formatFileSize(deviceBytes)} on device
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSyncSheetOpen(true)}
            className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Sync & storage"
          >
            <Icon name="cloud" size={17} />
            {pendingCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-[#0055ff]" />
            )}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <SwoopTabs
        tabs={filters.map((entry) => ({
          id: entry.id,
          label: entry.label,
          icon: <Icon name={entry.icon} size={13} />,
          count: counts[entry.id],
        }))}
        active={filter}
        onChange={setFilter}
        idPrefix="capture-tab"
        ariaLabel="Storage filters"
      />

      <div className="min-h-0 flex-1 overflow-y-auto pb-8">
        <div key={filter} className="mt-3 px-4 animate-task-tab-panel">
          {visible.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-8 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <Icon name="folder" size={20} />
              </span>
              <h3 className="mt-3 text-[13.5px] font-bold text-slate-800">
                Nothing here yet
              </h3>
              <p className="mt-1 max-w-[240px] text-[11.5px] leading-[16px] text-slate-500">
                {filter === "cloud"
                  ? "Back up a capture to see it in the project workspace."
                  : filter === "device"
                    ? "Sync from the camera to keep captures on this phone."
                    : "Run a site capture to record your first walk."}
              </p>
              {onOpenCapture && filter === "all" && (
                <button
                  type="button"
                  onClick={onOpenCapture}
                  className="mt-4 flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-4 text-[12px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700"
                >
                  <Icon name="camera" size={14} /> Start a capture
                </button>
              )}
            </div>
          ) : (
            captureSessions.map((session) => {
              const sessionFiles = visible.filter(
                (file) => file.session === session.id,
              )
              if (sessionFiles.length === 0) return null

              return (
                <section key={session.id} className="mb-3">
                  <div className="flex items-center gap-2 pb-1.5">
                    <span className="shrink-0 text-[11px] font-semibold text-slate-500">
                      {session.label}
                    </span>
                    <span className="h-px flex-1 bg-slate-100" />
                    <span className="shrink-0 text-[10px] text-slate-300 tabular-nums">
                      {sessionFiles.length}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {sessionFiles.map((file) => {
                      const isSelected = selected.has(file.id)
                      return (
                        <div
                          key={file.id}
                          className={`relative flex items-center gap-2.5 py-2 transition-colors ${
                            isSelected ? "bg-blue-50/40" : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSelect(file.id)}
                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                          >
                            <span className="relative shrink-0">
                              <img
                                src={file.thumb}
                                alt=""
                                className="h-10 w-10 rounded-xl bg-slate-100 object-cover"
                              />
                              <span
                                className={`absolute -left-1 -top-1 rounded px-1 py-px text-[7px] font-bold leading-none ${kindStyles[file.kind].chip}`}
                              >
                                {kindStyles[file.kind].label}
                              </span>
                              {isSelected && (
                                <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0055ff] text-white ring-2 ring-white">
                                  <Icon name="check" size={9} />
                                </span>
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[12.5px] font-medium text-slate-800">
                                {file.name}
                              </span>
                              <span className="block text-[10.5px] text-slate-400 tabular-nums">
                                {formatFileSize(file.sizeMb)} ·{" "}
                                {file.capturedAt}
                              </span>
                            </span>
                          </button>

                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot(file)}`}
                            aria-hidden="true"
                          />

                          <button
                            type="button"
                            onClick={() => setMenuFile(file)}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                            aria-label={`Actions for ${file.name}`}
                          >
                            <Icon name="more" size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })
          )}
        </div>
      </div>

      {/* Selection action bar */}
      {selected.size > 0 && !job && (
        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 animate-slide-up">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
              aria-label="Clear selection"
            >
              <Icon name="close" size={15} />
            </button>
            <span className="shrink-0 text-[11.5px] font-semibold text-slate-700 tabular-nums">
              {selected.size} selected
            </span>
            <span className="flex-1" />
            {localTargets > 0 && (
              <button
                type="button"
                onClick={() => runSync("local")}
                disabled={!isCameraConnected}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-3.5 text-[12px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <Icon name="download" size={14} /> Download
              </button>
            )}
            {cloudTargets > 0 && (
              <button
                type="button"
                onClick={() => runSync("cloud")}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Icon name="upload" size={14} /> Back up
              </button>
            )}
            <button
              type="button"
              onClick={removeSelected}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              aria-label="Free space on this device"
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Per-file actions — a sheet, so nothing gets clipped by the scroller */}
      {menuFile && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-slate-950/45 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="File actions"
        >
          <button
            type="button"
            onClick={() => setMenuFile(null)}
            className="absolute inset-0"
            aria-label="Close"
          />
          <section className="relative z-10 w-full rounded-t-[28px] bg-white px-4 pb-5 pt-2 shadow-[0_-16px_40px_rgba(15,23,42,0.18)] animate-task-sheet">
            <div className="flex flex-col items-center">
              <span className="h-1 w-9 rounded-full bg-slate-300" />
            </div>

            <div className="mt-3 flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <img
                src={menuFile.thumb}
                alt=""
                className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-slate-900">
                  {menuFile.name}
                </p>
                <p className="text-[11px] text-slate-400 tabular-nums">
                  {formatFileSize(menuFile.sizeMb)} · {menuFile.capturedAt}
                </p>
              </div>
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${statusDot(menuFile)}`}
                aria-hidden="true"
              />
            </div>

            <div className="pt-1.5">
              {!menuFile.onDevice && (
                <button
                  type="button"
                  onClick={() => {
                    const id = menuFile.id
                    setFiles((list) =>
                      list.map((f) =>
                        f.id === id ? { ...f, onDevice: true } : f,
                      ),
                    )
                    setMenuFile(null)
                    showToast("Synced to device")
                  }}
                  className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0055ff]">
                    <Icon name="download" size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-slate-900">
                      Sync Local
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      Download from camera to this phone
                    </span>
                  </span>
                </button>
              )}

              {menuFile.onDevice && !menuFile.inCloud && (
                <button
                  type="button"
                  onClick={() => {
                    const id = menuFile.id
                    setFiles((list) =>
                      list.map((f) =>
                        f.id === id ? { ...f, inCloud: true } : f,
                      ),
                    )
                    setMenuFile(null)
                    showToast("Synced to cloud")
                  }}
                  className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon name="upload" size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-slate-900">
                      Sync Cloud
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      Upload to the Bimbox cloud workspace
                    </span>
                  </span>
                </button>
              )}

              {menuFile.onDevice && (
                <button
                  type="button"
                  onClick={() => {
                    const id = menuFile.id
                    setFiles((list) =>
                      list.map((f) =>
                        f.id === id ? { ...f, onDevice: false } : f,
                      ),
                    )
                    setMenuFile(null)
                    showToast("Removed from device")
                  }}
                  className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-rose-50 active:bg-rose-100"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Icon name="trash" size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-rose-600">
                      Remove from device
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {menuFile.inCloud
                        ? "Frees space — the cloud copy stays"
                        : "Frees space on this phone"}
                    </span>
                  </span>
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Sync & storage — moved off the main scroll and into a sheet */}
      {isSyncSheetOpen && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-slate-950/45 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Sync and storage"
        >
          <button
            type="button"
            onClick={() => setIsSyncSheetOpen(false)}
            className="absolute inset-0"
            aria-label="Close"
          />
          <section className="relative z-10 w-full rounded-t-[28px] bg-white px-4 pb-5 pt-2 shadow-[0_-16px_40px_rgba(15,23,42,0.18)] animate-task-sheet">
            <div className="flex flex-col items-center">
              <span className="h-1 w-9 rounded-full bg-slate-300" />
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-[19px] font-bold leading-none text-slate-900 tabular-nums">
                {formatFileSize(deviceBytes + cameraBytes)}
              </span>
              <span className="text-[11px] text-slate-400">
                {formatFileSize(deviceBytes)} on this device
              </span>
            </div>

            <div className="mt-2.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="rounded-full bg-[#0055ff] transition-all duration-500"
                style={{ width: `${(deviceBytes / totalBytes) * 100}%` }}
              />
              <div
                className="rounded-full bg-slate-300 transition-all duration-500"
                style={{ width: `${(cameraBytes / totalBytes) * 100}%` }}
              />
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1">
              {[
                { dot: "bg-[#0055ff]", label: "Device", value: deviceBytes },
                { dot: "bg-slate-300", label: "Camera", value: cameraBytes },
                { dot: "bg-emerald-500", label: "Cloud", value: cloudBytes },
              ].map((legend) => (
                <span
                  key={legend.label}
                  className="flex items-center gap-1.5 text-[10.5px] text-slate-400"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${legend.dot}`} />
                  {legend.label}
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {formatFileSize(legend.value)}
                  </span>
                </span>
              ))}
            </div>

            <div className="my-3.5 h-px bg-slate-100" />

            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isCameraConnected
                    ? "bg-blue-50 text-[#0055ff]"
                    : "bg-slate-50 text-slate-300"
                }`}
              >
                <Icon name="camera" size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-slate-900">
                  Insta360 X4
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      isCameraConnected ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                  {isCameraConnected
                    ? `Connected · ${cameraOnly.length} to import`
                    : "Not connected"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCameraConnected(!isCameraConnected)
                  showToast(
                    isCameraConnected
                      ? "Camera disconnected"
                      : "Camera connected",
                  )
                }}
                className="shrink-0 cursor-pointer rounded-full px-2 py-1 text-[11px] font-semibold text-[#0055ff] transition-colors hover:bg-blue-50"
              >
                {isCameraConnected ? "Disconnect" : "Connect"}
              </button>
            </div>

            {job ? (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                  <span>
                    {job === "local"
                      ? "Downloading from camera…"
                      : "Uploading to workspace…"}
                  </span>
                  <span className="tabular-nums text-slate-400">
                    {Math.min(progress, 100)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#0055ff] transition-all duration-150"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => runSync("local")}
                  disabled={!isCameraConnected || localTargets === 0}
                  className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0055ff] text-[12.5px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                >
                  <Icon name="download" size={14} />
                  Sync Local
                  {localTargets > 0 && (
                    <span className="tabular-nums opacity-70">
                      {localTargets}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => runSync("cloud")}
                  disabled={cloudTargets === 0}
                  className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
                >
                  <Icon name="upload" size={14} />
                  Sync Cloud
                  {cloudTargets > 0 && (
                    <span className="tabular-nums text-slate-400">
                      {cloudTargets}
                    </span>
                  )}
                </button>
              </div>
            )}

            {!isCameraConnected && !job && (
              <p className="mt-2 text-[10.5px] leading-[15px] text-slate-400">
                Connect over Wi-Fi Direct to import. Cloud backup still works
                for files already on this device.
              </p>
            )}
          </section>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-[72px] z-50 -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.16)] backdrop-blur-xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
