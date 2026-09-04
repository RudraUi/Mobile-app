import { useEffect, useMemo, useRef, useState } from "react"
import { BackButton } from "../components/BackButton"
import {
  dataTabs,
  formatEntrySize,
  getDataCategory,
  type DataCategoryId,
  type DataEntry,
  type DataEntryKind,
  type DataTab,
} from "../data/dataLibrary"

interface DataLibraryScreenProps {
  categoryId: DataCategoryId
  projectName: string
  onBack: () => void
}

type SortKey = "name" | "size" | "edited"
type KindFilter = "all" | "files" | "folders"

/** Which page of the library is on screen. */
type Route =
  | { kind: "library" }
  | { kind: "folder"; id: string }
  | { kind: "file"; id: string }

/* ------------------------------------------------------------------ icons */

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
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2l2 2.5h7.8A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z" />
        </svg>
      )
    case "share":
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      )
    case "tree":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="16" width="7" height="5" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
          <path d="M6.5 8v8M6.5 12.5h11V16" />
        </svg>
      )
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" />
        </svg>
      )
    case "filter":
      return (
        <svg {...common}>
          <path d="M3 6.5h6M13 6.5h8" />
          <circle cx="11" cy="6.5" r="2" />
          <path d="M3 17.5h8M15 17.5h6" />
          <circle cx="13" cy="17.5" r="2" />
        </svg>
      )
    case "sort":
      return (
        <svg {...common}>
          <path d="M7 4v16M7 20l-3-3M7 20l3-3" />
          <path d="M17 20V4M17 4l-3 3M17 4l3 3" />
        </svg>
      )
    case "list":
      return (
        <svg {...common}>
          <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
        </svg>
      )
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
          <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
          <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
          <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
        </svg>
      )
    case "newfolder":
      return (
        <svg {...common}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2l2 2.5h7.8A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z" />
          <path d="M12 11.5v5M9.5 14h5" />
        </svg>
      )
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V4M12 4 7.5 8.5M12 4l4.5 4.5" />
          <path d="M4 16v2.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V16" />
        </svg>
      )
    case "download":
      return (
        <svg {...common}>
          <path d="M12 4v12M12 16l-4.5-4.5M12 16l4.5-4.5" />
          <path d="M4 18.5V19A2 2 0 0 0 6 21h12a2 2 0 0 0 2-2v-.5" />
        </svg>
      )
    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      )
    case "check":
      return (
        <svg {...common} strokeWidth={3}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    case "close":
      return (
        <svg {...common} strokeWidth={2.2}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      )
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      )
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
          <path d="M6.5 7 7.5 20h9L17.5 7" />
        </svg>
      )
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5.3l3.2 2" />
        </svg>
      )
    case "open":
      return (
        <svg {...common}>
          <path d="M14 4h6v6M20 4l-8.5 8.5" />
          <path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
        </svg>
      )
    default:
      return null
  }
}

/* ------------------------------------------------------------- primitives */

const kindStyles: Record<
  DataEntryKind,
  { label: string; text: string; bg: string }
> = {
  pdf: { label: "PDF", text: "text-rose-600", bg: "bg-rose-50" },
  csv: { label: "CSV", text: "text-emerald-600", bg: "bg-emerald-50" },
  xlsx: { label: "XLS", text: "text-green-700", bg: "bg-green-50" },
  dwg: { label: "DWG", text: "text-orange-600", bg: "bg-orange-50" },
  ifc: { label: "IFC", text: "text-violet-600", bg: "bg-violet-50" },
  rvt: { label: "RVT", text: "text-cyan-700", bg: "bg-cyan-50" },
  image: { label: "IMG", text: "text-blue-600", bg: "bg-blue-50" },
  zip: { label: "ZIP", text: "text-amber-600", bg: "bg-amber-50" },
  folder: { label: "DIR", text: "text-slate-500", bg: "bg-slate-100" },
}

const avatarTints = [
  "bg-[#0055ff]",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
]

/** Seeded suggestions for the search screen's idle state. */
const recentSearches = ["Level 03", "rebar", "estimate", "clash report", ".pdf"]

function SharedWith({ initials }: { initials: string[] }) {
  if (initials.length === 0) {
    return <span className="text-[10px] text-slate-300">Private</span>
  }
  return (
    <span className="flex shrink-0 -space-x-1.5">
      {initials.slice(0, 3).map((who, index) => (
        <span
          key={who + index}
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white ring-2 ring-white ${
            avatarTints[index % avatarTints.length]
          }`}
        >
          {who}
        </span>
      ))}
      {initials.length > 3 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[8px] font-bold text-slate-600 ring-2 ring-white">
          +{initials.length - 3}
        </span>
      )}
    </span>
  )
}

/** The square tile an entry shows as, ahead of its name. */
function EntryGlyph({ entry, size }: { entry: DataEntry; size: 8 | 9 | 14 }) {
  const box = size === 14 ? "h-14 w-14 text-[13px]" : size === 9
    ? "h-9 w-9 text-[9px]"
    : "h-8 w-8 text-[8.5px]"

  if (entry.kind === "folder") {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg font-extrabold text-white ${box}`}
        style={{ backgroundColor: entry.badgeColor || "#0055ff" }}
      >
        {entry.badge}
      </span>
    )
  }
  const style = kindStyles[entry.kind]
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg font-extrabold ${box} ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  )
}

/** One square icon control in a screen's action row. */
function ToolButton({
  icon,
  label,
  onClick,
  isActive = false,
}: {
  icon: string
  label: string
  onClick: () => void
  isActive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors active:scale-95 ${
        isActive
          ? "border-[#0055ff]/30 bg-blue-50 text-[#0055ff]"
          : "border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon name={icon} size={15} />
      {isActive && (
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-[#0055ff]" />
      )}
    </button>
  )
}

interface EntryViewProps {
  entry: DataEntry
  isSelected: boolean
  onToggleSelect: () => void
  onOpen: () => void
  onMenu: () => void
}

function EntryTile({
  entry,
  isSelected,
  onToggleSelect,
  onOpen,
  onMenu,
}: EntryViewProps) {
  return (
    <div
      className={`relative rounded-xl border p-2.5 transition-all ${
        isSelected
          ? "border-[#0055ff]/40 bg-blue-50/60"
          : "border-slate-100 bg-white hover:border-slate-200"
      }`}
    >
      <button
        type="button"
        onClick={onToggleSelect}
        className={`absolute right-2 top-2 z-10 flex h-4 w-4 cursor-pointer items-center justify-center rounded border transition-colors ${
          isSelected
            ? "border-[#0055ff] bg-[#0055ff] text-white"
            : "border-slate-300 bg-white text-transparent hover:border-slate-400"
        }`}
        aria-label={`Select ${entry.name}`}
      >
        <Icon name="check" size={9} />
      </button>

      <button
        type="button"
        onClick={onOpen}
        className="flex w-full cursor-pointer flex-col items-start gap-1.5 text-left active:scale-[0.98]"
      >
        <EntryGlyph entry={entry} size={9} />
        <span className="line-clamp-2 w-full text-[11.5px] font-semibold leading-tight text-slate-800">
          {entry.name}
        </span>
        <span className="w-full truncate text-[10px] tabular-nums text-slate-400">
          {entry.kind === "folder"
            ? `${entry.items ?? 0} items`
            : formatEntrySize(entry.sizeKb)}{" "}
          · {entry.editedOn}
        </span>
      </button>

      <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2">
        <SharedWith initials={entry.sharedWith} />
        <button
          type="button"
          onClick={onMenu}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          aria-label={`Actions for ${entry.name}`}
        >
          <Icon name="more" size={14} />
        </button>
      </div>
    </div>
  )
}

function EntryRow({
  entry,
  isSelected,
  onToggleSelect,
  onOpen,
  onMenu,
}: EntryViewProps) {
  return (
    <div
      className={`flex items-center gap-2.5 py-2 transition-colors ${
        isSelected ? "bg-blue-50/40" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggleSelect}
        className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
          isSelected
            ? "border-[#0055ff] bg-[#0055ff] text-white"
            : "border-slate-300 bg-white text-transparent hover:border-slate-400"
        }`}
        aria-label={`Select ${entry.name}`}
      >
        <Icon name="check" size={9} />
      </button>

      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
      >
        <EntryGlyph entry={entry} size={8} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-slate-800">
            {entry.name}
          </span>
          <span className="block truncate text-[10.5px] tabular-nums text-slate-400">
            {entry.kind === "folder"
              ? `${entry.items ?? 0} items`
              : formatEntrySize(entry.sizeKb)}{" "}
            · {entry.editedOn}
          </span>
        </span>
      </button>

      <span className="w-[52px] shrink-0">
        <SharedWith initials={entry.sharedWith} />
      </span>

      <button
        type="button"
        onClick={onMenu}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95"
        aria-label={`Actions for ${entry.name}`}
      >
        <Icon name="more" size={16} />
      </button>
    </div>
  )
}

/** One hit in the search screen — same anatomy as a library row. */
function SearchResultRow({
  entry,
  meta,
  onClick,
}: {
  entry: DataEntry
  meta: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2.5 px-1.5 py-2.5 text-left transition-colors hover:bg-slate-50"
    >
      <EntryGlyph entry={entry} size={8} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-medium text-slate-800">
          {entry.name}
        </span>
        <span className="block truncate text-[10.5px] tabular-nums text-slate-400">
          {entry.kind === "folder"
            ? `${entry.items ?? 0} items`
            : formatEntrySize(entry.sizeKb)}{" "}
          · {meta}
        </span>
      </span>
      <Icon name="chevron" size={13} className="shrink-0 text-slate-300" />
    </button>
  )
}

const sheetActions = [
  { icon: "download", label: "Download", tone: "text-slate-700" },
  { icon: "share", label: "Share with team", tone: "text-slate-700" },
  { icon: "upload", label: "Move to folder", tone: "text-slate-700" },
  { icon: "trash", label: "Delete", tone: "text-rose-600" },
]

function EntryActionSheet({
  entry,
  onClose,
  onAction,
}: {
  entry: DataEntry
  onClose: () => void
  onAction: (label: string) => void
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-slate-950/45 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="File actions"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0"
        aria-label="Close"
      />
      <section className="relative z-10 w-full rounded-t-[22px] bg-white px-4 pb-5 pt-2 shadow-[0_-16px_40px_rgba(15,23,42,0.18)] animate-slide-up">
        <div className="flex flex-col items-center">
          <span className="h-1 w-9 rounded-full bg-slate-300" />
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <EntryGlyph entry={entry} size={9} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-slate-900">
              {entry.name}
            </p>
            <p className="text-[11px] tabular-nums text-slate-400">
              {entry.kind === "folder"
                ? `${entry.items ?? 0} items`
                : formatEntrySize(entry.sizeKb)}{" "}
              · Created {entry.createdOn}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-0.5">
          {sheetActions.map((action) => (
            <button
              type="button"
              key={action.label}
              onClick={() => onAction(action.label)}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-slate-50 ${action.tone}`}
            >
              <Icon name={action.icon} size={16} />
              <span className="text-[12.5px] font-semibold">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function Toast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none absolute bottom-5 left-1/2 z-60 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-[11.5px] font-semibold text-white shadow-lg animate-slide-up">
      {message}
    </div>
  )
}

/* --------------------------------------------------------------- sub-pages */

/** The page behind a folder card: that folder's own contents. */
function FolderPage({
  folder,
  breadcrumb,
  isGrid,
  onToggleGrid,
  onBack,
  onOpenFile,
}: {
  folder: DataEntry
  breadcrumb: string
  isGrid: boolean
  onToggleGrid: () => void
  onBack: () => void
  onOpenFile: (entry: DataEntry) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [menuEntry, setMenuEntry] = useState<DataEntry | null>(null)
  const [toast, setToast] = useState("")
  const toastRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (toastRef.current) window.clearTimeout(toastRef.current)
    },
    [],
  )

  const showToast = (message: string) => {
    setToast(message)
    if (toastRef.current) window.clearTimeout(toastRef.current)
    toastRef.current = window.setTimeout(() => setToast(""), 1900)
  }

  const children = folder.children ?? []
  const totalKb = children.reduce((sum, child) => sum + child.sizeKb, 0)

  const toggleSelect = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-slate-100 bg-white px-3 pb-2.5 pt-3">
        <div className="flex items-center gap-1.5">
          <BackButton onClick={onBack} label="Back to library" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15.5px] font-bold leading-tight text-slate-900">
              {folder.name}
            </h1>
            <p className="truncate text-[10.5px] text-slate-400">
              {breadcrumb}
            </p>
          </div>
          <ToolButton
            icon={isGrid ? "list" : "grid"}
            label={isGrid ? "Switch to list view" : "Switch to grid view"}
            onClick={onToggleGrid}
          />
        </div>
      </header>

      <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {children.length} items
        </span>
        <span className="h-3 w-px bg-slate-200" />
        <span className="text-[10px] font-bold uppercase tracking-wider tabular-nums text-slate-400">
          {formatEntrySize(totalKb)}
        </span>
        <span className="flex-1" />
        <SharedWith initials={folder.sharedWith} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-8">
        <div key={folder.id} className="animate-task-tab-panel">
          {children.length === 0
            ? (
              <div className="mx-4 mt-4 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-8 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                  <Icon name="folder" size={20} />
                </span>
                <h3 className="mt-3 text-[13.5px] font-bold text-slate-800">
                  This folder is empty
                </h3>
              </div>
            )
            : isGrid
            ? (
              <div className="grid grid-cols-2 gap-2.5 px-4 pt-3">
                {children.map((child) => (
                  <EntryTile
                    key={child.id}
                    entry={child}
                    isSelected={selected.has(child.id)}
                    onToggleSelect={() => toggleSelect(child.id)}
                    onOpen={() => onOpenFile(child)}
                    onMenu={() => setMenuEntry(child)}
                  />
                ))}
              </div>
            )
            : (
              <div className="divide-y divide-slate-100 px-4">
                {children.map((child) => (
                  <EntryRow
                    key={child.id}
                    entry={child}
                    isSelected={selected.has(child.id)}
                    onToggleSelect={() => toggleSelect(child.id)}
                    onOpen={() => onOpenFile(child)}
                    onMenu={() => setMenuEntry(child)}
                  />
                ))}
              </div>
            )}
        </div>
      </div>

      {selected.size > 0 && (
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
            <span className="shrink-0 text-[11.5px] font-semibold tabular-nums text-slate-700">
              {selected.size} selected
            </span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={() => {
                showToast(`${selected.size} item(s) downloading`)
                setSelected(new Set())
              }}
              className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-3.5 text-white shadow-2xs transition-colors hover:bg-blue-700"
            >
              <Icon name="download" size={14} />
              <span className="text-[12px] font-semibold">Download</span>
            </button>
            <button
              type="button"
              onClick={() => {
                showToast(`${selected.size} item(s) shared`)
                setSelected(new Set())
              }}
              className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3.5 text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Icon name="share" size={14} />
              <span className="text-[12px] font-semibold">Share</span>
            </button>
          </div>
        </div>
      )}

      {menuEntry && (
        <EntryActionSheet
          entry={menuEntry}
          onClose={() => setMenuEntry(null)}
          onAction={(label) => {
            showToast(`${label} · ${menuEntry.name}`)
            setMenuEntry(null)
          }}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  )
}

/** The page behind a file card. */
function FilePage({
  entry,
  breadcrumb,
  onBack,
  onAction,
}: {
  entry: DataEntry
  breadcrumb: string
  onBack: () => void
  onAction: (label: string) => void
}) {
  const facts: { label: string; value: string }[] = [
    { label: "Type", value: kindStyles[entry.kind].label },
    { label: "Size", value: formatEntrySize(entry.sizeKb) },
    { label: "Created on", value: entry.createdOn },
    { label: "Edited on", value: entry.editedOn },
  ]

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-slate-100 bg-white px-3 pb-2.5 pt-3">
        <div className="flex items-center gap-1.5">
          <BackButton onClick={onBack} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15.5px] font-bold leading-tight text-slate-900">
              {entry.name}
            </h1>
            <p className="truncate text-[10.5px] text-slate-400">
              {breadcrumb}
            </p>
          </div>
          <ToolButton
            icon="download"
            label="Download"
            onClick={() => onAction("Download")}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
        {/* Preview placeholder */}
        <div className="flex h-[168px] flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/70">
          <EntryGlyph entry={entry} size={14} />
          <span className="text-[11px] font-medium text-slate-400">
            Preview not available offline
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAction("Open")}
          className="mt-3 flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0055ff] text-white shadow-2xs transition-colors hover:bg-blue-700 active:scale-[0.99]"
        >
          <Icon name="open" size={15} />
          <span className="text-[12.5px] font-semibold">Open file</span>
        </button>

        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Details
            </span>
            <span className="h-px flex-1 bg-slate-100" />
          </div>
          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-100">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-center justify-between px-3 py-2.5"
              >
                <dt className="text-[11.5px] font-medium text-slate-500">
                  {fact.label}
                </dt>
                <dd className="text-[11.5px] font-semibold tabular-nums text-slate-800">
                  {fact.value}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2.5">
              <dt className="text-[11.5px] font-medium text-slate-500">
                Shared with
              </dt>
              <dd>
                <SharedWith initials={entry.sharedWith} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Actions
            </span>
            <span className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="space-y-0.5">
            {sheetActions.map((action) => (
              <button
                type="button"
                key={action.label}
                onClick={() => onAction(action.label)}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-slate-50 ${action.tone}`}
              >
                <Icon name={action.icon} size={16} />
                <span className="text-[12.5px] font-semibold">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ screen */

export function DataLibraryScreen({
  categoryId,
  projectName,
  onBack,
}: DataLibraryScreenProps) {
  const category = getDataCategory(categoryId)

  const [tab, setTab] = useState<DataTab>("uploads")
  const [entries, setEntries] = useState(category.entries)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<SortKey>("edited")
  const [sortAsc, setSortAsc] = useState(false)
  const [kindFilter, setKindFilter] = useState<KindFilter>("all")
  const [isGrid, setIsGrid] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchDraft, setSearchDraft] = useState("")
  const [openMenu, setOpenMenu] = useState<"filter" | "sort" | null>(null)
  const [menuEntry, setMenuEntry] = useState<DataEntry | null>(null)
  const [newFolderName, setNewFolderName] = useState<string | null>(null)
  const [route, setRoute] = useState<Route>({ kind: "library" })
  const [toast, setToast] = useState("")

  const tabListRef = useRef<HTMLDivElement>(null)
  const [tabIndicator, setTabIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
  })
  const [isInitialTabRender, setIsInitialTabRender] = useState(true)
  const toastRef = useRef<number | null>(null)

  /* Switching buckets from the drawer swaps the whole dataset. */
  useEffect(() => {
    setEntries(category.entries)
    setSelected(new Set())
    setQuery("")
    setRoute({ kind: "library" })
  }, [category])

  useEffect(
    () => () => {
      if (toastRef.current) window.clearTimeout(toastRef.current)
    },
    [],
  )

  useEffect(() => {
    const activeEl = tabListRef.current?.querySelector<HTMLElement>(
      `#data-tab-${tab}`,
    )
    if (activeEl && tabListRef.current) {
      setTabIndicator({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        ready: true,
      })
      const container = tabListRef.current
      container.scrollTo({
        left: Math.max(
          0,
          activeEl.offsetLeft -
            container.offsetWidth / 2 +
            activeEl.offsetWidth / 2,
        ),
        behavior: "smooth",
      })
    }
    if (isInitialTabRender) {
      const timer = setTimeout(() => setIsInitialTabRender(false), 80)
      return () => clearTimeout(timer)
    }
  }, [tab, isInitialTabRender, category, route])

  const showToast = (message: string) => {
    setToast(message)
    if (toastRef.current) window.clearTimeout(toastRef.current)
    toastRef.current = window.setTimeout(() => setToast(""), 1900)
  }

  const counts: Record<DataTab, number> = {
    uploads: entries.uploads.length,
    shared: entries.shared.length,
    structure: entries.structure.length,
  }

  const visible = useMemo(() => {
    const list = entries[tab].filter((entry) => {
      if (kindFilter === "files" && entry.kind === "folder") return false
      if (kindFilter === "folders" && entry.kind !== "folder") return false
      if (!query.trim()) return true
      return entry.name.toLowerCase().includes(query.trim().toLowerCase())
    })

    const direction = sortAsc ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * direction
      if (sortKey === "size") return (a.sizeKb - b.sizeKb) * direction
      return a.editedOn.localeCompare(b.editedOn) * direction
    })
  }, [entries, tab, query, kindFilter, sortKey, sortAsc])

  /* Everything the library holds, so a route can resolve an id from any tab
     or from inside a folder. */
  const allEntries = useMemo(() => {
    const flat: DataEntry[] = []
    dataTabs.forEach((entry) => {
      entries[entry.id].forEach((item) => {
        flat.push(item)
        item.children?.forEach((child) => flat.push(child))
      })
    })
    return flat
  }, [entries])

  const routedEntry = route.kind === "library"
    ? null
    : (allEntries.find((item) => item.id === route.id) ?? null)

  /* The search screen looks across all three tabs, not just the open one. */
  const searchResults = useMemo(() => {
    const term = searchDraft.trim().toLowerCase()
    if (!term) return []
    return dataTabs.flatMap((entry) =>
      entries[entry.id]
        .filter((item) => item.name.toLowerCase().includes(term))
        .map((item) => ({ tab: entry.id, label: entry.label, entry: item })),
    )
  }, [entries, searchDraft])

  const applySearch = (term: string, targetTab?: DataTab) => {
    setQuery(term)
    if (targetTab) setTab(targetTab)
    setIsSearchOpen(false)
  }

  const openEntry = (entry: DataEntry) =>
    setRoute(
      entry.kind === "folder"
        ? { kind: "folder", id: entry.id }
        : { kind: "file", id: entry.id },
    )

  const toggleSelect = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const allVisibleSelected =
    visible.length > 0 && visible.every((entry) => selected.has(entry.id))

  const toggleSelectAll = () =>
    setSelected((current) => {
      const next = new Set(current)
      if (allVisibleSelected) visible.forEach((entry) => next.delete(entry.id))
      else visible.forEach((entry) => next.add(entry.id))
      return next
    })

  const removeSelected = () => {
    const count = selected.size
    setEntries((current) => ({
      ...current,
      [tab]: current[tab].filter((entry) => !selected.has(entry.id)),
    }))
    setSelected(new Set())
    showToast(`${count} item${count === 1 ? "" : "s"} removed`)
  }

  const stamp = () =>
    new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const createFolder = () => {
    const name = (newFolderName || "").trim()
    if (!name) return
    const folder: DataEntry = {
      id: `fld-${Date.now()}`,
      name,
      kind: "folder",
      sizeKb: 0,
      createdOn: stamp(),
      editedOn: stamp(),
      sharedWith: [],
      items: 0,
      badge: name.slice(0, 2).toUpperCase(),
      badgeColor: "#0055ff",
      children: [],
    }
    setEntries((current) => ({ ...current, [tab]: [folder, ...current[tab]] }))
    setNewFolderName(null)
    showToast(`Folder "${name}" created`)
  }

  const uploadFile = () => {
    const upload: DataEntry = {
      id: `upl-${Date.now()}`,
      name: `${category.label.replace(/\s+/g, "-")}-Upload-${
        entries.uploads.length + 1
      }.pdf`,
      kind: "pdf",
      sizeKb: 1024 + Math.round(Math.random() * 6000),
      createdOn: stamp(),
      editedOn: stamp(),
      sharedWith: [],
    }
    setEntries((current) => ({
      ...current,
      uploads: [upload, ...current.uploads],
    }))
    setTab("uploads")
    showToast("1 file uploaded")
  }

  const sortLabels: Record<SortKey, string> = {
    name: "Name",
    size: "Size",
    edited: "Edited on",
  }

  const isFiltered = kindFilter !== "all"

  /* ------------------------------------------------------------- sub-pages */

  if (route.kind === "folder" && routedEntry) {
    return (
      <FolderPage
        folder={routedEntry}
        breadcrumb={`${projectName} · ${category.label}`}
        isGrid={isGrid}
        onToggleGrid={() => setIsGrid((v) => !v)}
        onBack={() => setRoute({ kind: "library" })}
        onOpenFile={(child) => setRoute({ kind: "file", id: child.id })}
      />
    )
  }

  if (route.kind === "file" && routedEntry) {
    const parent = allEntries.find((item) =>
      item.children?.some((child) => child.id === routedEntry.id),
    )
    return (
      <FilePage
        entry={routedEntry}
        breadcrumb={`${category.label}${parent ? ` · ${parent.name}` : ""}`}
        onBack={() =>
          setRoute(
            parent ? { kind: "folder", id: parent.id } : { kind: "library" },
          )}
        onAction={(label) => {
          if (label === "Delete") {
            setEntries((current) => ({
              ...current,
              [tab]: current[tab].filter((item) => item.id !== routedEntry.id),
            }))
            setRoute({ kind: "library" })
            showToast(`"${routedEntry.name}" deleted`)
          } else {
            showToast(`${label} · ${routedEntry.name}`)
          }
        }}
      />
    )
  }

  /* -------------------------------------------------------------- library */

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
      {/* Header — title and every control on one line */}
      <header className="shrink-0 border-b border-slate-100 bg-white px-3 pb-2.5 pt-3">
        <div className="relative flex items-center gap-1.5">
          <BackButton onClick={onBack} />

          <h1 className="min-w-0 flex-1 truncate text-[15.5px] font-bold leading-tight text-slate-900">
            {category.label}
          </h1>

          <div className="flex shrink-0 items-center gap-[3px]">
            <ToolButton
              icon="search"
              label="Search files and folders"
              onClick={() => {
                setSearchDraft(query)
                setIsSearchOpen(true)
              }}
              isActive={Boolean(query)}
            />
            <ToolButton
              icon="filter"
              label="Filter items"
              onClick={() =>
                setOpenMenu(openMenu === "filter" ? null : "filter")}
              isActive={isFiltered || openMenu === "filter"}
            />
            <ToolButton
              icon="sort"
              label="Sort items"
              onClick={() => setOpenMenu(openMenu === "sort" ? null : "sort")}
              isActive={openMenu === "sort"}
            />
            <ToolButton
              icon={isGrid ? "list" : "grid"}
              label={isGrid ? "Switch to list view" : "Switch to grid view"}
              onClick={() => setIsGrid((v) => !v)}
            />
            <ToolButton
              icon="newfolder"
              label="New folder"
              onClick={() => setNewFolderName("")}
            />
            <button
              type="button"
              onClick={uploadFile}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#0055ff] text-white shadow-2xs transition-colors hover:bg-blue-700 active:scale-95"
              aria-label="Upload a file"
            >
              <Icon name="upload" size={15} />
            </button>
          </div>

          {/* Filter / Sort popovers */}
          {openMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setOpenMenu(null)}
              />
              <div
                className={`absolute top-full z-40 mt-1.5 w-44 rounded-xl border border-slate-100 bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.16)] animate-slide-up origin-top ${
                  openMenu === "filter" ? "right-[104px]" : "right-[69px]"
                }`}
              >
                {openMenu === "filter"
                  ? (
                    [
                      { id: "all" as const, label: "All items" },
                      { id: "files" as const, label: "Files only" },
                      { id: "folders" as const, label: "Folders only" },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => {
                          setKindFilter(option.id)
                          setOpenMenu(null)
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
                          kindFilter === option.id
                            ? "bg-blue-50 text-[#0055ff]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-[12px] font-medium">
                          {option.label}
                        </span>
                        {kindFilter === option.id && (
                          <Icon name="check" size={12} />
                        )}
                      </button>
                    ))
                  )
                  : (
                    (["name", "size", "edited"] as SortKey[]).map((key) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => {
                          if (sortKey === key) setSortAsc((v) => !v)
                          else {
                            setSortKey(key)
                            setSortAsc(true)
                          }
                          setOpenMenu(null)
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
                          sortKey === key
                            ? "bg-blue-50 text-[#0055ff]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-[12px] font-medium">
                          {sortLabels[key]}
                        </span>
                        {sortKey === key && (
                          <span className="text-[10px] font-bold">
                            {sortAsc ? "A→Z" : "Z→A"}
                          </span>
                        )}
                      </button>
                    ))
                  )}
              </div>
            </>
          )}
        </div>

        {/* Active search — the separate search screen writes the query here */}
        {query && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 animate-slide-up">
            <Icon name="search" size={12} className="shrink-0 text-[#0055ff]" />
            <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[#0055ff]">
              &ldquo;{query}&rdquo;
            </span>
            <span className="shrink-0 text-[10.5px] font-bold tabular-nums text-[#0055ff]/70">
              {visible.length}
            </span>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 cursor-pointer text-[#0055ff]/60 transition-colors hover:text-[#0055ff]"
              aria-label="Clear search"
            >
              <Icon name="close" size={13} />
            </button>
          </div>
        )}
      </header>

      {/* Tabs — same construction as the captures tab bar */}
      <nav
        className="relative shrink-0 border-t border-slate-100 bg-white"
        aria-label="Data views"
      >
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[1px] bg-[#0055ff]" />

        <div
          ref={tabListRef}
          role="tablist"
          className="relative flex items-end overflow-x-auto pl-0 pr-3.5 pt-2.5 no-scrollbar scroll-smooth"
        >
          {tabIndicator.ready && (
            <div
              className={`pointer-events-none absolute bottom-0 z-15 h-[35px] bg-[#0055ff] shadow-xs ${
                tabIndicator.left === 0
                  ? "rounded-tl-none rounded-tr-xl"
                  : "rounded-t-xl"
              } ${
                isInitialTabRender
                  ? ""
                  : "transition-all duration-320 ease-[cubic-bezier(0.34,1.45,0.64,1)]"
              }`}
              style={{
                left: `${tabIndicator.left}px`,
                width: `${tabIndicator.width}px`,
              }}
            >
              {dataTabs.findIndex((t) => t.id === tab) > 0 && (
                <svg
                  className="pointer-events-none absolute -left-[11px] bottom-0 z-15 h-[12px] w-[12px]"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 12 0 C 12 6.6 6.6 12 0 12 L 12 12 Z"
                    fill="#0055ff"
                  />
                </svg>
              )}
              <svg
                className="pointer-events-none absolute -right-[11px] bottom-0 z-15 h-[12px] w-[12px]"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path d="M 0 0 C 0 6.6 5.4 12 12 12 L 0 12 Z" fill="#0055ff" />
              </svg>
            </div>
          )}

          {dataTabs.map((entry) => {
            const isActive = tab === entry.id
            return (
              <button
                type="button"
                key={entry.id}
                id={`data-tab-${entry.id}`}
                onClick={() => setTab(entry.id)}
                role="tab"
                aria-selected={isActive}
                className={`group relative z-20 flex h-[35px] shrink-0 cursor-pointer items-center gap-1.5 px-3.5 text-left font-medium transition-all duration-200 active:scale-[0.96] ${
                  isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon
                  name={entry.icon}
                  size={13}
                  className={`shrink-0 transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span className="whitespace-nowrap text-[12.5px] font-medium leading-none transition-colors duration-200">
                  {entry.label}
                </span>
                {counts[entry.id] > 0 && (
                  <span
                    className={`ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] tabular-nums transition-all duration-200 ${
                      isActive
                        ? "scale-105 bg-white/25 font-bold text-white"
                        : "scale-100 bg-slate-100 font-semibold text-slate-500 group-hover:bg-slate-200/70"
                    }`}
                  >
                    {counts[entry.id]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Column header — the desktop table's header, reduced to what fits */}
      {!isGrid && visible.length > 0 && (
        <div className="flex shrink-0 items-center gap-2.5 border-b border-slate-100 bg-slate-50/70 px-4 py-1.5">
          <button
            type="button"
            onClick={toggleSelectAll}
            className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
              allVisibleSelected
                ? "border-[#0055ff] bg-[#0055ff] text-white"
                : "border-slate-300 bg-white text-transparent hover:border-slate-400"
            }`}
            aria-label={
              allVisibleSelected ? "Clear selection" : "Select all items"
            }
          >
            <Icon name="check" size={9} />
          </button>
          <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Name
          </span>
          <button
            type="button"
            onClick={() => setSortAsc((v) => !v)}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded px-1 text-slate-400 transition-colors hover:text-[#0055ff]"
            aria-label={`Sorted by ${sortLabels[sortKey]}, ${
              sortAsc ? "ascending" : "descending"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {sortLabels[sortKey]}
            </span>
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${
                sortAsc ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <span className="w-[52px] shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Shared
          </span>
          <span className="w-8 shrink-0" aria-hidden="true" />
        </div>
      )}

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-8">
        <div key={`${category.id}-${tab}`} className="animate-task-tab-panel">
          {visible.length === 0
            ? (
              <div className="mx-4 mt-4 flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-8 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                  <Icon name="folder" size={20} />
                </span>
                <h3 className="mt-3 text-[13.5px] font-bold text-slate-800">
                  {query ? "No matches" : "Nothing here yet"}
                </h3>
                <p className="mt-1 max-w-[240px] text-[11.5px] leading-[16px] text-slate-500">
                  {query
                    ? `No files or folders match "${query}".`
                    : tab === "shared"
                      ? "Files teammates share with you land here."
                      : tab === "structure"
                        ? "Discipline folders for this project will appear here."
                        : "Upload a file to start this library."}
                </p>
                {!query && tab !== "shared" && (
                  <button
                    type="button"
                    onClick={uploadFile}
                    className="mt-4 flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-4 text-white shadow-2xs transition-colors hover:bg-blue-700"
                  >
                    <Icon name="upload" size={14} />
                    <span className="text-[12px] font-semibold">
                      Upload a file
                    </span>
                  </button>
                )}
              </div>
            )
            : isGrid
            ? (
              <div className="grid grid-cols-2 gap-2.5 px-4 pt-3">
                {visible.map((entry) => (
                  <EntryTile
                    key={entry.id}
                    entry={entry}
                    isSelected={selected.has(entry.id)}
                    onToggleSelect={() => toggleSelect(entry.id)}
                    onOpen={() => openEntry(entry)}
                    onMenu={() => setMenuEntry(entry)}
                  />
                ))}
              </div>
            )
            : (
              <div className="divide-y divide-slate-100 px-4">
                {visible.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    isSelected={selected.has(entry.id)}
                    onToggleSelect={() => toggleSelect(entry.id)}
                    onOpen={() => openEntry(entry)}
                    onMenu={() => setMenuEntry(entry)}
                  />
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Selection action bar */}
      {selected.size > 0 && (
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
            <span className="shrink-0 text-[11.5px] font-semibold tabular-nums text-slate-700">
              {selected.size} selected
            </span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={() => {
                showToast(`${selected.size} item(s) downloading`)
                setSelected(new Set())
              }}
              className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-3.5 text-white shadow-2xs transition-colors hover:bg-blue-700"
            >
              <Icon name="download" size={14} />
              <span className="text-[12px] font-semibold">Download</span>
            </button>
            <button
              type="button"
              onClick={() => {
                showToast(`${selected.size} item(s) shared`)
                setSelected(new Set())
              }}
              className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3.5 text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Icon name="share" size={14} />
              <span className="text-[12px] font-semibold">Share</span>
            </button>
            <button
              type="button"
              onClick={removeSelected}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              aria-label="Remove selected"
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Search — a screen of its own, layered over the library */}
      {isSearchOpen && (
        <div className="absolute inset-0 z-50 flex select-none flex-col bg-white animate-fade-in">
          <div className="shrink-0 border-b border-slate-100 bg-white px-3.5 pb-2.5 pt-3.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                aria-label="Back"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100/90 px-3 py-1.5 transition-all focus-within:border-[#0055ff] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100/80">
                <Icon
                  name="search"
                  size={13}
                  className="shrink-0 text-slate-500"
                />
                <input
                  autoFocus
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applySearch(searchDraft)
                  }}
                  placeholder={`Search ${category.label}...`}
                  style={{ fontSize: "12.5px" }}
                  className="w-full bg-transparent font-medium text-[#0F172A] outline-none placeholder:text-slate-400"
                  aria-label="Search files and folders"
                />
                {searchDraft && (
                  <button
                    type="button"
                    onClick={() => setSearchDraft("")}
                    className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-300 text-slate-700 transition-colors hover:bg-slate-400"
                    aria-label="Clear"
                  >
                    <Icon name="close" size={9} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="shrink-0 cursor-pointer px-1 transition-opacity hover:opacity-80"
              >
                <span className="text-[12px] font-bold text-[#0055ff]">
                  Cancel
                </span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {!searchDraft.trim()
              ? (
                <div className="space-y-4 pt-1">
                  <div>
                    <span className="mb-1.5 block text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                      Recent searches
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {recentSearches.map((term) => (
                        <button
                          type="button"
                          key={term}
                          onClick={() => setSearchDraft(term)}
                          className="flex cursor-pointer items-center gap-1 rounded-full bg-slate-100/90 px-2.5 py-[3px] text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
                        >
                          <Icon
                            name="clock"
                            size={9}
                            className="text-slate-400"
                          />
                          <span className="text-[10px] font-semibold">
                            {term}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Recent files
                    </span>
                    <div className="divide-y divide-slate-100">
                      {entries.uploads.slice(0, 5).map((item) => (
                        <SearchResultRow
                          key={item.id}
                          entry={item}
                          meta={item.editedOn}
                          onClick={() => {
                            setIsSearchOpen(false)
                            openEntry(item)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
              : searchResults.length === 0
              ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center px-8 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                    <Icon name="search" size={20} />
                  </span>
                  <h3 className="mt-3 text-[13.5px] font-bold text-slate-800">
                    No matches
                  </h3>
                  <p className="mt-1 max-w-[240px] text-[11.5px] leading-[16px] text-slate-500">
                    Nothing in {category.label} matches &ldquo;
                    {searchDraft.trim()}&rdquo;.
                  </p>
                </div>
              )
              : (
                <div>
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {searchResults.length} result
                    {searchResults.length === 1 ? "" : "s"}
                  </span>
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((result) => (
                      <SearchResultRow
                        key={`${result.tab}-${result.entry.id}`}
                        entry={result.entry}
                        meta={result.label}
                        onClick={() =>
                          applySearch(searchDraft.trim(), result.tab)}
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Per-entry action sheet */}
      {menuEntry && (
        <EntryActionSheet
          entry={menuEntry}
          onClose={() => setMenuEntry(null)}
          onAction={(label) => {
            if (label === "Delete") {
              setEntries((current) => ({
                ...current,
                [tab]: current[tab].filter((item) => item.id !== menuEntry.id),
              }))
              showToast(`"${menuEntry.name}" deleted`)
            } else {
              showToast(`${label} · ${menuEntry.name}`)
            }
            setMenuEntry(null)
          }}
        />
      )}

      {/* New folder sheet */}
      {newFolderName !== null && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-slate-950/45 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="New folder"
        >
          <button
            type="button"
            onClick={() => setNewFolderName(null)}
            className="absolute inset-0"
            aria-label="Close"
          />
          <section className="relative z-10 w-full rounded-t-[22px] bg-white px-4 pb-5 pt-2 shadow-[0_-16px_40px_rgba(15,23,42,0.18)] animate-slide-up">
            <div className="flex flex-col items-center">
              <span className="h-1 w-9 rounded-full bg-slate-300" />
            </div>
            <h2 className="mt-3 text-[14px] font-bold text-slate-900">
              New folder
            </h2>
            <input
              autoFocus
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") createFolder()
              }}
              placeholder="Folder name"
              style={{ fontSize: "13px" }}
              className="mt-2.5 w-full rounded-xl bg-slate-50 px-3 py-2.5 text-slate-800 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-[#0055ff]/30"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNewFolderName(null)}
                className="h-10 flex-1 cursor-pointer rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span className="text-[12.5px] font-semibold">Cancel</span>
              </button>
              <button
                type="button"
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="h-10 flex-1 cursor-pointer rounded-xl bg-[#0055ff] text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                <span className="text-[12.5px] font-semibold">Create</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  )
}

export default DataLibraryScreen
