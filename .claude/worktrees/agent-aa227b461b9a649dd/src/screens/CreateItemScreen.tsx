import { useState } from "react"
import { TopBar } from "../components/TopBar"
import { SelectDropdown } from "../components/SelectDropdown"
import { CalendarPicker } from "../components/CalendarPicker"
import type { ItemType, Severity } from "../data/mockData"
import { typeLabels, typeColors } from "../data/mockData"

interface CreateItemScreenProps {
  initialType?: ItemType
  onBack: () => void
  onSubmit: (
    type: ItemType,
    title: string,
    description: string,
    severity: Severity,
  ) => void
}

const types: ItemType[] = ["issue", "task", "rfi", "fieldnote"]
const severities: Severity[] = ["HIGH", "MEDIUM", "LOW"]

const severityColorMap: Record<string, { color: string dot: string }> = {
  HIGH: { color: "#ef4444", dot: "#ef4444" },
  MEDIUM: { color: "#f97316", dot: "#f97316" },
  LOW: { color: "#6b7280", dot: "#9ca3af" },
}

const typeIconMap: Record<ItemType, React.ReactNode> = {
  issue: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <circle cx="12" cy="16" r="0.8" fill="currentColor" />
    </svg>
  ),
  task: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  rfi: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" />
    </svg>
  ),
  fieldnote: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
    </svg>
  ),
}

export function CreateItemScreen({
  initialType = "issue",
  onBack,
  onSubmit,
}: CreateItemScreenProps) {
  const [type, setType] = useState<ItemType>(initialType)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState<Severity>("MEDIUM")
  const [dueDate, setDueDate] = useState("")
  const [titleFocused, setTitleFocused] = useState(false)
  const [descFocused, setDescFocused] = useState(false)

  const typeColor = typeColors[type]
  const canSubmit = title.trim().length > 0

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#f4f7ff" }}
    >
      <TopBar
        title="Create Item"
        onBack={onBack}
        rightAction={
          <button
            onClick={() =>
              canSubmit && onSubmit(type, title, description, severity)
            }
            disabled={!canSubmit}
            className="px-4 h-9 rounded-xl text-white text-[13px] font-bold active:scale-95 transition-all"
            style={{
              backgroundColor: canSubmit ? typeColor : "#c8d1e0",
              boxShadow: canSubmit ? `0 4px 12px ${typeColor}40` : "none",
            }}
          >
            Create
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {/* Type selector */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: "#94a3b8" }}
          >
            Item Type
          </p>
          <div className="grid grid-cols-4 gap-2">
            {types.map((t) => {
              const isSelected = type === t
              const c = typeColors[t]
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="flex flex-col items-center gap-2 py-3.5 rounded-2xl border-2 transition-all active:scale-95"
                  style={{
                    backgroundColor: isSelected ? `${c}10` : "white",
                    borderColor: isSelected ? c : "#e8eeff",
                    color: isSelected ? c : "#94a3b8",
                    boxShadow: isSelected
                      ? `0 4px 14px ${c}22`
                      : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  {typeIconMap[t]}
                  <span className="text-[10px] font-bold leading-none">
                    {typeLabels[t]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
            style={{ color: "#94a3b8" }}
          >
            Title <span style={{ color: typeColor }}>*</span>
          </p>
          <div
            className="bg-white rounded-2xl overflow-hidden transition-all"
            style={{
              border: `2px solid ${titleFocused ? typeColor : "#e8eeff"}`,
              boxShadow: titleFocused
                ? `0 0 0 4px ${typeColor}18`
                : "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              placeholder={`Enter ${typeLabels[type].toLowerCase()} title…`}
              className="w-full px-4 py-3.5 text-[15px] font-medium bg-transparent outline-none"
              style={{ color: "#1a1f36" }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
            style={{ color: "#94a3b8" }}
          >
            Description
          </p>
          <div
            className="bg-white rounded-2xl overflow-hidden transition-all"
            style={{
              border: `2px solid ${descFocused ? typeColor : "#e8eeff"}`,
              boxShadow: descFocused
                ? `0 0 0 4px ${typeColor}18`
                : "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
              placeholder="Describe the issue in detail…"
              rows={4}
              className="w-full px-4 py-3.5 text-[14px] font-medium bg-transparent outline-none resize-none"
              style={{ color: "#1a1f36" }}
            />
          </div>
        </div>

        {/* Priority — SelectDropdown */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
            style={{ color: "#94a3b8" }}
          >
            Priority
          </p>
          <SelectDropdown
            options={severities.map((s) => ({
              value: s,
              label: s,
              dot: severityColorMap[s].dot,
            }))}
            value={severity}
            onChange={(v) => setSeverity(v as Severity)}
            placeholder="Select priority…"
          />
        </div>

        {/* Due Date — CalendarPicker */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
            style={{ color: "#94a3b8" }}
          >
            Due Date
          </p>
          <CalendarPicker
            value={dueDate}
            onChange={setDueDate}
            color={typeColor}
          />
        </div>

        {/* Location hint */}
        <div
          className="flex items-center gap-3 bg-white rounded-2xl p-4"
          style={{
            border: "2px solid #e8eeff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${typeColor}12` }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={typeColor}
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#1a1f36" }}>
              Location not set
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#94a3b8" }}>
              Tap on map in Home to pin location
            </p>
          </div>
        </div>

        {/* Photo capture */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
            style={{ color: "#94a3b8" }}
          >
            Photos
          </p>
          <label
            className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 cursor-pointer active:opacity-80"
            style={{ border: `2px dashed ${typeColor}40` }}
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
            />
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${typeColor}12` }}
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
            </div>
            <div>
              <p className="text-[13px] font-bold" style={{ color: typeColor }}>
                Add photos or capture
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#94a3b8" }}>
                Camera or gallery
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}
