import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import type { Assignee, ItemType, Severity, Status } from "../data/mockData"
import { CustomKeyboard } from "../components/CustomKeyboard"
import { Calendar } from "../components/Calendar"

export interface CreateItemDraft {
  type: ItemType
  title: string
  description: string
  severity: Severity
  dueDate: string
  assignees: Assignee[]
  status: Status
  tags: string[]
  photos: string[]
}

interface CreateItemScreenProps {
  initialType?: ItemType
  onBack: () => void
  onSubmit: (draft: CreateItemDraft) => void
}

const itemTypeOptions: Array<{
  type: ItemType
  label: string
  desc: string
  color: string
  bg: string
}> = [
  {
    type: "task",
    label: "Task",
    desc: "General action item or milestone",
    color: "#0055ff",
    bg: "bg-blue-50 text-[#0055ff]",
  },
  {
    type: "issue",
    label: "Issue",
    desc: "Site clash, defect, or safety hazard",
    color: "#DC2626",
    bg: "bg-red-50 text-red-600",
  },
  {
    type: "rfi",
    label: "RFI",
    desc: "Request for Information from design team",
    color: "#D97706",
    bg: "bg-amber-50 text-amber-600",
  },
  {
    type: "fieldnote",
    label: "Field Note",
    desc: "Site observation or photo log",
    color: "#059669",
    bg: "bg-emerald-50 text-emerald-600",
  },
]

const availableMembers = [
  {
    id: "me",
    name: "Anil Kumar",
    role: "BIM Coordinator · You",
    initials: "AK",
    color: "#0055ff",
  },
  {
    id: "sj",
    name: "Sarah Jenkins",
    role: "Structural Lead",
    initials: "SJ",
    color: "#8B5CF6",
  },
  {
    id: "dz",
    name: "David Zhang",
    role: "MEP Engineer",
    initials: "DZ",
    color: "#10B981",
  },
  {
    id: "pp",
    name: "Priya Patel",
    role: "Site Supervisor",
    initials: "PP",
    color: "#F59E0B",
  },
]

const priorities: Array<{ value: Severity label: string color: string }> = [
  { value: "LOW", label: "Low", color: "#2563EB" },
  { value: "MEDIUM", label: "Medium", color: "#D97706" },
  { value: "HIGH", label: "High", color: "#DC2626" },
]

const statuses: Array<{ value: Status label: string bg: string text: string }> =
  [
    { value: "TO DO", label: "Todo", bg: "bg-sky-500", text: "text-white" },
    {
      value: "IN PROGRESS",
      label: "In Progress",
      bg: "bg-blue-600",
      text: "text-white",
    },
    {
      value: "REVIEW",
      label: "In Review",
      bg: "bg-purple-600",
      text: "text-white",
    },
    {
      value: "BLOCKED",
      label: "Blocked",
      bg: "bg-rose-500",
      text: "text-white",
    },
    {
      value: "APPROVED",
      label: "Approved",
      bg: "bg-teal-600",
      text: "text-white",
    },
    {
      value: "COMPLETED",
      label: "Completed",
      bg: "bg-emerald-600",
      text: "text-white",
    },
  ]

const quickTags = ["MEP", "Structural", "Level 03", "HVAC", "Safety", "Quality"]

const WEEKDAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

const GALLERY_PHOTOS = [
  {
    id: "g1",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "g2",
    url: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "g3",
    url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "g4",
    url: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "g5",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "g6",
    url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "g7",
    url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "g8",
    url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "g9",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop&auto=format",
  },
]

type PropertySheet = "type" | "status" | "priority" | "assignee" | "date" | "tags" | "attachments"

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m6 4 4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function PropertyGlyph({ type }: { type: PropertySheet }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24" as const,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }

  switch (type) {
    case "type":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    case "status":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
        </svg>
      )
    case "priority":
      return (
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <line
            x1="5"
            y1="3"
            x2="5"
            y2="21"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M5 4h12.5a0.8 0.8 0 0 1 .65 1.25L16 8.5l2.15 3.25a0.8 0.8 0 0 1-.65 1.25H5V4z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      )
    case "assignee":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 20c.5-4.5 2.7-6.5 6.5-6.5s6 2 6.5 6.5" />
        </svg>
      )
    case "date":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M7 3v4M17 3v4M3 10h18" />
        </svg>
      )
    case "tags":
      return (
        <svg {...common}>
          <path d="m3 13 10-10h7v7L10 20a2.5 2.5 0 0 1-3.5 0L3 16.5A2.5 2.5 0 0 1 3 13Z" />
          <circle cx="16.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case "attachments":
      return (
        <svg {...common}>
          <path d="m8.5 12.5 6-6a3.2 3.2 0 1 1 4.5 4.5l-8.5 8.5a5 5 0 0 1-7-7l9-9" />
        </svg>
      )
  }
}

export function CreateItemScreen({
  initialType = "task",
  onBack,
  onSubmit,
}: CreateItemScreenProps) {
  const [selectedType, setSelectedType] = useState<ItemType>(initialType)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priorityIndex, setPriorityIndex] = useState(1)
  const [status, setStatus] = useState<Status>("TO DO")
  const [dueDate, setDueDate] = useState("")
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(["me"])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([])

  const [calendarTab, setCalendarTab] = useState<"date" | "week" | "month">(
    "date",
  )
  const [dueDateLabelCustom, setDueDateLabelCustom] = useState<string>("")

  const [activePropertySheet, setActivePropertySheet] =
    useState<PropertySheet | null>(null)
  const [activeField, setActiveField] =
    useState<"title" | "description" | null>(null)

  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState("")
  const [isAssigneeSearchFocused, setIsAssigneeSearchFocused] = useState(false)

  useEffect(() => {
    if (activePropertySheet !== "assignee") {
      setIsAssigneeSearchFocused(false)
      setAssigneeSearchQuery("")
    }
  }, [activePropertySheet])

  const filteredMembers = availableMembers.filter((member) => {
    if (!assigneeSearchQuery.trim()) return true
    const q = assigneeSearchQuery.toLowerCase()
    return (
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      member.initials.toLowerCase().includes(q)
    )
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const [isCreated, setIsCreated] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const priority = priorities[priorityIndex]
  const canSubmit = title.trim().length > 0

  const handleDismiss = useCallback(() => {
    if (isExiting || isCreated) return
    setIsExiting(true)
    setTimeout(() => {
      onBack()
    }, 320)
  }, [isExiting, isCreated, onBack])

  const handleCreate = () => {
    if (!canSubmit || isCreated || isExiting) return
    setIsCreated(true)

    // Tactile haptic vibration for mobile vibe
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([35, 50, 40, 70])
      }
    } catch {
      // ignore
    }

    const assignees: Assignee[] = availableMembers
      .filter((member) => selectedAssignees.includes(member.id))
      .map(({ id, name, initials, color }) => ({ id, name, initials, color }))

    const draft: CreateItemDraft = {
      type: selectedType,
      title: title.trim(),
      description: description.trim(),
      severity: priority.value,
      dueDate,
      assignees,
      status,
      tags: selectedTags,
      photos: attachedPhotos,
    }

    // Step 1: User enjoys the button success celebration vibe (220ms)
    // Step 2: Smooth downward drawer motion (380ms)
    setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        onSubmit(draft)
      }, 380)
    }, 220)
  }

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newPhoto = URL.createObjectURL(e.target.files[0])
      setAttachedPhotos((prev) => [...prev, newPhoto])
      e.target.value = ""
    }
  }

  const togglePhotoAttachment = (url: string) => {
    setAttachedPhotos((prev) =>
      prev.includes(url) ? prev.filter((p) => p !== url) : [...prev, url],
    )
  }

  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case "task":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="1.5" y="1.5" width="13" height="13" rx="3" />
            <path d="m4.8 8 2.2 2.2 4.2-4.5" />
          </svg>
        )
      case "issue":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.8v3.6" />
            <circle cx="8" cy="11.2" r=".9" fill="currentColor" stroke="none" />
          </svg>
        )
      case "rfi":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3.5 1.5h6l4 4v9h-10z" />
            <path d="M9.5 1.5v4h4" />
            <path d="M5.5 7.5h4M5.5 10.5h3.2" />
          </svg>
        )
      case "fieldnote":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M2.8 2.2h7.8a1.5 1.5 0 0 1 1.5 1.5v9H4.2a1.5 1.5 0 0 1-1.4-1.5z" />
            <path
              d="m6.2 9.5 1-2.2 3.2-3.2.8.8-3.2 3.2z"
              fill="currentColor"
              stroke="none"
            />
          </svg>
        )
    }
  }

  const selectedTypeInfo =
    itemTypeOptions.find((t) => t.type === selectedType) || itemTypeOptions[0]
  const selectedStatusInfo =
    statuses.find((item) => item.value === status) || statuses[0]
  const selectedAssigneeMembers = availableMembers.filter((member) =>
    selectedAssignees.includes(member.id),
  )
  const selectedMemberNames = selectedAssigneeMembers
    .map((member) => member.name)
    .join(", ")
  const dueDateLabel = dueDate
    ? dueDateLabelCustom ||
      new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Set a due date"
  const propertySheetMeta: Record<PropertySheet, {
    title: string
    hint: string
  }> = {
    type: {
      title: "Select item type",
      hint: "Choose the classification for this new item.",
    },
    status: {
      title: "Choose status",
      hint: "Select the starting workflow state.",
    },
    priority: {
      title: "Set priority",
      hint: "Choose how urgently this needs attention.",
    },
    assignee: {
      title: "Choose assignee",
      hint: "Select or remove a team member.",
    },
    date: {
      title: "Set due date",
      hint: "Choose when this item should be completed.",
    },
    tags: {
      title: "Choose tags",
      hint: "Select or remove a classification tag.",
    },
    attachments: {
      title: "Add attachments",
      hint: "Upload site photos for this item.",
    },
  }

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col justify-end transition-all duration-380 ease-out ${
        isExiting
          ? "bg-slate-950/0 backdrop-blur-none pointer-events-none"
          : "bg-slate-950/40 backdrop-blur-[2px] animate-fade-in"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={
        activePropertySheet
          ? propertySheetMeta[activePropertySheet].title
          : "Create " + selectedTypeInfo.label
      }
    >
      <button
        type="button"
        onClick={() => {
          if (activeField) {
            setActiveField(null)
          } else if (activePropertySheet) {
            setActivePropertySheet(null)
          } else {
            handleDismiss()
          }
        }}
        className="absolute inset-0 cursor-default"
        aria-label={
          activePropertySheet ? "Back to create form" : "Close dialog"
        }
      />

      {activePropertySheet === null && (
        <section
          className={`relative z-10 flex w-full flex-col overflow-hidden rounded-t-[28px] border-t border-slate-200 bg-white shadow-[0_-12px_32px_rgba(15,23,42,0.16)] transition-all duration-380 ease-[cubic-bezier(0.32,1,0.23,1)] ${
            isExiting ? "translate-y-[115%]" : "translate-y-0 animate-slide-up"
          } ${activeField ? "max-h-[50%]" : "max-h-[62%]"}`}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="relative shrink-0 border-b border-slate-200 bg-white px-4 pb-3 pt-2.5">
            <div
              className="mx-auto mb-2.5 h-1 w-9 rounded-full bg-slate-200"
              aria-hidden="true"
            />
            <div className="flex w-full items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveField(null)
                  setActivePropertySheet("type")
                }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold text-slate-800 transition-colors hover:bg-slate-100/80 active:bg-slate-100"
                aria-label="Change item type"
              >
                <span
                  style={{ color: selectedTypeInfo.color }}
                  className="shrink-0"
                >
                  {getTypeIcon(selectedType)}
                </span>
                <span>{selectedTypeInfo.label}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-slate-400"
                  aria-hidden="true"
                >
                  <path
                    d="m4 6 4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Circle close button at top right */}
              <button
                type="button"
                onClick={handleDismiss}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 active:scale-95"
                aria-label="Close"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-1.5 pt-4">
            {/* Breadcrumb with icons for each item separated by slashes */}
            <div className="flex items-center gap-2 overflow-x-auto text-[13px]">
              <span className="flex shrink-0 items-center gap-1.5 font-medium text-slate-600">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-teal-600"
                >
                  <rect width="16" height="20" x="4" y="2" rx="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
                </svg>
                <span>Construction</span>
              </span>
              <span
                className="shrink-0 text-slate-300 font-normal select-none text-[14px]"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                /
              </span>
              <span className="flex shrink-0 items-center gap-1.5 font-medium text-slate-600">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-emerald-600"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span>Civil Works</span>
              </span>
              <span
                className="shrink-0 text-slate-300 font-normal select-none text-[14px]"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                /
              </span>
              <span className="flex shrink-0 items-center gap-1.5 font-medium text-slate-800">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-blue-600"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                </svg>
                <span>
                  Rebar{" "}
                  <span
                    style={{
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    &amp;
                  </span>{" "}
                  Formwork
                </span>
              </span>
            </div>

            {/* Thin breadcrumb separator */}
            <div className="mt-2 border-b border-slate-100" />

            {/* Title Row - Simple icon, NO box around icon */}
            <div className="mt-2.5">
              <textarea
                value={title}
                onFocus={() => setActiveField("title")}
                onChange={(event) => setTitle(event.target.value)}
                rows={2}
                placeholder={"Untitled " + selectedTypeInfo.label}
                className="min-h-[50px] w-full resize-none bg-transparent text-[22px] font-medium leading-[1.3] tracking-tight text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                style={{ fontSize: "22px", fontWeight: 500 }}
              />
            </div>

            {/* Thin separator */}
            <div className="mx-1 border-b border-slate-100" />

            {/* Description Row - Clean field, NO border box */}
            <div className="mt-1.5 pb-2">
              <textarea
                id="create-item-description"
                value={description}
                onFocus={() => setActiveField("description")}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="Add a description..."
                className="w-full resize-none bg-transparent text-[14px] font-normal leading-[1.6] text-slate-600 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Assignee - inline row */}
            <div className="mt-3 border-t border-slate-100 pt-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveField(null)
                  setActivePropertySheet("assignee")
                }}
                className="flex w-full items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    selectedMemberNames
                      ? "bg-violet-100 text-violet-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <PropertyGlyph type="assignee" />
                </div>
                <span className="text-[13px] font-medium text-slate-500">
                  Assignee
                </span>
                <div className="ml-auto flex items-center">
                  {selectedAssigneeMembers.length > 0 ? (
                    <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                      {selectedAssigneeMembers.map((member) => (
                        <span
                          key={member.id}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white shadow-xs"
                          style={{ backgroundColor: member.color }}
                          title={member.name}
                        >
                          {member.initials}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[13px] font-medium text-slate-400">
                      None
                    </span>
                  )}
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-slate-300"
                >
                  <path
                    d="m9 6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Due Date - inline row */}
              <button
                type="button"
                onClick={() => {
                  setActiveField(null)
                  setActivePropertySheet("date")
                }}
                className="flex w-full items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    dueDate
                      ? "bg-amber-100 text-amber-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <PropertyGlyph type="date" />
                </div>
                <span className="text-[13px] font-medium text-slate-500">
                  Due date
                </span>
                <span className="ml-auto text-[13px] font-medium text-slate-800">
                  {dueDate ? dueDateLabel : "None"}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-slate-300"
                >
                  <path
                    d="m9 6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Remaining icons row: Status, Priority, Tags, Files + Create */}
            <div className="mt-0.5 border-t border-slate-100 pt-1.5">
              <div className="flex items-center gap-1.5 px-0">
                {/* Status Pill Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveField(null)
                    setActivePropertySheet("status")
                  }}
                  className={`flex h-5.5 items-center justify-center rounded-md px-2 text-[9.5px] font-bold text-white transition-all active:scale-95 shadow-xs ${selectedStatusInfo.bg}`}
                  style={{ fontWeight: 700, fontSize: "9.5px" }}
                  title={`Status: ${selectedStatusInfo.label}`}
                >
                  {selectedStatusInfo.label}
                </button>

                {/* Priority */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveField(null)
                    setActivePropertySheet("priority")
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-95 hover:bg-slate-50"
                  title={`Priority: ${priority.label}`}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center"
                    style={{ color: priority.color || "#ea580c" }}
                  >
                    <PropertyGlyph type="priority" />
                  </div>
                </button>

                {/* Tags */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveField(null)
                    setActivePropertySheet("tags")
                  }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-95 hover:bg-slate-50"
                  title={`Tags: ${
                    selectedTags.length ? selectedTags.join(", ") : "None"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center ${
                      selectedTags.length
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    <PropertyGlyph type="tags" />
                  </div>
                  {selectedTags.length > 0 && (
                    <span className="absolute top-0 right-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-emerald-600 px-0.5 text-[8.5px] font-bold text-white">
                      {selectedTags.length}
                    </span>
                  )}
                </button>

                {/* Files */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveField(null)
                    setActivePropertySheet("attachments")
                  }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-95 hover:bg-slate-50"
                  title={`Files: ${
                    attachedPhotos.length
                      ? attachedPhotos.length + " attached"
                      : "None"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center ${
                      attachedPhotos.length ? "text-sky-600" : "text-slate-500"
                    }`}
                  >
                    <PropertyGlyph type="attachments" />
                  </div>
                  {attachedPhotos.length > 0 && (
                    <span className="absolute top-0 right-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-sky-600 px-0.5 text-[8.5px] font-bold text-white">
                      {attachedPhotos.length}
                    </span>
                  )}
                </button>

                {/* Normal Create Button */}
                <span className="flex-1" />
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!canSubmit || isCreated || isExiting}
                    className={
                      "relative overflow-hidden flex h-8 items-center justify-center rounded-full px-4 text-[12.5px] font-semibold transition-all duration-300 active:scale-95 " +
                      (isCreated
                        ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_0_22px_rgba(16,185,129,0.7)] scale-105"
                        : canSubmit
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          : "cursor-not-allowed bg-slate-100 text-slate-400")
                    }
                  >
                    {isCreated ? (
                      <span className="flex items-center gap-1.5 animate-scale-in">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Created!</span>
                      </span>
                    ) : (
                      <span>Create</span>
                    )}
                  </button>

                  {/* Vibe celebration sparkles around button */}
                  {isCreated && (
                    <>
                      <span className="pointer-events-none absolute -top-3 -left-3 text-[14px] text-amber-400 animate-vibe-sparkle-1">
                        ✨
                      </span>
                      <span className="pointer-events-none absolute -top-4 right-1 text-[13px] text-emerald-400 animate-vibe-sparkle-2">
                        ✦
                      </span>
                      <span className="pointer-events-none absolute -bottom-3 left-2 text-[12px] text-sky-400 animate-vibe-sparkle-3">
                        🎉
                      </span>
                      <span className="pointer-events-none absolute -bottom-3 -right-2 text-[13px] text-purple-400 animate-vibe-sparkle-4">
                        ⭐
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Mobile Keyboard when typing */}
      {activePropertySheet === null && activeField !== null && (
        <div
          className={`relative z-20 w-full shrink-0 transition-transform duration-300 ease-in ${
            isExiting ? "translate-y-[115%]" : "animate-slide-up"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <CustomKeyboard
            type="alpha"
            actionLabel="Done"
            onKeyPress={(char) => {
              if (activeField === "title") {
                setTitle((prev) => prev + char)
              } else if (activeField === "description") {
                setDescription((prev) => prev + char)
              }
            }}
            onBackspace={() => {
              if (activeField === "title") {
                setTitle((prev) => prev.slice(0, -1))
              } else if (activeField === "description") {
                setDescription((prev) => prev.slice(0, -1))
              }
            }}
            onSubmit={() => setActiveField(null)}
          />
        </div>
      )}

      {activePropertySheet !== null && (
        <section
          className={
            "relative z-10 flex w-full flex-col overflow-hidden rounded-t-[28px] border-t border-slate-200 bg-white shadow-[0_-12px_32px_rgba(15,23,42,0.18)] transition-all duration-380 ease-[cubic-bezier(0.32,1,0.23,1)] " +
            (isExiting ? "translate-y-[115%]" : "animate-slide-up") +
            " " +
            (activePropertySheet === "attachments"
              ? "max-h-[86%] min-h-[460px]"
              : activePropertySheet === "date"
                ? "max-h-[70%] min-h-[340px]"
                : activePropertySheet === "assignee" && isAssigneeSearchFocused
                  ? "max-h-[50%] min-h-[260px]"
                  : "max-h-[65%] min-h-[300px]")
          }
          onClick={(event) => event.stopPropagation()}
        >
          <header className="shrink-0 border-b border-slate-200 px-4 pb-3 pt-2.5">
            <div
              className="mx-auto mb-2.5 h-1 w-9 rounded-full bg-slate-200"
              aria-hidden="true"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePropertySheet(null)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-600 hover:bg-slate-100"
                aria-label="Back to create form"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-semibold text-slate-950">
                  {propertySheetMeta[activePropertySheet].title}
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {propertySheetMeta[activePropertySheet].hint}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePropertySheet(null)}
                className="h-11 rounded-xl px-3 text-[12px] font-semibold text-blue-700 hover:bg-blue-50"
              >
                Done
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-2">
            {activePropertySheet === "type" && (
              <div className="divide-y divide-slate-100">
                {itemTypeOptions.map((option) => (
                  <button
                    type="button"
                    key={option.type}
                    onClick={() => {
                      setSelectedType(option.type)
                      setActivePropertySheet(null)
                    }}
                    className="flex w-full items-center gap-3.5 py-3 px-2 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 rounded-xl"
                  >
                    <span
                      className={
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl " +
                        option.bg
                      }
                    >
                      {getTypeIcon(option.type)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={
                          "block text-[14px] " +
                          (selectedType === option.type
                            ? "font-bold text-slate-950"
                            : "font-semibold text-slate-800")
                        }
                      >
                        {option.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11.5px] text-slate-400">
                        {option.desc}
                      </span>
                    </span>
                    {selectedType === option.type && <CheckIcon />}
                  </button>
                ))}
              </div>
            )}

            {activePropertySheet === "status" && (
              <div className="divide-y divide-slate-100">
                {statuses.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      setStatus(option.value)
                      setActivePropertySheet(null)
                    }}
                    className="flex w-full items-center gap-3.5 py-3.5 px-2 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 rounded-xl"
                  >
                    <span className={"h-3 w-3 rounded-full " + option.bg} />
                    <span
                      className={
                        "flex-1 text-[14px] " +
                        (status === option.value
                          ? "font-bold text-slate-950"
                          : "font-medium text-slate-700")
                      }
                    >
                      {option.label}
                    </span>
                    {status === option.value && <CheckIcon />}
                  </button>
                ))}
              </div>
            )}

            {activePropertySheet === "priority" && (
              <div className="divide-y divide-slate-100">
                {priorities.map((option, index) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      setPriorityIndex(index)
                      setActivePropertySheet(null)
                    }}
                    className="flex w-full items-center gap-3.5 py-3.5 px-2 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 rounded-xl"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center"
                      style={{ color: option.color }}
                    >
                      <PropertyGlyph type="priority" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={
                          "block text-[14px] " +
                          (priority.value === option.value
                            ? "font-bold text-slate-950"
                            : "font-medium text-slate-700")
                        }
                      >
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] text-slate-400">
                        {option.value === "HIGH"
                          ? "Needs immediate attention"
                          : option.value === "MEDIUM"
                            ? "Normal delivery priority"
                            : "Can be planned flexibly"}
                      </span>
                    </span>
                    {priority.value === option.value && <CheckIcon />}
                  </button>
                ))}
              </div>
            )}

            {activePropertySheet === "assignee" && (
              <div>
                {/* Searchbar on top */}
                <div className="mb-2.5 px-0.5">
                  <div
                    className={`flex h-10 w-full items-center gap-2.5 rounded-xl bg-slate-100 px-3 transition-all ${
                      isAssigneeSearchFocused
                        ? "border border-blue-500 bg-white ring-2 ring-blue-500/20"
                        : "border border-transparent hover:bg-slate-200/60"
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-slate-400"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      value={assigneeSearchQuery}
                      onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                      onFocus={() => setIsAssigneeSearchFocused(true)}
                      placeholder="Search team members..."
                      className="h-full flex-1 bg-transparent text-[13.5px] text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    {assigneeSearchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setAssigneeSearchQuery("")
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 active:scale-95"
                        aria-label="Clear search"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => {
                    const selected = selectedAssignees.includes(member.id)
                    return (
                      <button
                        type="button"
                        key={member.id}
                        onClick={() => {
                          toggleAssignee(member.id)
                          setActivePropertySheet(null)
                          setIsAssigneeSearchFocused(false)
                        }}
                        className="flex w-full items-center gap-3.5 py-3 px-2 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 rounded-xl"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.initials}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={
                              "block text-[14px] " +
                              (selected
                                ? "font-bold text-slate-950"
                                : "font-semibold text-slate-800")
                            }
                          >
                            {member.name}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] text-slate-400">
                            {member.role}
                          </span>
                        </span>
                        {selected && <CheckIcon />}
                      </button>
                    )
                  })}
                  {filteredMembers.length === 0 && (
                    <div className="py-8 text-center text-[13px] text-slate-400">
                      No team members match "{assigneeSearchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePropertySheet === "date" && (
              <div
                className="space-y-3 pb-2"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                <Calendar
                  value={dueDate || undefined}
                  onChange={(selection) => {
                    setDueDate(selection.start)
                    // Day picks read fine from the ISO date; week and month
                    // picks need their own wording carried through.
                    setDueDateLabelCustom(
                      selection.mode === "day" ? "" : selection.label,
                    )
                  }}
                  mode={calendarTab === "date" ? "day" : calendarTab}
                  onModeChange={(next) =>
                    setCalendarTab(next === "day" ? "date" : next)
                  }
                  accent="#0055ff"
                />

                {/* Clear Option */}
                {dueDate && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate("")
                        setDueDateLabelCustom("")
                        setActivePropertySheet(null)
                      }}
                      className="text-[11.5px] font-semibold text-red-500 hover:text-red-600 active:scale-95"
                    >
                      Clear due date
                    </button>
                  </div>
                )}
              </div>
            )}

            {activePropertySheet === "tags" && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <PropertyGlyph type="tags" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900">Tags</h3>
                <span className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11.5px] font-semibold text-blue-600">
                  Coming soon
                </span>
                <p className="mt-2.5 max-w-xs text-[12px] leading-relaxed text-slate-400">
                  Custom tags and classifications will be available in an
                  upcoming update.
                </p>
              </div>
            )}

            {activePropertySheet === "attachments" && (
              <div>
                {/* WhatsApp-style Action Buttons on Top: Camera, Gallery, Video, Document */}
                <div className="mb-5 grid grid-cols-4 gap-2 pt-1">
                  {/* Camera */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 py-1 transition-transform active:scale-95"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.28)]">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                    </div>
                    <span className="text-[11.5px] font-medium text-slate-700">
                      Camera
                    </span>
                  </button>

                  {/* Gallery */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 py-1 transition-transform active:scale-95"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.28)]">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="18"
                          height="18"
                          x="3"
                          y="3"
                          rx="2"
                          ry="2"
                        />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                    <span className="text-[11.5px] font-medium text-slate-700">
                      Gallery
                    </span>
                  </button>

                  {/* Video */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 py-1 transition-transform active:scale-95"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.28)]">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m22 8-6 4 6 4V8Z" />
                        <rect
                          width="14"
                          height="12"
                          x="2"
                          y="6"
                          rx="2"
                          ry="2"
                        />
                      </svg>
                    </div>
                    <span className="text-[11.5px] font-medium text-slate-700">
                      Video
                    </span>
                  </button>

                  {/* Document / Files */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 py-1 transition-transform active:scale-95"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-sky-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.28)]">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        <path d="M10 9H8" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                      </svg>
                    </div>
                    <span className="text-[11.5px] font-medium text-slate-700">
                      Files
                    </span>
                  </button>
                </div>

                {/* Below: Phone Gallery Grid (WhatsApp style) */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="mb-2.5 flex items-center justify-between px-0.5">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-700">
                      Recent Media
                    </span>
                    {attachedPhotos.length > 0 && (
                      <span className="text-[11.5px] font-semibold text-blue-600">
                        {attachedPhotos.length} selected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {GALLERY_PHOTOS.map((item, idx) => {
                      const isSelected = attachedPhotos.includes(item.url)
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => togglePhotoAttachment(item.url)}
                          className={
                            "relative aspect-square overflow-hidden rounded-xl bg-slate-100 transition-all active:scale-95 " +
                            (isSelected
                              ? "ring-3 ring-blue-600 ring-offset-2"
                              : "hover:opacity-95")
                          }
                        >
                          <img
                            src={item.url}
                            alt={`Gallery ${idx + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-start justify-end bg-blue-600/20 p-1.5">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {attachedPhotos.length > 0 && (
                    <div className="sticky bottom-0 mt-3 bg-white pt-2">
                      <button
                        type="button"
                        onClick={() => setActivePropertySheet(null)}
                        className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(0,85,255,0.3)] transition-all hover:bg-blue-700 active:scale-98"
                      >
                        Attach {attachedPhotos.length} Media Item
                        {attachedPhotos.length > 1 ? "s" : ""}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Interactive Keyboard from bottom when assignee search is active */}
      {activePropertySheet === "assignee" && isAssigneeSearchFocused && (
        <div
          className="relative z-20 w-full shrink-0 animate-slide-up"
          onClick={(event) => event.stopPropagation()}
        >
          <CustomKeyboard
            type="alpha"
            actionLabel="Done"
            onKeyPress={(char) => {
              setAssigneeSearchQuery((prev) => prev + char)
            }}
            onBackspace={() => {
              setAssigneeSearchQuery((prev) => prev.slice(0, -1))
            }}
            onSubmit={() => setIsAssigneeSearchFocused(false)}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
    </div>
  )
}
