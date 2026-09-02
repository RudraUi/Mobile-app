import { useRef, useState } from "react"
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react"
import type { Assignee, Item, Severity, Status } from "../data/mockData"

interface TaskDetailScreenProps {
  item: Item
  onBack: () => void
  onNavigate: (item: Item) => void
  onUpdate: (id: string, changes: Partial<Item>) => void
}

type TaskTab = "details" | "activity" | "attachments" | "subtasks" | "dependencies" | "linked" | "approval"

type IconName = "approval" | "arrow-left" | "calendar" | "camera" | "check" | "chevron-right" | "clock" | "close" | "description" | "eye" | "file" | "image" | "link" | "map" | "message" | "more" | "paperclip" | "plus" | "priority" | "progress" | "search" | "send" | "share" | "sliders" | "status" | "subtasks" | "tag" | "task" | "timer" | "users"

interface Subtask {
  id: string
  title: string
  done: boolean
  assignees: Assignee[]
}

interface Dependency {
  id: string
  title: string
  relation: string
  direction: "waiting" | "blocking"
}

interface LinkedRecord {
  id: string
  title: string
  kind: "Issue" | "RFI" | "Field Note"
  status: string
  priority: Severity
}

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

const statusOrder: Status[] = [
  "TO DO",
  "IN PROGRESS",
  "REVIEW",
  "BLOCKED",
  "COMPLETED",
]

const priorityOrder: Severity[] = ["LOW", "MEDIUM", "HIGH"]

const statusStyles: Record<Status, string> = {
  "TO DO": "border-slate-200 bg-slate-100 text-slate-700",
  "IN PROGRESS": "border-blue-200 bg-blue-50 text-blue-700",
  REVIEW: "border-violet-200 bg-violet-50 text-violet-700",
  BLOCKED: "border-red-200 bg-red-50 text-red-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
}

const priorityStyles: Record<Severity, { className: string; dot: string }> = {
  LOW: {
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "#2563EB",
  },
  MEDIUM: {
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "#D97706",
  },
  HIGH: { className: "border-red-200 bg-red-50 text-red-700", dot: "#DC2626" },
}

const linkCandidates: LinkedRecord[] = [
  {
    id: "ISSUE-018",
    title: "Structural column clash with main drainage riser",
    kind: "Issue",
    status: "OPEN",
    priority: "HIGH",
  },
  {
    id: "ISSUE-017",
    title: "Fire damper inspection clearance insufficient",
    kind: "Issue",
    status: "IN PROGRESS",
    priority: "HIGH",
  },
  {
    id: "RFI-164",
    title: "Rebar clearance clarification at shear wall",
    kind: "RFI",
    status: "OPEN",
    priority: "MEDIUM",
  },
  {
    id: "FN-023",
    title: "Grid B4 reinforcement inspection notes",
    kind: "Field Note",
    status: "OPEN",
    priority: "LOW",
  },
]

function Icon({ name, size = 16, className }: IconProps) {
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
    case "arrow-left":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      )
    case "timer":
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="7.5" />
          <path d="M9 2h6M12 5.5V2M17.5 7.5l1.8-1.8M12 9.5V13l2.8 1.6" />
        </svg>
      )
    case "share":
      return (
        <svg {...common}>
          <path d="M12 15V3M8 7l4-4 4 4M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
        </svg>
      )
    case "more":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      )
    case "task":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <path d="m7.5 12 3 3 6-6.5" />
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
        <svg {...common}>
          <path d="M6 21V4c5-3 7.5 3 12 0v9c-4.5 3-7-3-12 0" />
        </svg>
      )
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M15 6.5a2.5 2.5 0 0 1 0 5M16 14c2.6.4 4 2 4.4 5" />
        </svg>
      )
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M7 3v4M17 3v4M3 10h18" />
        </svg>
      )
    case "progress":
      return (
        <svg {...common}>
          <path d="M4 17a8 8 0 1 1 16 0" />
          <path d="m12 13 4-4" />
          <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )
    case "tag":
      return (
        <svg {...common}>
          <path d="m3 13 10-10h7v7L10 20a2.5 2.5 0 0 1-3.5 0L3 16.5A2.5 2.5 0 0 1 3 13Z" />
          <circle cx="16.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case "sliders":
      return (
        <svg {...common}>
          <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="8" cy="17" r="2" />
        </svg>
      )
    case "map":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    case "description":
      return (
        <svg {...common}>
          <path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h6" />
        </svg>
      )
    case "camera":
      return (
        <svg {...common}>
          <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      )
    case "paperclip":
      return (
        <svg {...common}>
          <path d="m8.5 12.5 6-6a3.2 3.2 0 1 1 4.5 4.5l-8.5 8.5a5 5 0 0 1-7-7l9-9" />
        </svg>
      )
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case "subtasks":
      return (
        <svg {...common}>
          <path d="m4 7 2 2 3-4M12 7h8M4 15l2 2 3-4M12 15h8" />
        </svg>
      )
    case "link":
      return (
        <svg {...common}>
          <path d="m10 13.5 4-4M7.5 16H6a4 4 0 0 1 0-8h4M16.5 8H18a4 4 0 0 1 0 8h-4" />
        </svg>
      )
    case "approval":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.5 2.7 8.3 7 10 4.3-1.7 7-5.5 7-10V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    case "message":
      return (
        <svg {...common}>
          <path d="M4 4h16v12H8l-4 4z" />
        </svg>
      )
    case "send":
      return (
        <svg {...common}>
          <path d="m3 11 18-8-8 18-2-8zM11 13l10-10" />
        </svg>
      )
    case "file":
      return (
        <svg {...common}>
          <path d="M6 2h8l4 4v16H6zM14 2v5h4M9 12h6M9 16h6" />
        </svg>
      )
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="9" cy="10" r="2" />
          <path d="m5 18 5-5 3 3 2-2 4 4" />
        </svg>
      )
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      )
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )
    case "chevron-right":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      )
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      )
    default:
      return null
  }
}

function DeviceStatusBar() {
  return (
    <div
      className="relative h-[46px] shrink-0 bg-white text-slate-900"
      aria-hidden="true"
    >
      <span className="absolute left-6 top-[14px] text-[15px] font-semibold leading-none">
        9:41
      </span>
      <div className="absolute right-5 top-[13px] flex items-center gap-1.5">
        <span className="flex h-3 items-end gap-[1.5px]">
          <span className="h-1 w-0.5 rounded-full bg-current" />
          <span className="h-1.5 w-0.5 rounded-full bg-current" />
          <span className="h-2 w-0.5 rounded-full bg-current" />
          <span className="h-2.5 w-0.5 rounded-full bg-current" />
        </span>
        <svg width="15" height="12" viewBox="0 0 18 14" fill="none">
          <path
            d="M1.5 5a11.5 11.5 0 0 1 15 0M4.5 8a7.2 7.2 0 0 1 9 0M7.5 11a2.5 2.5 0 0 1 3 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <svg width="22" height="12" viewBox="0 0 26 13" fill="none">
          <rect
            x=".75"
            y=".75"
            width="21.5"
            height="11.5"
            rx="3"
            stroke="currentColor"
            strokeOpacity=".65"
            strokeWidth="1.5"
          />
          <rect
            x="2.8"
            y="2.8"
            width="16.8"
            height="7.4"
            rx="1.5"
            fill="currentColor"
          />
          <path
            d="M24 4.3v4.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

function IconButton({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: IconName
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600 active:bg-slate-200"
      aria-label={label}
    >
      <Icon name={icon} size={19} />
    </button>
  )
}

function AvatarStack({
  assignees,
  limit = 3,
}: {
  assignees: Assignee[]
  limit?: number
}) {
  if (assignees.length === 0)
    return <span className="text-[13px] text-slate-400">Unassigned</span>

  return (
    <span className="flex items-center">
      {assignees.slice(0, limit).map((assignee, index) => (
        <span
          key={assignee.id}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
          style={{
            backgroundColor: assignee.color,
            marginLeft: index === 0 ? 0 : -6,
          }}
          title={assignee.name}
        >
          {assignee.initials}
        </span>
      ))}
      {assignees.length > limit && (
        <span className="ml-1 text-[11px] font-semibold text-slate-500">
          +{assignees.length - limit}
        </span>
      )}
    </span>
  )
}

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[14px] font-bold leading-[18px] text-slate-900">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[12px] leading-4 text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

function PropertyRow({
  icon,
  label,
  children,
  last = false,
}: {
  icon: IconName
  label: string
  children: ReactNode
  last?: boolean
}) {
  return (
    <div
      className={`flex min-h-12 items-center gap-3 py-2.5 ${
        last ? "" : "border-b border-slate-100"
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon name={icon} size={16} />
      </span>
      <span className="w-[72px] shrink-0 text-[12px] font-medium text-slate-500">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-[13px] font-medium leading-[18px] text-slate-800">
        {children}
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        <Icon name={icon} size={20} />
      </span>
      <h3 className="mt-3 text-[14px] font-bold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-[260px] text-[12px] leading-[17px] text-slate-500">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="ml-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-bold text-slate-500">
      {count}
    </span>
  )
}

function formatDate(date: string) {
  if (!date) return "No date set"
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function TaskDetailScreen({
  item,
  onBack,
  onNavigate,
  onUpdate,
}: TaskDetailScreenProps) {
  const [tab, setTab] = useState<TaskTab>("details")
  const [comment, setComment] = useState("")
  const [description, setDescription] = useState(item.description)
  const [photos, setPhotos] = useState(item.photos)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [attachmentFilter, setAttachmentFilter] = useState("Images")
  const [subtaskDraft, setSubtaskDraft] = useState("")
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    {
      id: `${item.id}-subtask-1`,
      title: "Take a clear cover photo of the completed work",
      done: item.status === "COMPLETED" || item.status === "APPROVED",
      assignees: item.assignees.slice(0, 2),
    },
    {
      id: `${item.id}-subtask-2`,
      title: "File the inspection sheet in the project folder",
      done: false,
      assignees: item.assignees.slice(1, 3),
    },
  ])
  const [dependencies, setDependencies] = useState<Dependency[]>([
    {
      id: "TASK-003",
      title: "Review electrical shop drawing",
      relation: "Finish to Start",
      direction: "blocking",
    },
  ])
  const [dependencyStep, setDependencyStep] = useState(0)
  const [dependencyRelation, setDependencyRelation] =
    useState("Finish to Start")
  const [dependencyTarget, setDependencyTarget] = useState(
    "TASK-003 · Review electrical shop drawing",
  )
  const [dependencySearch, setDependencySearch] = useState("")
  const [dependencyGaps, setDependencyGaps] = useState({
    wait: "0",
    safety: "0",
    free: "0",
  })
  const [dependencyBlocksTask, setDependencyBlocksTask] = useState(false)
  const [linkedKind, setLinkedKind] = useState<LinkedRecord["kind"]>("Issue")
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false)
  const [linkedRecords, setLinkedRecords] = useState<LinkedRecord[]>(
    item.id === "TASK-001" ? [linkCandidates[0]] : [],
  )
  const [approvalState, setApprovalState] =
    useState<"draft" | "requested" | "approved">(
      item.status === "APPROVED" ||
        item.activity.some((entry) => entry.text.toLowerCase().includes("approved"))
        ? "approved"
        : "draft",
    )
  const [approvalNote, setApprovalNote] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tabButtonRefs = useRef<Partial<Record<TaskTab, HTMLButtonElement | null>>>({})

  const priorityStyle = priorityStyles[item.severity]
  const completedSubtasks = subtasks.filter((subtask) => subtask.done).length
  const subtaskProgress = subtasks.length
    ? Math.round((completedSubtasks / subtasks.length) * 100)
    : 0
  const filteredLinkCandidates = linkCandidates.filter(
    (candidate) => candidate.kind === linkedKind,
  )
  const dependencyCandidates = [
    "TASK-003 · Review electrical shop drawing",
    "TASK-004 · Resolve ceiling coordination clash",
    "TASK-005 · Approve concrete mix design",
    "TASK-006 · Procure supply air grilles",
  ].filter((candidate) =>
    candidate.toLowerCase().includes(dependencySearch.trim().toLowerCase()),
  )

  const tabs: Array<{ id: TaskTab; label: string; count?: number }> = [
    { id: "details", label: "Details" },
    { id: "activity", label: "Activity", count: item.activity.length },
    { id: "attachments", label: "Attachments", count: photos.length },
    { id: "subtasks", label: "Subtasks", count: subtasks.length },
    { id: "dependencies", label: "Dependencies", count: dependencies.length },
    { id: "linked", label: "Linked issues", count: linkedRecords.length },
    { id: "approval", label: "Approval" },
  ]

  const cycleStatus = () => {
    if (approvalState === "approved") return
    const currentIndex = statusOrder.indexOf(item.status)
    const nextIndex =
      currentIndex < 0 ? 0 : (currentIndex + 1) % statusOrder.length
    onUpdate(item.id, { status: statusOrder[nextIndex] })
  }

  const cyclePriority = () => {
    const currentIndex = priorityOrder.indexOf(item.severity)
    onUpdate(item.id, {
      severity: priorityOrder[(currentIndex + 1) % priorityOrder.length],
    })
  }

  const saveDescription = () => {
    if (description !== item.description) onUpdate(item.id, { description })
  }

  const addPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const nextPhotos = [URL.createObjectURL(file), ...photos]
    setPhotos(nextPhotos)
    onUpdate(item.id, { photos: nextPhotos })
    event.target.value = ""
  }

  const addComment = () => {
    const value = comment.trim()
    if (!value) return
    onUpdate(item.id, {
      activity: [
        ...item.activity,
        {
          id: `comment-${Date.now()}`,
          text: value,
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        },
      ],
    })
    setComment("")
  }

  const recordApprovalAction = (text: string, status?: Status) => {
    onUpdate(item.id, {
      ...(status ? { status } : {}),
      activity: [
        ...item.activity,
        {
          id: `approval-${Date.now()}`,
          text,
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        },
      ],
    })
  }

  const handleCommentKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") addComment()
  }

  const addSubtask = () => {
    const value = subtaskDraft.trim()
    if (!value) return
    setSubtasks((current) => [
      ...current,
      {
        id: `subtask-${Date.now()}`,
        title: value,
        done: false,
        assignees: item.assignees.slice(0, 1),
      },
    ])
    setSubtaskDraft("")
  }

  const addDependency = () => {
    const targetTitle = dependencyTarget.split(" · ")[1] || dependencyTarget
    setDependencies((current) => [
      ...current,
      {
        id: `TASK-${String(current.length + 4).padStart(3, "0")}`,
        title: targetTitle,
        relation: dependencyRelation,
        direction: dependencyBlocksTask ? "blocking" : "waiting",
      },
    ])
    setDependencySearch("")
    setDependencyGaps({ wait: "0", safety: "0", free: "0" })
    setDependencyBlocksTask(false)
    setDependencyStep(0)
  }

  const selectTab = (nextTab: TaskTab) => {
    setTab(nextTab)
    window.requestAnimationFrame(() => {
      tabButtonRefs.current[nextTab]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    })
  }

  const linkRecord = (record: LinkedRecord) => {
    setLinkedRecords((current) =>
      current.some((entry) => entry.id === record.id)
        ? current
        : [...current, record],
    )
    setIsLinkPickerOpen(false)
  }

  const renderDetails = () => (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] px-4 pb-6 pt-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center gap-2 text-[12px] leading-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-bold text-white">
            S
          </span>
          <span className="font-semibold text-slate-800">Stalwart</span>
          <span className="text-slate-300">/</span>
          <span className="flex items-center gap-1.5 font-semibold text-blue-600">
            <Icon name="task" size={14} />
            {item.id}
          </span>
          {item.tags?.includes("Milestone") && (
            <span className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
              Milestone
            </span>
          )}
        </div>

        <h1 className="mt-3 text-[18px] font-bold leading-[23px] tracking-[-0.2px] text-slate-950">
          {item.title}
        </h1>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={cycleStatus}
            disabled={approvalState === "approved"}
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold transition-transform active:scale-95 disabled:cursor-default ${statusStyles[item.status]}`}
          >
            <Icon name="status" size={14} />
            {item.status}
          </button>
          <button
            type="button"
            onClick={cyclePriority}
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold transition-transform active:scale-95 ${priorityStyle.className}`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: priorityStyle.dot }}
            />
            {item.severity} priority
          </button>
          <span className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-700">
            <Icon name="users" size={14} />
            {item.assignees.length || 0} assignee
            {item.assignees.length === 1 ? "" : "s"}
          </span>
          <span className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-700">
            <Icon name="calendar" size={14} />
            {formatDate(item.dueDate)}
          </span>
        </div>
      </section>

      {photos.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            setActivePhotoIndex(0)
            setIsPreviewOpen(true)
          }}
          className="group relative mt-3 block h-[170px] w-full overflow-hidden rounded-2xl bg-slate-200 text-left"
        >
          <img
            src={photos[0]}
            alt="Task attachment preview"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
          <span className="absolute bottom-3 left-3 rounded-lg bg-slate-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            Photo 1 of {photos.length}
          </span>
          <span className="absolute bottom-3 right-3 rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-900 shadow-sm">
            Open gallery
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 flex h-16 w-full items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 text-left text-slate-600"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon name="camera" size={16} />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-slate-800">
              Add a task photo
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              Document the current site condition
            </span>
          </span>
        </button>
      )}

      <section className="mt-3 rounded-2xl border border-slate-200/80 bg-white p-4">
        <SectionHeading title="Description" />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          onBlur={saveDescription}
          rows={3}
          placeholder="Add the scope, method statement, or acceptance criteria..."
          className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[14px] font-normal leading-5 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
        />
      </section>

      <section className="mt-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
        <SectionHeading
          title="Task information"
          subtitle="The fields used for planning, ownership, and sign-off."
        />
        <div className="mt-2">
          <PropertyRow icon="users" label="Assignee">
            <div className="flex items-center gap-2">
              <AvatarStack assignees={item.assignees} />
              <span className="truncate">
                {item.assignees.map((assignee) => assignee.name).join(", ") ||
                  "Unassigned"}
              </span>
            </div>
          </PropertyRow>
          <PropertyRow icon="approval" label="Approver">
            <div className="flex items-center justify-between gap-2">
              <span>Robert Miller</span>
              {approvalState === "approved" && (
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                  APPROVED
                </span>
              )}
            </div>
          </PropertyRow>
          <PropertyRow icon="calendar" label="Dates">
            <span>{formatDate(item.dueDate)}</span>
          </PropertyRow>
          <PropertyRow icon="progress" label="Progress">
            <div className="flex items-center gap-3">
              <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-blue-600"
                  style={{ width: `${item.progress ?? 0}%` }}
                />
              </span>
              <span className="w-8 text-right text-[11px] font-bold text-slate-700">
                {item.progress ?? 0}%
              </span>
            </div>
          </PropertyRow>
          <PropertyRow icon="eye" label="Watchers">
            <div className="flex items-center gap-2">
              <AvatarStack assignees={item.assignees} limit={4} />
              <span>{Math.max(item.assignees.length + 3, 4)} watching</span>
            </div>
          </PropertyRow>
          <PropertyRow icon="tag" label="Tags">
            <div className="flex flex-wrap gap-1.5">
              {item.tags?.length ? (
                item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">No tags</span>
              )}
            </div>
          </PropertyRow>
          <PropertyRow icon="sliders" label="Schedule">
            <span>Buffers, float &amp; actual dates</span>
          </PropertyRow>
          <PropertyRow icon="map" label="Location" last>
            <span>{item.location.label}</span>
          </PropertyRow>
        </div>
      </section>

      {approvalState === "approved" && (
        <button
          type="button"
          onClick={() => selectTab("approval")}
          className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Icon name="check" size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-bold text-emerald-800">
              Approved by John Doe
            </span>
            <span className="mt-0.5 block text-[11px] text-emerald-700">
              14 Aug 2026 · Final sign-off complete
            </span>
          </span>
          <Icon name="chevron-right" size={16} className="text-emerald-700" />
        </button>
      )}
    </div>
  )

  const renderActivity = () => (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F7F9FC]">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <SectionHeading
          title="Activity"
          subtitle="A complete history of changes, comments, and approvals."
        />
        {item.activity.length > 0 ? (
          <div className="relative mt-4 space-y-3 before:absolute before:bottom-6 before:left-4 before:top-6 before:w-px before:bg-slate-200">
            {item.activity
              .slice()
              .reverse()
              .map((entry, index) => (
                <article
                  key={entry.id}
                  className="relative flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5"
                >
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-white">
                    <Icon name={index === 0 ? "message" : "clock"} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-[18px] text-slate-700">
                      <span className="font-semibold text-slate-900">
                        Anil Kumar Patra
                      </span>{" "}
                      {entry.text}
                    </p>
                    <time className="mt-1.5 block text-[11px] font-medium text-slate-400">
                      {entry.date}
                    </time>
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon="message"
              title="No activity yet"
              description="Comments, updates, and approvals for this task will appear here."
            />
          </div>
        )}
      </div>
      <div
        className="shrink-0 border-t border-slate-200 bg-white px-4 py-3"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white"
            aria-label="Add attachment"
          >
            <Icon name="paperclip" size={17} />
          </button>
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            onKeyDown={handleCommentKeyDown}
            placeholder="Write a comment..."
            className="min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={addComment}
            disabled={!comment.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-opacity disabled:opacity-35"
            aria-label="Send comment"
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  const renderAttachments = () => (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] px-4 pb-6 pt-4">
      <SectionHeading
        title="Attachments"
        subtitle="Photos, drawings, sheets, and task records in one place."
        action={
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-[12px] font-semibold text-white shadow-sm active:bg-blue-700"
          >
            <Icon name="plus" size={14} /> Upload
          </button>
        }
      />

      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
        {["All", "Images", "PDFs", "Sheets", "CAD"].map((filter) => (
          <button
            type="button"
            key={filter}
            onClick={() => setAttachmentFilter(filter)}
            className={`h-8 shrink-0 rounded-lg px-3 text-[11px] font-semibold transition-colors ${
              attachmentFilter === filter
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {filter}
            {filter === "Images" || filter === "All" ? ` ${photos.length}` : ""}
          </button>
        ))}
      </div>

      {(attachmentFilter === "All" || attachmentFilter === "Images") &&
      photos.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {photos.map((photo, index) => (
            <button
              type="button"
              key={photo}
              onClick={() => {
                setActivePhotoIndex(index)
                setIsPreviewOpen(true)
              }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left"
            >
              <img
                src={photo}
                alt={`Task attachment ${index + 1}`}
                className="h-28 w-full object-cover"
              />
              <span className="block truncate px-3 py-2.5 text-[12px] font-semibold text-slate-700">
                Site photo {index + 1}.jpg
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon={
              attachmentFilter === "Images" || attachmentFilter === "All"
                ? "image"
                : "file"
            }
            title={`No ${attachmentFilter.toLowerCase()} yet`}
            description="Upload evidence, drawings, or supporting files so the team has the full context."
            action={
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 rounded-xl bg-blue-600 px-4 text-[12px] font-semibold text-white"
              >
                Upload file
              </button>
            }
          />
        </div>
      )}
    </div>
  )

  const renderSubtasks = () => (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] px-4 pb-6 pt-4">
      <SectionHeading
        title="Subtasks"
        subtitle={`${subtasks.length - completedSubtasks} open · ${completedSubtasks} completed`}
      />
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>Overall progress</span>
          <span className="text-slate-700">{subtaskProgress}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${subtaskProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {subtasks.map((subtask, index) => (
          <div
            key={subtask.id}
            className={`flex items-start gap-3 p-3.5 ${
              index === subtasks.length - 1 ? "" : "border-b border-slate-100"
            }`}
          >
            <button
              type="button"
              onClick={() =>
                setSubtasks((current) =>
                  current.map((entry) =>
                    entry.id === subtask.id
                      ? { ...entry, done: !entry.done }
                      : entry,
                  ),
                )
              }
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                subtask.done
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-transparent"
              }`}
              aria-label={
                subtask.done
                  ? "Mark subtask incomplete"
                  : "Mark subtask complete"
              }
            >
              <Icon name="check" size={12} />
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={`text-[13px] font-medium leading-[18px] ${
                  subtask.done
                    ? "text-slate-400 line-through"
                    : "text-slate-800"
                }`}
              >
                {subtask.title}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <AvatarStack assignees={subtask.assignees} limit={2} />
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Icon name="calendar" size={13} /> No date
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pl-3">
        <Icon name="plus" size={16} className="shrink-0 text-blue-600" />
        <input
          value={subtaskDraft}
          onChange={(event) => setSubtaskDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addSubtask()
          }}
          placeholder="Add a subtask..."
          className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={addSubtask}
          disabled={!subtaskDraft.trim()}
          className="h-8 rounded-lg bg-blue-600 px-3 text-[11px] font-semibold text-white disabled:opacity-35"
        >
          Add
        </button>
      </div>
    </div>
  )

  const renderDependencies = () => {
    const blocking = dependencies.filter(
      (dependency) => dependency.direction === "blocking",
    )
    const waiting = dependencies.filter(
      (dependency) => dependency.direction === "waiting",
    )

    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] px-4 pb-6 pt-4">
        <SectionHeading
          title="Dependencies & blockers"
          subtitle="See what this task waits for and what it is holding up."
          action={
            <button
              type="button"
              onClick={() => setDependencyStep(1)}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-[12px] font-semibold text-white"
            >
              <Icon name="plus" size={14} /> Link
            </button>
          }
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700">
            {blocking.length} blocking
          </span>
          <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700">
            {waiting.length} waiting on
          </span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600">
            0 held up by this
          </span>
        </div>

        {dependencies.length > 0 ? (
          <div className="mt-4 space-y-4">
            {(["waiting", "blocking"] as const).map((direction) => {
              const entries = dependencies.filter(
                (dependency) => dependency.direction === direction,
              )
              if (!entries.length) return null
              return (
                <section key={direction}>
                  <h3 className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                    <Icon name="link" size={14} />
                    {direction === "waiting"
                      ? "This task waits for"
                      : "Blocking this task"}
                  </h3>
                  <div className="mt-2 space-y-2">
                    {entries.map((dependency) => (
                      <article
                        key={dependency.id}
                        className={`rounded-2xl border bg-white p-3.5 ${
                          direction === "blocking"
                            ? "border-red-100"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              direction === "blocking"
                                ? "bg-red-50 text-red-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            <Icon name="link" size={15} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-slate-900">
                              <span className="text-blue-600">
                                #{dependency.id}
                              </span>{" "}
                              · {dependency.title}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="rounded-md bg-slate-100 px-2 py-1 font-medium">
                                {dependency.relation}
                              </span>
                              <span>TASK</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setDependencies((current) =>
                                current.filter(
                                  (entry) => entry.id !== dependency.id,
                                ),
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50"
                            aria-label="Remove dependency"
                          >
                            <Icon name="close" size={14} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon="link"
              title="No dependencies"
              description="Link another task when this work depends on it or is blocking it."
              action={
                <button
                  type="button"
                  onClick={() => setDependencyStep(1)}
                  className="h-9 rounded-xl bg-blue-600 px-4 text-[12px] font-semibold text-white"
                >
                  Add dependency
                </button>
              }
            />
          </div>
        )}
      </div>
    )
  }

  const renderLinked = () => (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] px-4 pb-6 pt-4">
      <SectionHeading
        title="Linked records"
        subtitle="Connect issues, RFIs, and field notes resolved by this task."
        action={
          <button
            type="button"
            onClick={() => setIsLinkPickerOpen(true)}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 text-[12px] font-semibold text-blue-700"
          >
            <Icon name="link" size={14} /> Link record
          </button>
        }
      />
      <div className="mt-4 flex rounded-xl border border-slate-200 bg-white p-1">
        {(["Issue", "RFI", "Field Note"] as LinkedRecord["kind"][]).map(
          (kind) => (
            <button
              type="button"
              key={kind}
              onClick={() => setLinkedKind(kind)}
              className={`h-8 flex-1 rounded-lg text-[11px] font-semibold ${
                linkedKind === kind
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500"
              }`}
            >
              {kind}
            </button>
          ),
        )}
      </div>

      {linkedRecords.filter((record) => record.kind === linkedKind).length >
      0 ? (
        <div className="mt-3 space-y-2">
          {linkedRecords
            .filter((record) => record.kind === linkedKind)
            .map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase">
                      <span className="text-blue-600">#{record.id}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                        {record.kind}
                      </span>
                      <span className="rounded bg-blue-600 px-1.5 py-0.5 text-white">
                        {record.status}
                      </span>
                      <span className="text-amber-600">{record.priority}</span>
                    </div>
                    <h3 className="mt-2 text-[13px] font-semibold leading-[18px] text-slate-900">
                      {record.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">
                      Linked to this task for coordination and close-out
                      tracking.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setLinkedRecords((current) =>
                        current.filter((entry) => entry.id !== record.id),
                      )
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50"
                    aria-label="Unlink record"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              </article>
            ))}
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon="file"
            title={`No linked ${linkedKind.toLowerCase()} records`}
            description={`Link a ${linkedKind.toLowerCase()} when this task resolves or supports that record.`}
            action={
              <button
                type="button"
                onClick={() => setIsLinkPickerOpen(true)}
                className="h-9 rounded-xl bg-blue-600 px-4 text-[12px] font-semibold text-white"
              >
                Link {linkedKind}
              </button>
            }
          />
        </div>
      )}
    </div>
  )

  const renderApproval = () => (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] px-4 pb-6 pt-4">
      <SectionHeading
        title="Approval & sign-off"
        subtitle="Post the site return, then send this task to the approver."
        action={
          <span
            className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${
              approvalState === "approved"
                ? "bg-emerald-50 text-emerald-700"
                : approvalState === "requested"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {approvalState === "approved"
              ? "APPROVED"
              : approvalState === "requested"
                ? "IN REVIEW"
                : "NOT SUBMITTED"}
          </span>
        }
      />

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white">
            DS
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-900">
              Deependra Samal
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Project Manager · Approver
            </p>
          </div>
        </div>
      </div>

      {approvalState === "approved" ? (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Icon name="check" size={18} />
            </span>
            <div>
              <p className="text-[13px] font-bold text-emerald-900">
                Task approved and closed
              </p>
              <p className="mt-1 text-[12px] leading-[17px] text-emerald-700">
                Approved by John Doe on 14 Aug 2026. The final sign-off is
                recorded in the task activity.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> RETURN
              SNAPS
            </div>
            <p className="mt-2 text-[12px] leading-4 text-slate-500">
              Add a note and photo showing what was completed on site.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 flex h-11 w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-[12px] font-semibold text-slate-700"
            >
              <Icon name="camera" size={16} className="text-blue-600" /> Add
              return photo
            </button>
          </section>

          {approvalState === "requested" && (
            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-[12px] font-bold text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> SENT FOR
                SIGN-OFF
              </div>
              <p className="mt-2 text-[12px] leading-4 text-blue-700">
                Sent to Deependra Samal just now with {photos.length} supporting
                file{photos.length === 1 ? "" : "s"}.
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-[12px] font-bold text-slate-900">
              {approvalState === "requested"
                ? "Your decision"
                : "Ready for review?"}
            </h3>
            <textarea
              value={approvalNote}
              onChange={(event) => setApprovalNote(event.target.value)}
              rows={2}
              placeholder={
                approvalState === "requested"
                  ? "Add a decision note..."
                  : "Add a note for the approver..."
              }
              className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-[18px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-300"
            />
            {approvalState === "draft" ? (
              <button
                type="button"
                onClick={() => {
                  setApprovalState("requested")
                  recordApprovalAction(
                    approvalNote.trim()
                      ? `sent this task for approval: ${approvalNote.trim()}`
                      : "sent this task to Deependra Samal for approval",
                  )
                  setApprovalNote("")
                }}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-[13px] font-semibold text-white"
              >
                <Icon name="send" size={16} /> Send for approval
              </button>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setApprovalState("draft")
                    recordApprovalAction(
                      approvalNote.trim()
                        ? `sent this task back: ${approvalNote.trim()}`
                        : "sent this task back for changes",
                      "REVIEW",
                    )
                    setApprovalNote("")
                  }}
                  className="h-11 flex-1 rounded-xl border border-red-200 bg-red-50 text-[12px] font-semibold text-red-700"
                >
                  Send back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApprovalState("approved")
                    recordApprovalAction(
                      approvalNote.trim()
                        ? `approved and closed this task: ${approvalNote.trim()}`
                        : "approved and closed this task",
                      "APPROVED",
                    )
                    setApprovalNote("")
                  }}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-[12px] font-semibold text-white"
                >
                  <Icon name="check" size={15} /> Approve &amp; close
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )

  const renderCurrentTab = () => {
    switch (tab) {
      case "details":
        return renderDetails()
      case "activity":
        return renderActivity()
      case "attachments":
        return renderAttachments()
      case "subtasks":
        return renderSubtasks()
      case "dependencies":
        return renderDependencies()
      case "linked":
        return renderLinked()
      case "approval":
        return renderApproval()
    }
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white text-slate-800">
      <DeviceStatusBar />

      <header className="relative z-20 shrink-0 border-b border-slate-200 bg-white">
        <div className="flex h-12 items-center gap-1 px-3">
          <IconButton label="Back" icon="arrow-left" onClick={onBack} />
          <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Task details
            </p>
            <p className="truncate text-[14px] font-semibold leading-4 text-slate-900">
              {item.id}
            </p>
          </div>
          <IconButton
            label="Track time and navigate"
            icon="timer"
            onClick={() => onNavigate(item)}
          />
          <IconButton label="Share task" icon="share" />
          <IconButton label="More options" icon="more" />
        </div>

        <nav
          className="flex h-12 items-center gap-1 overflow-x-auto bg-slate-50 px-3"
          aria-label="Task detail sections"
          role="tablist"
        >
          {tabs.map((taskTab) => {
            const isActive = tab === taskTab.id
            return (
              <button
                type="button"
                key={taskTab.id}
                id={`task-tab-${taskTab.id}`}
                ref={(node) => {
                  tabButtonRefs.current[taskTab.id] = node
                }}
                onClick={() => selectTab(taskTab.id)}
                className={`flex h-11 shrink-0 items-center rounded-xl px-3 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? "border border-slate-200 bg-white text-slate-900 shadow-sm"
                    : "border border-transparent text-slate-500 hover:text-slate-800"
                }`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`task-panel-${taskTab.id}`}
              >
                {taskTab.label}
                {taskTab.count !== undefined && taskTab.count > 0 && (
                  <CountBadge count={taskTab.count} />
                )}
              </button>
            )
          })}
        </nav>
      </header>

      <div
        id={`task-panel-${tab}`}
        className="contents"
        role="tabpanel"
        aria-labelledby={`task-tab-${tab}`}
      >
        {renderCurrentTab()}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={addPhoto}
      />

      {isPreviewOpen && photos.length > 0 && (
        <div className="absolute inset-0 z-50 flex flex-col bg-slate-950/95 p-4 backdrop-blur-sm">
          <div className="flex h-11 shrink-0 items-center justify-between text-white">
            <span className="text-[12px] font-semibold">
              {activePhotoIndex + 1} of {photos.length}
            </span>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"
              aria-label="Close preview"
            >
              <Icon name="close" size={19} />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-7">
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActivePhotoIndex((current) =>
                    current === 0 ? photos.length - 1 : current - 1,
                  )
                }
                className="absolute left-0 z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm"
                aria-label="Previous attachment"
              >
                <Icon name="arrow-left" size={20} />
              </button>
            )}
            <img
              src={photos[activePhotoIndex]}
              alt={`Attachment preview ${activePhotoIndex + 1}`}
              className="max-h-full max-w-full rounded-2xl object-contain"
            />
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActivePhotoIndex((current) =>
                    current === photos.length - 1 ? 0 : current + 1,
                  )
                }
                className="absolute right-0 z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm"
                aria-label="Next attachment"
              >
                <Icon name="arrow-left" size={20} className="rotate-180" />
              </button>
            )}
          </div>
          <div className="flex h-16 shrink-0 items-center justify-center gap-2">
            {photos.map((photo, index) => (
              <button
                type="button"
                key={photo}
                onClick={() => setActivePhotoIndex(index)}
                className={`h-10 w-12 overflow-hidden rounded-lg border-2 ${
                  index === activePhotoIndex
                    ? "border-blue-500"
                    : "border-transparent opacity-60"
                }`}
                aria-label={`View attachment ${index + 1}`}
              >
                <img
                  src={photo}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {dependencyStep > 0 && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-slate-950/45"
          role="dialog"
          aria-modal="true"
          aria-label="Add task dependency"
        >
          <button
            type="button"
            onClick={() => setDependencyStep(0)}
            className="absolute inset-0"
            aria-label="Close dependency dialog"
          />
          <section className="relative z-10 flex max-h-[86%] min-h-[430px] w-full flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-16px_40px_rgba(15,23,42,0.18)]">
            <div className="flex flex-col items-center border-b border-slate-200 px-4 pb-3 pt-2">
              <span className="h-1 w-9 rounded-full bg-slate-300" />
              <div className="mt-2 flex w-full items-center gap-2">
                {dependencyStep > 1 ? (
                  <IconButton
                    label="Previous step"
                    icon="arrow-left"
                    onClick={() =>
                      setDependencyStep((step) => Math.max(1, step - 1))
                    }
                  />
                ) : (
                  <span className="h-10 w-10" />
                )}
                <div className="min-w-0 flex-1 text-center">
                  <h2 className="text-[14px] font-bold text-slate-900">
                    {dependencyStep === 1
                      ? "Choose the relationship"
                      : dependencyStep === 2
                        ? "Choose what to link"
                        : "Set the detail"}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Step {dependencyStep} of 3
                  </p>
                </div>
                <IconButton
                  label="Close"
                  icon="close"
                  onClick={() => setDependencyStep(0)}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {dependencyStep === 1 && (
                <div className="space-y-2">
                  {[
                    [
                      "Finish to Start",
                      "Work cannot start until the selected task finishes.",
                    ],
                    [
                      "Start to Start",
                      "Work starts at the same time as the selected task.",
                    ],
                    [
                      "Finish to Finish",
                      "Work finishes at the same time as the selected task.",
                    ],
                    [
                      "Start to Finish",
                      "Work finishes when the selected task starts.",
                    ],
                  ].map(([title, copy]) => (
                    <button
                      type="button"
                      key={title}
                      onClick={() => {
                        setDependencyRelation(title)
                        setDependencyStep(2)
                      }}
                      className={`flex min-h-[64px] w-full items-start gap-3 rounded-xl border p-3 text-left ${
                        dependencyRelation === title
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
                        <Icon name="link" size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-slate-900">
                          {title}
                        </span>
                        <span className="mt-1 block text-[12px] leading-4 text-slate-500">
                          {copy}
                        </span>
                      </span>
                      <Icon
                        name="chevron-right"
                        size={16}
                        className="mt-1 text-slate-400"
                      />
                    </button>
                  ))}
                </div>
              )}

              {dependencyStep === 2 && (
                <div>
                  <div className="flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-3">
                    <Icon name="search" size={16} className="text-slate-400" />
                  <input
                    value={dependencySearch}
                    onChange={(event) => setDependencySearch(event.target.value)}
                    placeholder="Search task number or name..."
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {dependencyCandidates.map((candidate, index) => (
                    <button
                        type="button"
                        key={candidate}
                        onClick={() => {
                          setDependencyTarget(candidate)
                          setDependencyStep(3)
                        }}
                        className={`flex min-h-12 w-full items-center gap-3 px-3 text-left ${
                          index === 3 ? "" : "border-b border-slate-100"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            index === 1
                              ? "bg-amber-500"
                              : index === 2
                                ? "bg-emerald-500"
                                : "bg-blue-600"
                          }`}
                        />
                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-800">
                          {candidate}
                        </span>
                        <Icon
                          name="chevron-right"
                          size={15}
                          className="text-slate-400"
                        />
                      </button>
                    ))}
                  {dependencyCandidates.length === 0 && (
                    <p className="px-4 py-8 text-center text-[12px] text-slate-500">
                      No matching tasks found.
                    </p>
                  )}
                </div>
                </div>
              )}

              {dependencyStep === 3 && (
                <div>
                  <div className="rounded-xl bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
                    {dependencyRelation} · {dependencyTarget}
                  </div>
                  <h3 className="mt-4 text-[14px] font-bold text-slate-900">
                    {dependencyTarget.split(" · ")[1]}
                  </h3>
                  <p className="mt-1 text-[12px] leading-4 text-slate-500">
                    Set the gap and whether this relationship actively blocks
                    work.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {(
                      [
                        ["Wait", "wait"],
                        ["Safety", "safety"],
                        ["Free", "free"],
                      ] as const
                    ).map(([label, key]) => (
                      <label
                        key={label}
                        className="text-[11px] font-semibold text-slate-500"
                      >
                        {label}
                        <input
                          type="number"
                          min="0"
                          value={dependencyGaps[key]}
                          onChange={(event) =>
                            setDependencyGaps((current) => ({
                              ...current,
                              [key]: event.target.value,
                            }))
                          }
                          className="mt-1 h-11 w-full rounded-xl bg-slate-100 px-3 text-[14px] font-semibold text-slate-900 outline-none"
                        />
                      </label>
                    ))}
                  </div>
                  <label className="mt-4 flex items-center gap-3 text-[13px] font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={dependencyBlocksTask}
                      onChange={(event) => setDependencyBlocksTask(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                    />{" "}
                    This blocks the task
                  </label>
                </div>
              )}
            </div>

            {dependencyStep === 3 && (
              <div
                className="shrink-0 border-t border-slate-200 p-4"
                style={{
                  paddingBottom: "max(16px, env(safe-area-inset-bottom))",
                }}
              >
                <button
                  type="button"
                  onClick={addDependency}
                  className="h-11 w-full rounded-xl bg-blue-600 text-[13px] font-semibold text-white"
                >
                  Add link
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {isLinkPickerOpen && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-slate-950/45"
          role="dialog"
          aria-modal="true"
          aria-label="Link a record"
        >
          <button
            type="button"
            onClick={() => setIsLinkPickerOpen(false)}
            className="absolute inset-0"
            aria-label="Close record picker"
          />
          <section className="relative z-10 flex max-h-[76%] min-h-[420px] w-full flex-col overflow-hidden rounded-t-[24px] bg-white">
            <div className="flex flex-col items-center border-b border-slate-200 px-4 pb-3 pt-2">
              <span className="h-1 w-9 rounded-full bg-slate-300" />
              <div className="mt-2 flex w-full items-center gap-2">
                <div className="min-w-0 flex-1">
                  <h2 className="text-[14px] font-bold text-slate-900">
                    Link an existing record
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Choose a {linkedKind.toLowerCase()} this task resolves.
                  </p>
                </div>
                <IconButton
                  label="Close"
                  icon="close"
                  onClick={() => setIsLinkPickerOpen(false)}
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-3">
                <Icon name="search" size={16} className="text-slate-400" />
                <input
                  placeholder={`Search ${linkedKind.toLowerCase()} records...`}
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="mt-3 space-y-2">
                {filteredLinkCandidates.length > 0 ? (
                  filteredLinkCandidates.map((candidate) => (
                    <button
                      type="button"
                      key={candidate.id}
                      onClick={() => linkRecord(candidate)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-left"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="text-blue-600">#{candidate.id}</span>
                        <span className="rounded bg-blue-600 px-1.5 py-0.5 text-white">
                          {candidate.status}
                        </span>
                        <span className="text-amber-600">
                          {candidate.priority}
                        </span>
                      </div>
                      <p className="mt-2 text-[13px] font-semibold leading-[18px] text-slate-900">
                        {candidate.title}
                      </p>
                    </button>
                  ))
                ) : (
                  <EmptyState
                    icon="file"
                    title={`No ${linkedKind.toLowerCase()} records found`}
                    description="Try another record type or create the record in its workspace first."
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
