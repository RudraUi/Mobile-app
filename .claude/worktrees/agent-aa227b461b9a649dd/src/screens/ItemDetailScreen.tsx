import { useState, useRef } from "react"
import { TopBar } from "../components/TopBar"
import { StatusBadge, SeverityBadge } from "../components/StatusBadge"
import { SegmentedTabs } from "../components/SegmentedTabs"
import { SelectDropdown } from "../components/SelectDropdown"
import type { Item, Status, Severity } from "../data/mockData"
import {
  typeColors,
  typeLabels,
  statusColors,
  severityColors,
} from "../data/mockData"

interface ItemDetailScreenProps {
  item: Item
  onBack: () => void
  onNavigate: (item: Item) => void
  onUpdate: (id: string, changes: Partial<Item>) => void
}

type DetailTab = "detail" | "photos" | "activity"

const statuses: Status[] = [
  "TO DO",
  "IN PROGRESS",
  "COMPLETED",
  "BLOCKED",
  "REVIEW",
  "APPROVED",
]
const severities: Severity[] = ["HIGH", "MEDIUM", "LOW"]

export function ItemDetailScreen({
  item,
  onBack,
  onNavigate,
  onUpdate,
}: ItemDetailScreenProps) {
  const [tab, setTab] = useState<DetailTab>("detail")
  const [comment, setComment] = useState("")
  const [photos, setPhotos] = useState<string[]>(item.photos)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const typeColor = typeColors[item.type]
  const typeLabel = typeLabels[item.type]

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotos((prev) => [URL.createObjectURL(file), ...prev])
  }

  const tabDefs = [
    { id: "detail" as DetailTab, label: "Details" },
    { id: "photos" as DetailTab, label: "Photos", count: photos.length },
    {
      id: "activity" as DetailTab,
      label: "Activity",
      count: item.activity.length,
    },
  ]

  const statusOptions = statuses.map((s) => ({
    value: s,
    label: s,
    dot: statusColors[s]?.text,
    badge: <StatusBadge status={s} />,
  }))

  const severityOptions = severities.map((s) => ({
    value: s,
    label: s,
    dot: severityColors[s]?.dot,
  }))

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#f4f7ff" }}
    >
      <TopBar
        title={item.id}
        subtitle={typeLabel}
        onBack={onBack}
        rightAction={
          <button
            onClick={() => onNavigate(item)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-white text-[13px] font-bold active:scale-95 transition-transform"
            style={{
              backgroundColor: typeColor,
              boxShadow: `0 4px 12px ${typeColor}40`,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            Navigate
          </button>
        }
      />

      {/* Item header card */}
      <div
        className="mx-4 mt-3 bg-white rounded-3xl overflow-hidden shrink-0"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
      >
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[12px] font-bold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
              >
                {item.id}
              </span>
              <SeverityBadge severity={item.severity} />
            </div>
            <StatusBadge status={item.status} />
          </div>
          <h2
            className="text-[16px] font-bold leading-snug"
            style={{ color: "#1a1f36" }}
          >
            {item.title}
          </h2>
        </div>

        {/* Segmented tabs */}
        <div className="px-3 pb-3">
          <SegmentedTabs
            tabs={tabDefs}
            active={tab}
            onChange={setTab}
            color={typeColor}
          />
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pt-3 pb-4">
        {tab === "detail" && (
          <div
            className="mx-4 bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            {/* Status row — SelectDropdown */}
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "#f0f4ff" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#f4f7ff" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span
                  className="text-[13px] font-semibold w-20 shrink-0"
                  style={{ color: "#94a3b8" }}
                >
                  Status
                </span>
                <div className="flex-1">
                  <SelectDropdown
                    options={statusOptions.map((o) => ({
                      value: o.value,
                      label: o.label,
                      badge: o.badge,
                    }))}
                    value={item.status}
                    onChange={(v) => onUpdate(item.id, { status: v as Status })}
                    renderTrigger={(sel) => (
                      <div className="flex items-center justify-between">
                        {sel ? (
                          <StatusBadge status={sel.value} />
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 14 }}>
                            Select…
                          </span>
                        )}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="#c8d1e0"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Priority row — SelectDropdown */}
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "#f0f4ff" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#f4f7ff" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 2l.01 14" />
                    <path d="M6 16l3-2 4 4 5-6" />
                  </svg>
                </div>
                <span
                  className="text-[13px] font-semibold w-20 shrink-0"
                  style={{ color: "#94a3b8" }}
                >
                  Priority
                </span>
                <div className="flex-1">
                  <SelectDropdown
                    options={severityOptions}
                    value={item.severity}
                    onChange={(v) =>
                      onUpdate(item.id, { severity: v as Severity })
                    }
                    renderTrigger={(sel) => (
                      <div className="flex items-center justify-between">
                        {sel ? (
                          <SeverityBadge severity={sel.value} />
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 14 }}>
                            Select…
                          </span>
                        )}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="#c8d1e0"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Assignees */}
            <div
              className="flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: "#f0f4ff" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#f4f7ff" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "#94a3b8" }}
                >
                  Assignees
                </span>
              </div>
              <div className="flex items-center">
                {item.assignees.map((a) => (
                  <span
                    key={a.id}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold border-2 border-white -ml-2 first:ml-0"
                    style={{ backgroundColor: a.color }}
                    title={a.name}
                  >
                    {a.initials}
                  </span>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div
              className="flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: "#f0f4ff" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#f4f7ff" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "#94a3b8" }}
                >
                  Due Date
                </span>
              </div>
              <span
                className="text-[14px] font-bold"
                style={{ color: "#1a1f36" }}
              >
                {item.dueDate}
              </span>
            </div>

            {/* Location */}
            <div
              className="flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: "#f0f4ff" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#f4f7ff" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "#94a3b8" }}
                >
                  Location
                </span>
              </div>
              <span
                className="text-[13px] font-semibold text-right max-w-[180px]"
                style={{ color: typeColor }}
              >
                {item.location.label}
              </span>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div
                className="flex items-start gap-3 px-4 py-4 border-b"
                style={{ borderColor: "#f0f4ff" }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: "#f4f7ff" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-[12px] font-semibold"
                      style={{ backgroundColor: "#f0f4ff", color: "#515256" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Progress */}
            {item.type === "task" && item.progress !== undefined && (
              <div
                className="px-4 py-4 border-b"
                style={{ borderColor: "#f0f4ff" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "#f4f7ff" }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: "#94a3b8" }}
                    >
                      Progress
                    </span>
                  </div>
                  <span
                    className="text-[14px] font-bold"
                    style={{ color: typeColor }}
                  >
                    {item.progress}%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#f0f4ff" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.progress}%`,
                      backgroundColor: typeColor,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="px-4 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#f4f7ff" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  >
                    <line x1="21" y1="10" x2="3" y2="10" />
                    <line x1="21" y1="6" x2="3" y2="6" />
                    <line x1="15" y1="14" x2="3" y2="14" />
                    <line x1="15" y1="18" x2="3" y2="18" />
                  </svg>
                </div>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "#94a3b8" }}
                >
                  Description
                </span>
              </div>
              <p
                className="text-[14px] leading-relaxed pl-11"
                style={{ color: item.description ? "#1a1f36" : "#b0bec5" }}
              >
                {item.description || "No description added yet."}
              </p>
            </div>
          </div>
        )}

        {tab === "photos" && (
          <div className="px-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoAdd}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2.5 h-14 rounded-2xl border-2 border-dashed mb-3 active:opacity-80"
              style={{
                borderColor: `${typeColor}40`,
                backgroundColor: `${typeColor}06`,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={typeColor}
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span
                className="text-[14px] font-bold"
                style={{ color: typeColor }}
              >
                Add Photo / Capture
              </span>
            </button>
            {photos.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${typeColor}10` }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={typeColor}
                    strokeWidth="1.5"
                  >
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: "#1a1f36" }}
                  >
                    No photos yet
                  </p>
                  <p className="text-[13px] mt-1" style={{ color: "#94a3b8" }}>
                    Capture or attach site photos
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((url, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "#e8eeff" }}
                  >
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "activity" && (
          <div className="px-4 flex flex-col gap-0">
            <div
              className="bg-white rounded-3xl overflow-hidden mb-3"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              {item.activity.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: "#1a1f36" }}
                  >
                    No activity yet
                  </p>
                  <p className="text-[13px]" style={{ color: "#94a3b8" }}>
                    Changes and comments appear here
                  </p>
                </div>
              ) : (
                item.activity.map((entry, i) => (
                  <div
                    key={entry.id}
                    className="flex gap-3 px-4 py-3.5 border-b last:border-0"
                    style={{ borderColor: "#f0f4ff" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: typeColor }}
                    >
                      {item.assignees[i % item.assignees.length]?.initials ??
                        "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] font-medium leading-snug"
                        style={{ color: "#1a1f36" }}
                      >
                        {entry.text}
                      </p>
                      <p
                        className="text-[11px] font-medium mt-1"
                        style={{ color: "#94a3b8" }}
                      >
                        {entry.date}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 text-[14px] bg-transparent outline-none"
                style={{ color: "#1a1f36" }}
              />
              <button
                onClick={() => setComment("")}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: comment ? typeColor : "#f0f4ff" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={comment ? "white" : "#94a3b8"}
                  strokeWidth="2.5"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
