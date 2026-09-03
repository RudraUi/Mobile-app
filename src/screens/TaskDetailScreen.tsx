import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react"
import { CustomKeyboard } from "../components/CustomKeyboard"
import type { Assignee, Item, Severity, Status } from "../data/mockData"
import { BackButton } from "../components/BackButton"
import { Calendar, type CalendarMode } from "../components/Calendar"

interface TaskDetailScreenProps {
  item: Item
  onBack: () => void
  onNavigate: (item: Item) => void
  onUpdate: (id: string, changes: Partial<Item>) => void
  onOpenCaptures?: () => void
}

type TaskTab = "details" | "activity" | "attachments" | "subtasks" | "dependencies" | "linked" | "approval" | "notes"

type IconName = "approval" | "arrow-left" | "arrow-right" | "ban" | "calendar" | "camera" | "check" | "check-circle" | "chevron-down" | "chevron-left" | "chevron-right" | "clock" | "close" | "compare" | "cube" | "description" | "download" | "drone" | "edit" | "eye" | "file" | "folder" | "gallery" | "grid" | "image" | "image-plus" | "layers" | "lines" | "link" | "list" | "map" | "marker" | "message" | "more" | "paperclip" | "pen" | "plus" | "priority" | "progress" | "return" | "search" | "send" | "share" | "sliders" | "status" | "subtasks" | "tag" | "task" | "timer" | "trash" | "upload" | "users" | "walk"

interface TodoNote {
  id: string
  text: string
  done: boolean
  createdAt: string
}

interface Subtask {
  id: string
  title: string
  done: boolean
  assignees: Assignee[]
  dueDate?: string
  parentId?: string | null
}

type DependencyRelation = "Finish to Start" | "Start to Start" | "Finish to Finish" | "Start to Finish"

type DependencyDirection = "waiting" | "holding"

type DependencyKind = "TASK" | "PHASE" | "CATEGORY" | "ITEM"

interface Dependency {
  id: string
  title: string
  relation: DependencyRelation
  direction: DependencyDirection
  kind: DependencyKind
  dotColor: string
  blocks: boolean
  reason?: string
  addedAt: string
  gaps: { wait: string safety: string free: string }
}

interface DependencyCandidate {
  id: string
  title: string
  dotColor: string
}

type LinkedKind = "Issue" | "RFI" | "Field Note"

type LinkedStatus = "OPEN" | "IN PROGRESS" | "RESOLVED" | "CLOSED"

interface LinkedRecord {
  id: string
  title: string
  kind: LinkedKind
  status: LinkedStatus
  priority: Severity
  description: string
  owners: string[]
}

interface TaskTabItem {
  id: TaskTab
  label: string
  count?: number
}

interface DocumentAttachment {
  id: string
  name: string
  type: "pdf" | "dwg" | "sheet"
  size: string
  date: string
  author: string
}

type AttachmentFilter = "All" | "Tags" | "Images" | "PDFs" | "Sheets" | "CAD" | "Snap"

type AttachmentView = "gallery" | "grid" | "list"

interface TagRecord {
  id: string
  kind: string
  element: string
  level: string
  image: string
}

interface ImageAttachment {
  id: string
  name: string
  size: string
  date: string
  src: string
}

interface SnapFrame {
  id: string
  name: string
  label: string
  src: string
}

type ApprovalStage = "empty" | "posted" | "sent" | "approved" | "sent-back"

interface ApprovalFile {
  id: string
  name: string
  size: string
}

interface AttachmentSource {
  id: string
  label: string
  icon: IconName
  tint: string
  fg: string
}

interface ActivityTimelineEntry {
  id: string
  text: string
  date: string
  user: string
  avatar: string
  color: string
  type: "comment" | "status" | "upload" | "system"
}

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

interface PriorityStyle {
  className: string
  dot: string
}

interface StatusBadgeStyle {
  bg: string
  text: string
  dot: string
  border: string
}

interface ItemTypeDisplay {
  header: string
  singular: string
  infoTitle: string
}

const statusSteps: {
  id: Status
  label: string
  color: string
}[] = [
  { id: "TO DO", label: "To Do", color: "#0ea5e9" },
  { id: "IN PROGRESS", label: "In Progress", color: "#0055ff" },
  { id: "REVIEW", label: "Review", color: "#8b5cf6" },
  { id: "COMPLETED", label: "Completed", color: "#10b981" },
]

const statusOrder: Status[] = [
  "TO DO",
  "IN PROGRESS",
  "REVIEW",
  "BLOCKED",
  "COMPLETED",
]

const statusColors: Record<Status, string> = {
  "TO DO": "#0ea5e9",
  "IN PROGRESS": "#0055ff",
  REVIEW: "#8b5cf6",
  BLOCKED: "#ef4444",
  COMPLETED: "#10b981",
  APPROVED: "#10b981",
}

const statusOptions: {
  id: Status
  label: string
  color: string
}[] = [
  { id: "TO DO", label: "To Do", color: "#0ea5e9" },
  { id: "IN PROGRESS", label: "In Progress", color: "#0055ff" },
  { id: "REVIEW", label: "Review", color: "#8b5cf6" },
  { id: "BLOCKED", label: "Blocked", color: "#ef4444" },
  { id: "COMPLETED", label: "Completed", color: "#10b981" },
]

const priorityOrder: Severity[] = ["LOW", "MEDIUM", "HIGH"]

const tabIcons: Record<TaskTab, IconName> = {
  details: "description",
  activity: "clock",
  attachments: "paperclip",
  subtasks: "subtasks",
  dependencies: "link",
  linked: "file",
  approval: "approval",
  notes: "task",
}

const priorityStyles: Record<Severity, PriorityStyle> = {
  LOW: {
    className: "border-blue-200 bg-blue-50/70 text-blue-700",
    dot: "#2563EB",
  },
  MEDIUM: {
    className: "border-amber-200 bg-amber-50/70 text-amber-700",
    dot: "#D97706",
  },
  HIGH: {
    className: "border-red-200 bg-red-50/70 text-red-700",
    dot: "#DC2626",
  },
}

const statusSolidStyles: Record<Status, { bg: string text: string }> = {
  "TO DO": { bg: "bg-sky-500", text: "text-white" },
  "IN PROGRESS": { bg: "bg-blue-600", text: "text-white" },
  REVIEW: { bg: "bg-purple-600", text: "text-white" },
  BLOCKED: { bg: "bg-rose-500", text: "text-white" },
  COMPLETED: { bg: "bg-emerald-600", text: "text-white" },
  APPROVED: { bg: "bg-emerald-700", text: "text-white" },
  "ON HOLD": { bg: "bg-amber-500", text: "text-white" },
}

const priorityColors: Record<Severity, string> = {
  LOW: "#2563EB",
  MEDIUM: "#D97706",
  HIGH: "#DC2626",
}

const statusBadgeStyles: Record<Status, StatusBadgeStyle> = {
  "TO DO": {
    bg: "bg-slate-50",
    text: "text-slate-700",
    dot: "#94A3B8",
    border: "border-slate-200",
  },
  "IN PROGRESS": {
    bg: "bg-blue-50/80",
    text: "text-blue-700",
    dot: "#2563EB",
    border: "border-blue-200",
  },
  REVIEW: {
    bg: "bg-purple-50/80",
    text: "text-purple-700",
    dot: "#8B5CF6",
    border: "border-purple-200",
  },
  BLOCKED: {
    bg: "bg-rose-50/80",
    text: "text-rose-700",
    dot: "#EF4444",
    border: "border-rose-200",
  },
  COMPLETED: {
    bg: "bg-emerald-50/80",
    text: "text-emerald-700",
    dot: "#10B981",
    border: "border-emerald-200",
  },
  APPROVED: {
    bg: "bg-emerald-50/80",
    text: "text-emerald-700",
    dot: "#10B981",
    border: "border-emerald-200",
  },
}

const availableAssignees: Assignee[] = [
  { id: "a1", name: "Robert Miller", initials: "RM", color: "#6366f1" },
  { id: "a2", name: "John Doe", initials: "JD", color: "#f43f5e" },
  { id: "a3", name: "Priya Singh", initials: "PS", color: "#22c55e" },
  { id: "a4", name: "Carlos Lima", initials: "CL", color: "#f97316" },
  { id: "a5", name: "Nadia Wu", initials: "NW", color: "#a855f7" },
]

const linkedKinds: LinkedKind[] = ["Issue", "RFI", "Field Note"]

const linkedStatusStyles: Record<LinkedStatus, string> = {
  OPEN: "bg-[#0055ff] text-white",
  "IN PROGRESS": "bg-[#0055ff] text-white",
  RESOLVED: "bg-emerald-600 text-white",
  CLOSED: "bg-slate-400 text-white",
}

const linkCandidates: LinkedRecord[] = [
  {
    id: "ISSUE-018",
    title: "Structural Column Clash with Main Drainage Riser at Grid C3",
    kind: "Issue",
    status: "OPEN",
    priority: "HIGH",
    description:
      "400mm vertical drainage pipe intersects primary reinforced concrete column C3 on Level 2. Rerouting via shaft C3-A required immediately.",
    owners: ["Rajesh Kumar", "Deependra Samal"],
  },
  {
    id: "ISSUE-017",
    title: "Fire Damper Inspection Clearance Insufficient",
    kind: "Issue",
    status: "IN PROGRESS",
    priority: "HIGH",
    description:
      "Access clearance in front of the damper falls short of the 450mm maintenance zone required for annual inspection.",
    owners: ["Carlos Lima"],
  },
  {
    id: "ISSUE-016",
    title: "Electrical Cable Tray Intersection with Chilled Water Line",
    kind: "Issue",
    status: "OPEN",
    priority: "MEDIUM",
    description:
      "Primary cable tray run crosses the chilled water main with no vertical separation at the Level 3 riser.",
    owners: ["Priya Singh"],
  },
  {
    id: "ISSUE-013",
    title: "Elevator Pit Waterproofing Membrane Penetration",
    kind: "Issue",
    status: "OPEN",
    priority: "HIGH",
    description:
      "Sump pump conduit penetrates the tanking membrane without an approved puddle flange detail.",
    owners: ["Robert Miller"],
  },
  {
    id: "ISSUE-011",
    title: "Acoustic Ceiling Hanger Grid Height Conflict",
    kind: "Issue",
    status: "OPEN",
    priority: "LOW",
    description:
      "Hanger drop rods clash with the supply duct at the corridor soffit; grid needs a 60mm lift.",
    owners: ["Nadia Wu"],
  },
  {
    id: "RFI-164",
    title: "Rebar Clearance Clarification at Shear Wall",
    kind: "RFI",
    status: "OPEN",
    priority: "MEDIUM",
    description:
      "Confirm the permissible cover reduction where the shear wall meets the transfer beam at Grid B4.",
    owners: ["Robert Miller"],
  },
  {
    id: "RFI-158",
    title: "Confirm Anchor Bolt Grade for Plant Room Skids",
    kind: "RFI",
    status: "IN PROGRESS",
    priority: "LOW",
    description:
      "Specification lists two grades for the same skid base plate. Confirm which governs for procurement.",
    owners: ["Carlos Lima"],
  },
  {
    id: "FN-023",
    title: "Grid B4 Reinforcement Inspection Notes",
    kind: "Field Note",
    status: "RESOLVED",
    priority: "LOW",
    description:
      "Spacing and lap lengths verified against drawing S-204. Two ties re-fixed on site during the walk.",
    owners: ["Priya Singh"],
  },
  {
    id: "FN-019",
    title: "Level 03 Corridor Duct Alignment Walkthrough",
    kind: "Field Note",
    status: "OPEN",
    priority: "LOW",
    description:
      "Photographed the duct run against the coordinated model ahead of the ceiling close-up.",
    owners: ["Anil Kumar"],
  },
]

const attachmentSources: AttachmentSource[] = [
  {
    id: "map",
    label: "Map",
    icon: "map",
    tint: "bg-violet-50",
    fg: "text-violet-500",
  },
  {
    id: "drawing",
    label: "2D Drawing",
    icon: "layers",
    tint: "bg-sky-50",
    fg: "text-sky-500",
  },
  {
    id: "bim",
    label: "3D BIM",
    icon: "cube",
    tint: "bg-rose-50",
    fg: "text-rose-500",
  },
  {
    id: "drone",
    label: "Drone",
    icon: "drone",
    tint: "bg-amber-50",
    fg: "text-amber-500",
  },
  {
    id: "walkthrough",
    label: "Walkthrough",
    icon: "walk",
    tint: "bg-emerald-50",
    fg: "text-emerald-500",
  },
  {
    id: "captures",
    label: "Captures",
    icon: "folder",
    tint: "bg-slate-100",
    fg: "text-slate-500",
  },
]

const attachmentViews: { id: AttachmentView label: string icon: IconName }[] = [
  { id: "gallery", label: "Gallery view", icon: "gallery" },
  { id: "grid", label: "Grid view", icon: "grid" },
  { id: "list", label: "List view", icon: "list" },
]

const dependencyRelations: {
  id: DependencyRelation
  short: string
  description: string
}[] = [
  {
    id: "Finish to Start",
    short: "FS",
    description: "Work cannot start until the selected task finishes.",
  },
  {
    id: "Start to Start",
    short: "SS",
    description: "Work starts at the same time as the selected task.",
  },
  {
    id: "Finish to Finish",
    short: "FF",
    description: "Work finishes at the same time as the selected task.",
  },
  {
    id: "Start to Finish",
    short: "SF",
    description: "Work finishes when the selected task starts.",
  },
]

const dependencyKinds: DependencyKind[] = ["TASK", "PHASE", "CATEGORY", "ITEM"]

/* Two bars on a mini timeline say more about a lag type than any icon can. */
function RelationDiagram({
  relation,
  muted = false,
}: {
  relation: DependencyRelation
  muted?: boolean
}) {
  const bars: Record<DependencyRelation, [number, number, number, number]> = {
    "Finish to Start": [1, 16, 18, 33],
    "Start to Start": [1, 21, 1, 26],
    "Finish to Finish": [13, 33, 8, 33],
    "Start to Finish": [18, 33, 1, 24],
  }
  const [ax, ax2, bx, bx2] = bars[relation]
  return (
    <svg
      width="34"
      height="20"
      viewBox="0 0 34 20"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x={ax}
        y="2.5"
        width={ax2 - ax}
        height="6"
        rx="3"
        fill={muted ? "#cbd5e1" : "#94a3b8"}
      />
      <rect
        x={bx}
        y="11.5"
        width={bx2 - bx}
        height="6"
        rx="3"
        fill={muted ? "#94a3b8" : "#0055ff"}
      />
    </svg>
  )
}

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
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
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
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
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
    case "pen":
    case "edit":
      return (
        <svg {...common}>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
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
    case "chevron-left":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      )
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 2.5 9 4.8-9 4.8-9-4.8 9-4.8Z" />
          <path d="m3 12.3 9 4.8 9-4.8" />
          <path d="m3 16.9 9 4.8 9-4.8" />
        </svg>
      )
    case "cube":
      return (
        <svg {...common}>
          <path d="m12 2.5 8.5 4.75v9.5L12 21.5l-8.5-4.75v-9.5L12 2.5Z" />
          <path d="M12 21.5v-9.6M3.5 7.25 12 11.9l8.5-4.65" />
        </svg>
      )
    case "drone":
      return (
        <svg {...common}>
          <circle cx="5.6" cy="5.6" r="2.6" />
          <circle cx="18.4" cy="5.6" r="2.6" />
          <circle cx="5.6" cy="18.4" r="2.6" />
          <circle cx="18.4" cy="18.4" r="2.6" />
          <rect x="9" y="9" width="6" height="6" rx="1.6" />
          <path d="m7.4 7.4 1.6 1.6M16.6 7.4 15 9M7.4 16.6 9 15M16.6 16.6 15 15" />
        </svg>
      )
    case "walk":
      return (
        <svg {...common}>
          <circle cx="13.5" cy="4.2" r="1.9" />
          <path d="m11.2 21 1.6-6.2-2.6-2.6.7-4.4 3.6 1.5 2 2.4h2.6" />
          <path d="M10.9 12.2 8.2 15M13.4 14.8 15.6 21" />
        </svg>
      )
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3.5v11.5M7.6 10.6 12 15l4.4-4.4" />
          <path d="M4.5 19.5h15" />
        </svg>
      )
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 15.5V4M7.6 8.4 12 4l4.4 4.4" />
          <path d="M4.5 19.5h15" />
        </svg>
      )
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 6.5h16M9.5 6.5V4.5h5v2" />
          <path d="m6.6 6.5 1 13.5h8.8l1-13.5" />
          <path d="M10.3 10.3v6M13.7 10.3v6" />
        </svg>
      )
    case "gallery":
      return (
        <svg {...common}>
          <rect x="2.5" y="4" width="13" height="11" rx="2.6" />
          <circle cx="6.4" cy="8" r="1.1" />
          <path d="m4 13.2 3.2-3.2 2.2 2.2 1.9-1.9 2.2 2.2" />
          <path d="M8 19.5h9.5a3 3 0 0 0 3-3V9" />
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
    case "lines":
      return (
        <svg {...common}>
          <path d="M3.5 6.5h11M3.5 12h7.5M3.5 17.5h13" />
        </svg>
      )
    case "compare":
      return (
        <svg {...common}>
          <path d="M12 3v18" strokeDasharray="2.4 2.6" />
          <path d="M8.2 7.4 4.4 11.2a1.1 1.1 0 0 0 0 1.6l3.8 3.8M15.8 7.4l3.8 3.8a1.1 1.1 0 0 1 0 1.6l-3.8 3.8" />
        </svg>
      )
    case "marker":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.6" />
          <path d="M12 2.6v3.4M12 18v3.4M2.6 12H6M18 12h3.4" />
        </svg>
      )
    case "return":
      return (
        <svg {...common}>
          <path d="M8.8 14 4 9.2l4.8-4.8" />
          <path d="M4 9.2h10.6a5.2 5.2 0 0 1 0 10.4H8.4" />
        </svg>
      )
    case "ban":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.6" />
          <path d="m5.9 5.9 12.2 12.2" />
        </svg>
      )
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
        </svg>
      )
    case "check-circle":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.6" />
          <path d="m8.4 12.2 2.4 2.4 4.8-5.2" />
        </svg>
      )
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2l2 2.5h7.8A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z" />
        </svg>
      )
    case "image-plus":
      return (
        <svg {...common}>
          <path d="M21 12.4V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h6.2" />
          <circle cx="8.6" cy="9.4" r="1.4" />
          <path d="m3.8 17.2 4.2-4.2 3 3" />
          <path d="M18 15.2v6M15 18.2h6" />
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
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 active:bg-slate-200"
      aria-label={label}
    >
      <Icon name={icon} size={16} />
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
        <h2 className="text-[13px] font-bold leading-snug tracking-normal text-slate-900">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[11px] leading-normal text-slate-500">
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
      className={`flex min-h-11 items-center gap-3 py-2 ${
        last ? "" : "border-b border-slate-100/80"
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon name={icon} size={15} />
      </span>
      <span className="w-[72px] shrink-0 text-[13px] font-medium text-slate-700">
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

function FloatingMenu({
  open,
  align = "left",
  widthClassName = "w-44",
  children,
}: {
  open: boolean
  align?: "left" | "right"
  widthClassName?: string
  children: ReactNode
}) {
  return (
    <div
      className={`absolute top-[calc(100%+7px)] z-50 ${
        align === "right"
          ? "right-0 origin-top-right"
          : "left-0 origin-top-left"
      } ${widthClassName} rounded-xl border border-slate-200/80 bg-white/95 p-1 shadow-[0_14px_34px_rgba(15,23,42,0.14)] ring-1 ring-white/70 backdrop-blur-xl transition-all duration-200 ease-out ${
        open
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none -translate-y-1.5 scale-[0.98] opacity-0"
      }`}
      aria-hidden={!open}
    >
      {children}
    </div>
  )
}

function MenuCaption({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pb-1 pt-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </div>
  )
}

function MenuCheck({ active }: { active: boolean }) {
  return (
    <span
      className={`ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0055ff] text-white transition-all duration-150 ${
        active ? "scale-100 opacity-100" : "scale-75 opacity-0"
      }`}
    >
      <Icon name="check" size={10} />
    </span>
  )
}

function FilledFlagIcon({
  color = "#D97706",
  size = 13,
}: {
  color?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <path d="M4 3h14l-3 5.5 3 5.5H4V3z" fill={color} />
      <path
        d="M4 2v20"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
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

function formatSubtaskDueDate(date?: string) {
  if (!date) return "Set date"
  if (
    date === "Today" ||
    date === "Tomorrow" ||
    date === "Next week" ||
    date === "In 3 days" ||
    date === "In 2 weeks"
  ) {
    return date
  }
  if (date.includes("-")) {
    const d = new Date(`${date}T00:00:00`)
    if (!isNaN(d.getTime())) {
      const todayIso = new Date().toISOString().split("T")[0]
      if (date === todayIso) return "Today"
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    }
  }
  return date
}

function formatPriority(sev: Severity | string) {
  if (!sev) return "Low"
  return sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase()
}

function formatStatus(status: Status | string) {
  if (!status) return "To Do"
  if (status === "TO DO") return "To Do"
  if (status === "IN PROGRESS") return "In Progress"
  if (status === "REVIEW") return "Review"
  if (status === "BLOCKED") return "Blocked"
  if (status === "COMPLETED") return "Completed"
  if (status === "APPROVED") return "Approved"
  if (status === "ON HOLD") return "On Hold"
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

function getRelativeIsoDate(offsetDays: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

const phaseOptions = [
  "Pre-construction",
  "Foundation & Substructure",
  "Superstructure",
  "Construction Execution",
  "MEP & Fitout",
  "Finishing & Handover",
  "Commissioning & Closeout",
]

const categoryOptions = [
  "MEP · HVAC",
  "Electrical Systems",
  "Plumbing & Drainage",
  "Structural & Concrete",
  "Architectural & Finishes",
  "Civil & Earthworks",
  "Fire & Life Safety",
  "Site Logistics",
]

const locationOptions = [
  "Level 03 — Corridor",
  "Level 03 — Plant Room",
  "Level 02 — Main Hall",
  "Basement B1 — Mechanical Room",
  "Basement B2 — Parking",
  "Roof Deck — Chiller Zone",
  "Zone A — East Wing",
  "Zone B — West Wing",
]

const commonTagOptions = [
  "HVAC",
  "Electrical",
  "Plumbing",
  "Safety",
  "Structural",
  "Concrete",
  "Inspection",
  "MEP",
  "Snag",
  "Urgent",
]

const itemTypeDisplayNames: Record<string, ItemTypeDisplay> = {
  task: {
    header: "Task details",
    singular: "Task",
    infoTitle: "More information",
  },
  issue: {
    header: "Issue details",
    singular: "Issue",
    infoTitle: "More information",
  },
  rfi: {
    header: "RFI details",
    singular: "RFI",
    infoTitle: "More information",
  },
  fieldnote: {
    header: "Field note details",
    singular: "Field note",
    infoTitle: "More information",
  },
}

export function TaskDetailScreen({
  item,
  onBack,
  onNavigate,
  onUpdate,
  onOpenCaptures,
}: TaskDetailScreenProps) {
  const typeConfig =
    itemTypeDisplayNames[item.type || "task"] || itemTypeDisplayNames.task
  const [tab, setTab] = useState<TaskTab>("details")
  const [title, setTitle] = useState(item.title || "")
  const [description, setDescription] = useState(item.description || "")
  const [activeField, setActiveField] =
    useState<"title" | "description" | "subtask" | "childSubtask" | "note" | "noteEdit" | null>(
      null,
    )
  const titleInputRef = useRef<HTMLTextAreaElement>(null)
  const descInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setTitle(item.title || "")
    setDescription(item.description || "")
  }, [item.id, item.title, item.description])

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = "auto"
      titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`
    }
  }, [title])

  const [comment, setComment] = useState("")
  const [photos, setPhotos] = useState<string[]>(item.photos || [])
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [attachmentFilter, setAttachmentFilter] =
    useState<AttachmentFilter>("All")
  const [attachmentView, setAttachmentView] =
    useState<AttachmentView>("gallery")
  const [activeTagId, setActiveTagId] = useState<string | null>("tag-2")
  const [activeSnapIndex, setActiveSnapIndex] = useState(0)
  const [activeReturnIndex, setActiveReturnIndex] = useState(0)
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [comparePosition, setComparePosition] = useState(52)
  const compareTrackRef = useRef<HTMLDivElement>(null)
  const [subtaskDraft, setSubtaskDraft] = useState("")
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false)
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false)
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false)
  const [isCalendarSheetOpen, setIsCalendarSheetOpen] = useState(false)
  const [calendarTarget, setCalendarTarget] = useState<{
    type: "item" | "subtask"
    subtaskId?: string
    title?: string
  } | null>(null)
  const [openAssigneeSubtaskId, setOpenAssigneeSubtaskId] =
    useState<string | null>(null)
  const [openMenuSubtaskId, setOpenMenuSubtaskId] = useState<string | null>(
    null,
  )
  const [collapsedParents, setCollapsedParents] = useState<Set<string>>(
    new Set(),
  )
  const [addingChildToParentId, setAddingChildToParentId] =
    useState<string | null>(null)
  const [childSubtaskDraft, setChildSubtaskDraft] = useState("")
  const [calendarViewMonth, setCalendarViewMonth] = useState<Date>(() => {
    if (item.dueDate) {
      const [y, m] = item.dueDate.split("-").map(Number)
      if (!isNaN(y) && !isNaN(m)) return new Date(y, m - 1, 1)
    }
    return new Date()
  })
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("day")
  const [isCalendarModeDropdownOpen, setIsCalendarModeDropdownOpen] =
    useState(false)
  const [isApproverMenuOpen, setIsApproverMenuOpen] = useState(false)
  const [isInfoDateMenuOpen, setIsInfoDateMenuOpen] = useState(false)
  const [isWatchersMenuOpen, setIsWatchersMenuOpen] = useState(false)
  const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false)
  const [isPhaseMenuOpen, setIsPhaseMenuOpen] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false)
  const [newTagInput, setNewTagInput] = useState("")
  const [isWatching, setIsWatching] = useState(true)
  const [approver, setApprover] = useState("Robert Miller")
  const [notesList, setNotesList] = useState<TodoNote[]>([
    {
      id: "note-1",
      text: "Verify duct damper alignment with MEP drawings",
      done: false,
      createdAt: "10:30 AM",
    },
    {
      id: "note-2",
      text: "Confirm smoke seal clearance with safety inspector",
      done: false,
      createdAt: "Yesterday",
    },
    {
      id: "note-3",
      text: "Take extra photo of mounting bracket screws",
      done: true,
      createdAt: "2 days ago",
    },
  ])
  const [newNoteInput, setNewNoteInput] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState("")
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const tabListRef = useRef<HTMLDivElement>(null)

  const [tabIndicator, setTabIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
  })
  const [isInitialTabRender, setIsInitialTabRender] = useState(true)

  useEffect(() => {
    const updateIndicator = () => {
      const activeTabEl = tabListRef.current?.querySelector<HTMLElement>(
        `#task-tab-${tab}`,
      )
      if (activeTabEl && tabListRef.current) {
        setTabIndicator({
          left: activeTabEl.offsetLeft,
          width: activeTabEl.offsetWidth,
          ready: true,
        })
        const container = tabListRef.current
        const left =
          activeTabEl.offsetLeft -
          container.offsetWidth / 2 +
          activeTabEl.offsetWidth / 2
        container.scrollTo({ left: Math.max(0, left), behavior: "smooth" })
      }
    }

    updateIndicator()

    if (isInitialTabRender) {
      const timer = setTimeout(() => setIsInitialTabRender(false), 80)
      return () => clearTimeout(timer)
    }
  }, [tab, isInitialTabRender])
  const [toastMessage, setToastMessage] = useState("")
  const [linkSearch, setLinkSearch] = useState("")
  const [previewDocument, setPreviewDocument] =
    useState<DocumentAttachment | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const [activityEntries, setActivityEntries] =
    useState<ActivityTimelineEntry[]>(() => {
      const defaultList = [
        {
          id: "act-1",
          text: "Verified clearance measurements on site. MEP team confirmed rerouting under Level 03 main corridor.",
          date: "Today, 09:45 AM",
          user: "Anil Kumar Patra",
          avatar: "AK",
          color: "#0055ff",
          type: "comment" as const,
        },
        {
          id: "act-2",
          text: `Status updated to ${item.status}`,
          date: "Yesterday, 03:20 PM",
          user: (item.assignees && item.assignees[0]?.name) || "Robert Miller",
          avatar: (item.assignees && item.assignees[0]?.initials) || "RM",
          color: (item.assignees && item.assignees[0]?.color) || "#6366f1",
          type: "status" as const,
        },
        {
          id: "act-3",
          text: "Uploaded on-site progress photos for site condition inspection.",
          date: "01 Sep 2026, 11:15 AM",
          user: "Carlos Lima",
          avatar: "CL",
          color: "#f97316",
          type: "upload" as const,
        },
        {
          id: "act-4",
          text: `Work item ${item.id} logged in Stalwart Construction Project.`,
          date: "28 Aug 2026, 08:30 AM",
          user: "System",
          avatar: "SY",
          color: "#64748b",
          type: "system" as const,
        },
      ]
      if (item.activity && item.activity.length > 1) {
        return item.activity.map((entry, idx) => ({
          id: entry.id || `act-${idx}`,
          text: entry.text,
          date: entry.date,
          user: idx === 0 ? "Anil Kumar Patra" : "Robert Miller",
          avatar: idx === 0 ? "AK" : "RM",
          color: idx === 0 ? "#0055ff" : "#6366f1",
          type: "comment" as const,
        }))
      }
      return defaultList
    })

  const [documents] = useState<DocumentAttachment[]>([
    {
      id: "doc-1",
      name: `Inspection_Signoff_${item.id}.pdf`,
      type: "pdf",
      size: "1.4 MB",
      date: "01 Sep 2026",
      author: "Robert Miller",
    },
    {
      id: "doc-2",
      name: `Drawing_Coordination_${item.id}.dwg`,
      type: "dwg",
      size: "4.8 MB",
      date: "29 Aug 2026",
      author: "Anil Kumar",
    },
    {
      id: "doc-3",
      name: "Field_Quality_Lab_Report.pdf",
      type: "pdf",
      size: "890 KB",
      date: "25 Aug 2026",
      author: "Carlos Lima",
    },
    {
      id: "doc-4",
      name: `Sheet_A-201_Level03_${item.id}.sheet`,
      type: "sheet",
      size: "2.2 MB",
      date: "22 Aug 2026",
      author: "Priya Singh",
    },
  ])

  const [tagRecords, setTagRecords] = useState<TagRecord[]>([
    {
      id: "tag-1",
      kind: "BIM",
      element: "Element struct-rebar-col-b456VUXZ",
      level: "Level 1",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&h=560&fit=crop&auto=format",
    },
    {
      id: "tag-2",
      kind: "BUILDING",
      element: "Element struct-rebar-col-b456VUXZ",
      level: "Level 6",
      image:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=560&fit=crop&auto=format",
    },
  ])

  const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>([
    {
      id: "img-1",
      name: "Site Capture Jun 16, 2026, 06_21_36 PM (1).png",
      size: "2.1 MB",
      date: "Aug 14",
      src: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1000&h=750&fit=crop&auto=format",
    },
    {
      id: "img-2",
      name: "Level03_corridor_duct_alignment.jpg",
      size: "1.6 MB",
      date: "Aug 14",
      src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&h=750&fit=crop&auto=format",
    },
    {
      id: "img-3",
      name: "Bracket_mount_detail_grid_B4.jpg",
      size: "980 KB",
      date: "Aug 12",
      src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&h=750&fit=crop&auto=format",
    },
    {
      id: "img-4",
      name: "Smoke_seal_clearance_check.jpg",
      size: "1.2 MB",
      date: "Aug 11",
      src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1000&h=750&fit=crop&auto=format",
    },
  ])

  const [snapFrames, setSnapFrames] = useState<SnapFrame[]>([
    {
      id: "snap-1",
      name: "Viewer snap · clash detected",
      label: "Viewer snap",
      src: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1000&h=700&fit=crop&auto=format",
    },
  ])

  const [returnSnaps, setReturnSnaps] = useState<SnapFrame[]>([
    {
      id: "return-1",
      name: "1001177345.png",
      label: "Return snap",
      src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&h=700&fit=crop&auto=format",
    },
  ])

  const displayPhotos = imageAttachments.map((image) => image.src)

  const [subtasks, setSubtasks] = useState<Subtask[]>(() => {
    const clAssignee =
      availableAssignees.find((a) => a.initials === "CL") ||
      availableAssignees[3]
    const rmAssignee =
      availableAssignees.find((a) => a.initials === "RM") ||
      availableAssignees[0]
    const psAssignee =
      availableAssignees.find((a) => a.initials === "PS") ||
      availableAssignees[2]

    if (item.type === "issue") {
      return [
        {
          id: `${item.id}-subtask-1`,
          title: "Verify clash point on-site with 3D laser scanner",
          done: true,
          assignees: [clAssignee],
          dueDate: "Today",
          parentId: null,
        },
        {
          id: `${item.id}-subtask-1-1`,
          title: "Calibrate point cloud coordinates against grid datum",
          done: true,
          assignees: [clAssignee],
          dueDate: "Today",
          parentId: `${item.id}-subtask-1`,
        },
        {
          id: `${item.id}-subtask-2`,
          title: "Coordinate MEP reroute clearance with structural team",
          done: item.status === "COMPLETED" || item.status === "APPROVED",
          assignees: [rmAssignee, clAssignee],
          dueDate: "Tomorrow",
          parentId: null,
        },
        {
          id: `${item.id}-subtask-2-1`,
          title: "Confirm shear wall penetration allowance",
          done: false,
          assignees: [psAssignee],
          dueDate: "In 3 days",
          parentId: `${item.id}-subtask-2`,
        },
        {
          id: `${item.id}-subtask-3`,
          title: "Issue revised coordination sketch to field superintendent",
          done: false,
          assignees: [rmAssignee],
          dueDate: "Next week",
          parentId: null,
        },
      ]
    }
    if (item.type === "rfi") {
      return [
        {
          id: `${item.id}-subtask-1`,
          title: "Review structural engineer clarification drawings",
          done: true,
          assignees: [clAssignee],
          dueDate: "Today",
          parentId: null,
        },
        {
          id: `${item.id}-subtask-1-1`,
          title: "Calculate rebar clearance tolerance at shear wall",
          done: item.status === "COMPLETED" || item.status === "APPROVED",
          assignees: [rmAssignee],
          dueDate: "Today",
          parentId: `${item.id}-subtask-1`,
        },
        {
          id: `${item.id}-subtask-2`,
          title: "Issue official response notice to general contractor",
          done: false,
          assignees: [psAssignee],
          dueDate: "Tomorrow",
          parentId: null,
        },
      ]
    }
    return [
      {
        id: `${item.id}-subtask-1`,
        title: "Survey ceiling grid line offsets and laser datum",
        done: true,
        assignees: [clAssignee],
        dueDate: "Today",
        parentId: null,
      },
      {
        id: `${item.id}-subtask-1-1`,
        title: "Benchmark laser level against Grid line A1 datum",
        done: true,
        assignees: [clAssignee],
        dueDate: "Today",
        parentId: `${item.id}-subtask-1`,
      },
      {
        id: `${item.id}-subtask-1-2`,
        title: "Verify clearance tolerances along Level 03 corridor",
        done: false,
        assignees: [rmAssignee],
        dueDate: "Tomorrow",
        parentId: `${item.id}-subtask-1`,
      },
      {
        id: `${item.id}-subtask-2`,
        title: "Install heavy-duty galvanized suspension brackets",
        done: false,
        assignees: [clAssignee],
        dueDate: "Today",
        parentId: null,
      },
      {
        id: `${item.id}-subtask-2-1`,
        title: "Anchor bracket supports at 1200mm intervals",
        done: false,
        assignees: [psAssignee],
        dueDate: "In 3 days",
        parentId: `${item.id}-subtask-2`,
      },
      {
        id: `${item.id}-subtask-3`,
        title: "Mount supply air duct segments per drawing M-301",
        done: false,
        assignees: [],
        dueDate: "Today",
        parentId: null,
      },
      {
        id: `${item.id}-subtask-4`,
        title: "Smoke pen joint inspection and pressure test sign-off",
        done: false,
        assignees: [clAssignee],
        dueDate: "Today",
        parentId: null,
      },
    ]
  })
  const [dependencies, setDependencies] = useState<Dependency[]>([
    {
      id: "#2-231-0003",
      title: "Review electrical shop drawing",
      relation: "Start to Start",
      direction: "waiting",
      kind: "TASK",
      dotColor: "#0055ff",
      blocks: false,
      addedAt: "2 days ago",
      gaps: { wait: "0", safety: "0", free: "0" },
    },
    {
      id: "#2-221-0004",
      title: "Resolve ceiling coordination clash at Grid B4",
      relation: "Finish to Finish",
      direction: "waiting",
      kind: "TASK",
      dotColor: "#f59e0b",
      blocks: true,
      reason: "Structural sign-off is still pending on the revised sketch.",
      addedAt: "Just now",
      gaps: { wait: "0", safety: "0", free: "0" },
    },
    {
      id: "#2-212-0007",
      title: "Approve concrete mix design",
      relation: "Finish to Start",
      direction: "holding",
      kind: "TASK",
      dotColor: "#10b981",
      blocks: false,
      addedAt: "4 days ago",
      gaps: { wait: "1", safety: "0", free: "0" },
    },
  ])
  const [dependencyStep, setDependencyStep] = useState(0)
  const [dependencyFilter, setDependencyFilter] =
    useState<"blocking" | "waiting" | "holding" | null>(null)
  const [dependencyRelation, setDependencyRelation] =
    useState<DependencyRelation>("Finish to Start")
  const [dependencyKind, setDependencyKind] = useState<DependencyKind>("TASK")
  const [dependencyTarget, setDependencyTarget] =
    useState<DependencyCandidate | null>(null)
  const [dependencySearch, setDependencySearch] = useState("")
  const [dependencyGaps, setDependencyGaps] = useState({
    wait: "0",
    safety: "0",
    free: "0",
  })
  const [dependencyBlocksTask, setDependencyBlocksTask] = useState(false)
  const [dependencyReason, setDependencyReason] = useState("")
  const [linkedKind, setLinkedKind] = useState<LinkedRecord["kind"]>("Issue")
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false)
  const [linkedRecords, setLinkedRecords] = useState<LinkedRecord[]>(() =>
    linkCandidates.filter((candidate) =>
      ["ISSUE-018", "RFI-164", "FN-023"].includes(candidate.id),
    ),
  )

  const [approvalStage, setApprovalStage] = useState<ApprovalStage>(
    item.status === "APPROVED" ||
      (item.activity || []).some((entry) =>
        entry.text.toLowerCase().includes("approved"),
      )
      ? "approved"
      : "posted",
  )
  const [returnSnapNote, setReturnSnapNote] = useState("")
  const [sendNote, setSendNote] = useState("")
  const [decisionNote, setDecisionNote] = useState("")
  const [approvalFiles, setApprovalFiles] = useState<ApprovalFile[]>([
    { id: "file-1", name: "Drawing-manifest.json", size: "0.0 MB" },
  ])
  const [approvalTimes, setApprovalTimes] = useState({
    posted: "22 Aug 2026, 16:52",
    sent: "22 Aug 2026, 16:59",
    decided: "23 Aug 2026, 09:14",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const completedSubtasks = subtasks.filter((subtask) => subtask.done).length
  const subtaskProgress = subtasks.length
    ? Math.round((completedSubtasks / subtasks.length) * 100)
    : 0
  /* With no query the picker stays on the active type; searching spans all
     three, which is what the search placeholder promises. */
  const filteredLinkCandidates = linkCandidates.filter((candidate) => {
    const query = linkSearch.trim().toLowerCase()
    if (!query) return candidate.kind === linkedKind
    return `${candidate.id} ${candidate.title} ${candidate.kind} ${candidate.status} ${candidate.priority}`
      .toLowerCase()
      .includes(query)
  })
  const dependencyPool: Record<DependencyKind, DependencyCandidate[]> = {
    TASK: [
      {
        id: "#2-211-1273",
        title: "Grid B4 rebar spacing check",
        dotColor: "#94a3b8",
      },
      {
        id: "#2-231-0003",
        title: "Review electrical shop drawing",
        dotColor: "#0055ff",
      },
      {
        id: "#2-221-0004",
        title: "Resolve ceiling coordination clash",
        dotColor: "#f59e0b",
      },
      {
        id: "#2-212-0007",
        title: "Approve concrete mix design",
        dotColor: "#10b981",
      },
      {
        id: "#2-221-0021",
        title: "Procure supply air grilles & linear diffusers",
        dotColor: "#10b981",
      },
      {
        id: "#3-311-0022",
        title: "Chiller valve packages delivery on site",
        dotColor: "#0055ff",
      },
      {
        id: "#2-231-0023",
        title: "Prepare BOQ checklist for electrical",
        dotColor: "#10b981",
      },
    ],
    PHASE: phaseOptions.map((phase, index) => ({
      id: `PH-${String(index + 1).padStart(2, "0")}`,
      title: phase,
      dotColor: "#8b5cf6",
    })),
    CATEGORY: categoryOptions.map((category, index) => ({
      id: `CT-${String(index + 1).padStart(2, "0")}`,
      title: category,
      dotColor: "#0ea5e9",
    })),
    ITEM: [
      {
        id: "ISSUE-018",
        title: "Structural column clash with drainage riser",
        dotColor: "#ef4444",
      },
      {
        id: "RFI-164",
        title: "Rebar clearance clarification at shear wall",
        dotColor: "#f59e0b",
      },
      {
        id: "FN-023",
        title: "Grid B4 reinforcement inspection notes",
        dotColor: "#10b981",
      },
    ],
  }

  const dependencyCandidates = dependencyPool[dependencyKind].filter(
    (candidate) =>
      `${candidate.id} ${candidate.title}`
        .toLowerCase()
        .includes(dependencySearch.trim().toLowerCase()),
  )

  const tabs: TaskTabItem[] = [
    { id: "details", label: "Details" },
    { id: "activity", label: "Activity", count: activityEntries.length },
    {
      id: "attachments",
      label: "Attachments",
      count:
        tagRecords.length +
        imageAttachments.length +
        documents.length +
        snapFrames.length +
        returnSnaps.length,
    },
    { id: "subtasks", label: "Subtasks", count: subtasks.length },
    { id: "dependencies", label: "Dependencies", count: dependencies.length },
    { id: "linked", label: "Linked issues", count: linkedRecords.length },
    { id: "approval", label: "Approval" },
    {
      id: "notes",
      label: "Notes",
      count: notesList.filter((n) => !n.done).length,
    },
  ]
  const datePresets = [
    {
      label: "Today",
      value: getRelativeIsoDate(0),
      helper: formatDate(getRelativeIsoDate(0)),
    },
    {
      label: "Tomorrow",
      value: getRelativeIsoDate(1),
      helper: formatDate(getRelativeIsoDate(1)),
    },
    {
      label: "Next week",
      value: getRelativeIsoDate(7),
      helper: formatDate(getRelativeIsoDate(7)),
    },
  ]
  const dueDateOptions = datePresets.some(
    (option) => option.value === item.dueDate,
  )
    ? datePresets
    : [
        {
          label: "Current date",
          value: item.dueDate,
          helper: formatDate(item.dueDate),
        },
        ...datePresets,
      ]

  const closeInlineMenus = () => {
    setIsStatusDropdownOpen(false)
    setIsPriorityDropdownOpen(false)
    setIsAssigneeDropdownOpen(false)
    setIsDateDropdownOpen(false)
    setIsCalendarSheetOpen(false)
    setIsApproverMenuOpen(false)
    setIsInfoDateMenuOpen(false)
    setIsWatchersMenuOpen(false)
    setIsTagsMenuOpen(false)
    setIsPhaseMenuOpen(false)
    setIsCategoryMenuOpen(false)
    setIsLocationMenuOpen(false)
    setOpenAssigneeSubtaskId(null)
    setAddingChildToParentId(null)
  }

  const closeHeaderMenus = () => {
    setIsMoreMenuOpen(false)
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToastMessage(""), 1800)
  }

  const handleCompareMove = (clientX: number) => {
    const rect = compareTrackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const percent = ((clientX - rect.left) / rect.width) * 100
    setComparePosition(Math.min(100, Math.max(0, percent)))
  }

  const saveTitle = () => {
    const trimmed = title.trim()
    if (trimmed && trimmed !== item.title) {
      onUpdate(item.id, { title: trimmed })
    }
  }

  const saveDescription = () => {
    if (description !== item.description) onUpdate(item.id, { description })
  }

  const addPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const src = URL.createObjectURL(file)
    const nextPhotos = [src, ...photos]
    setPhotos(nextPhotos)
    onUpdate(item.id, { photos: nextPhotos })

    const uploaded: SnapFrame & ImageAttachment = {
      id: `upload-${Date.now()}`,
      name: file.name,
      label: "Return snap",
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      src,
    }

    if (attachmentFilter === "Snap") {
      setReturnSnaps((current) => [...current, uploaded])
      setActiveReturnIndex(returnSnaps.length)
      showToast("Return snap added")
    } else {
      setImageAttachments((current) => [uploaded, ...current])
      setActivePhotoIndex(0)
      setAttachmentFilter("Images")
      showToast("Image uploaded")
    }
    event.target.value = ""
  }

  const addComment = () => {
    const value = comment.trim()
    if (!value) return
    const newEntry = {
      id: `comment-${Date.now()}`,
      text: value,
      date: "Just now",
      user: "Anil Kumar Patra",
      avatar: "AK",
      color: "#0055ff",
      type: "comment" as const,
    }
    setActivityEntries((prev) => [newEntry, ...prev])
    onUpdate(item.id, {
      activity: [
        ...(item.activity || []),
        {
          id: newEntry.id,
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
    const newEntry = {
      id: `approval-${Date.now()}`,
      text,
      date: "Just now",
      user: "Robert Miller",
      avatar: "RM",
      color: "#6366f1",
      type: "status" as const,
    }
    setActivityEntries((prev) => [newEntry, ...prev])
    onUpdate(item.id, {
      ...(status ? { status } : {}),
      activity: [
        ...(item.activity || []),
        {
          id: newEntry.id,
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

  const openSubtaskCalendar = (subtask: Subtask) => {
    closeInlineMenus()
    setCalendarTarget({
      type: "subtask",
      subtaskId: subtask.id,
      title: subtask.title,
    })
    if (subtask.dueDate && subtask.dueDate.includes("-")) {
      const [y, m] = subtask.dueDate.split("-").map(Number)
      if (!isNaN(y) && !isNaN(m)) {
        setCalendarViewMonth(new Date(y, m - 1, 1))
      }
    } else {
      setCalendarViewMonth(new Date())
    }
    setIsCalendarSheetOpen(true)
  }

  const addSubtask = () => {
    const value = subtaskDraft.trim()
    if (!value) return
    const clAssignee =
      availableAssignees.find((a) => a.initials === "CL") ||
      availableAssignees[3]
    setSubtasks((current) => [
      ...current,
      {
        id: `subtask-${Date.now()}`,
        title: value,
        done: false,
        assignees: [clAssignee],
        dueDate: "Today",
        parentId: null,
      },
    ])
    setSubtaskDraft("")
    showToast("Subtask added")
  }

  const handleAddChildSubtask = (parentId: string) => {
    const value = childSubtaskDraft.trim()
    if (!value) return
    const parent = subtasks.find((s) => s.id === parentId)
    setSubtasks((current) => [
      ...current,
      {
        id: `subtask-${Date.now()}`,
        title: value,
        done: false,
        assignees: parent?.assignees || (item.assignees || []).slice(0, 1),
        dueDate: parent?.dueDate || "Today",
        parentId,
      },
    ])
    setChildSubtaskDraft("")
    setAddingChildToParentId(null)
    setCollapsedParents((prev) => {
      const next = new Set(prev)
      next.delete(parentId)
      return next
    })
    showToast("Nested subtask created")
  }

  const toggleParentCollapse = (id: string) => {
    setCollapsedParents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSubtaskDone = (id: string) => {
    setSubtasks((current) =>
      current.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    )
  }

  const deleteSubtask = (id: string) => {
    setSubtasks((current) =>
      current.filter((s) => s.id !== id && s.parentId !== id),
    )
    showToast("Subtask removed")
  }

  const handleAddNote = () => {
    const text = newNoteInput.trim()
    if (!text) return
    const newNote: TodoNote = {
      id: `note-${Date.now()}`,
      text,
      done: false,
      createdAt: "Just now",
    }
    setNotesList((prev) => [newNote, ...prev])
    setNewNoteInput("")
    showToast("To-do note added")
  }

  const handleToggleNote = (id: string) => {
    setNotesList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, done: !n.done } : n)),
    )
  }

  const handleDeleteNote = (id: string) => {
    setNotesList((prev) => prev.filter((n) => n.id !== id))
    showToast("To-do deleted")
  }

  const handleStartEdit = (note: TodoNote) => {
    setEditingNoteId(note.id)
    setEditingNoteText(note.text)
    setActiveField("noteEdit")
  }

  const handleSaveEdit = () => {
    if (!editingNoteId) return
    const text = editingNoteText.trim()
    if (text) {
      setNotesList((prev) =>
        prev.map((n) => (n.id === editingNoteId ? { ...n, text } : n)),
      )
      showToast("To-do updated")
    }
    setEditingNoteId(null)
    setEditingNoteText("")
  }

  const handleClearCompleted = () => {
    setNotesList((prev) => prev.filter((n) => !n.done))
    showToast("Cleared completed to-dos")
  }

  const resetDependencyDraft = () => {
    setDependencyStep(0)
    setDependencySearch("")
    setDependencyTarget(null)
    setDependencyKind("TASK")
    setDependencyRelation("Finish to Start")
    setDependencyGaps({ wait: "0", safety: "0", free: "0" })
    setDependencyBlocksTask(false)
    setDependencyReason("")
  }

  const addDependency = () => {
    if (!dependencyTarget) return
    setDependencies((current) => [
      ...current,
      {
        id: dependencyTarget.id,
        title: dependencyTarget.title,
        relation: dependencyRelation,
        direction: "waiting",
        kind: dependencyKind,
        dotColor: dependencyTarget.dotColor,
        blocks: dependencyBlocksTask,
        reason: dependencyBlocksTask
          ? dependencyReason.trim() || undefined
          : undefined,
        addedAt: "Just now",
        gaps: { ...dependencyGaps },
      },
    ])
    showToast(dependencyBlocksTask ? "Blocker linked" : "Dependency linked")
    resetDependencyDraft()
  }

  const selectTab = (nextTab: TaskTab) => {
    saveTitle()
    saveDescription()
    setActiveField(null)
    setTab(nextTab)
    closeHeaderMenus()
    closeInlineMenus()
  }

  const linkRecord = (record: LinkedRecord) => {
    setLinkedRecords((current) =>
      current.some((entry) => entry.id === record.id)
        ? current
        : [...current, record],
    )
    // Follow the record we just linked so it is visible on close.
    setLinkedKind(record.kind)
    setIsLinkPickerOpen(false)
    setLinkSearch("")
    showToast(`${record.id} linked`)
  }

  const handleShare = async () => {
    const numericId = (item.id.replace(/[^0-9]/g, "") || "0")
      .split("")
      .join(".")
    const shareText = `${numericId} · ${item.title}`
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
      }
      showToast("Task link copied")
    } catch {
      showToast("Share link ready")
    }
  }

  const markComplete = () => {
    onUpdate(item.id, { status: "COMPLETED", progress: 100 })
    showToast("Task marked complete")
    closeHeaderMenus()
  }

  const renderDetails = () => {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-3 space-y-3.5">
        {/* Backdrop for open dropdowns */}
        {(isStatusDropdownOpen ||
          isPriorityDropdownOpen ||
          isAssigneeDropdownOpen ||
          isDateDropdownOpen ||
          isApproverMenuOpen ||
          isInfoDateMenuOpen ||
          isWatchersMenuOpen ||
          isTagsMenuOpen ||
          isPhaseMenuOpen ||
          isCategoryMenuOpen ||
          isLocationMenuOpen) && (
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default"
            onClick={closeInlineMenus}
            aria-label="Close detail menus"
          />
        )}

        {/* Title */}
        <div
          className={`relative transition-all ${
            activeField === "title" ? "z-40" : "z-10"
          }`}
        >
          <textarea
            ref={titleInputRef}
            value={title}
            onFocus={() => setActiveField("title")}
            onChange={(event) => {
              setTitle(event.target.value)
              onUpdate(item.id, { title: event.target.value })
              const target = event.target
              target.style.height = "auto"
              target.style.height = `${target.scrollHeight}px`
            }}
            onBlur={saveTitle}
            rows={1}
            placeholder="Task title..."
            className="w-full resize-none border-none bg-transparent p-0 text-[26px] font-extrabold leading-tight tracking-tight text-slate-900 outline-none caret-[#0055ff] placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 cursor-text"
            style={{
              fontWeight: 800,
              fontSize: "26px",
              lineHeight: "1.25",
            }}
          />
        </div>

        {/* Photo / Inspection Preview */}
        {displayPhotos.length > 0 ? (
          <div
            onClick={() => {
              setActivePhotoIndex(0)
              setIsPreviewOpen(true)
            }}
            className="group relative h-[175px] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-2xs cursor-pointer"
          >
            <img
              src={displayPhotos[0]}
              alt="Site inspection preview"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
            {/* Top-Right Photo Count */}
            <div className="absolute top-3 right-3">
              <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md shadow-xs">
                Photo 1 of {displayPhotos.length}
              </span>
            </div>
            {/* Center See More Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-white/95 px-4 py-1.5 text-[12px] font-bold text-slate-900 shadow-md backdrop-blur-md transition-transform duration-200 group-hover:scale-105">
                See more
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-14 w-full items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-3.5 text-left text-slate-600 transition-colors hover:border-[#0055ff] hover:bg-blue-50/20 cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0055ff]">
              <Icon name="camera" size={16} />
            </span>
            <div>
              <span className="block text-[12.5px] font-semibold text-slate-800">
                Add a {typeConfig.singular.toLowerCase()} photo
              </span>
              <span className="block text-[11px] text-slate-400">
                Document the current site condition
              </span>
            </div>
          </button>
        )}

        {/* Properties List (Simple, borderless, compact) */}
        <div className="relative z-30 divide-y divide-slate-100/80 border-y border-slate-100/80">
          {/* 1. Status Row - dropdown like priority */}
          <div className="flex items-center justify-between px-0.5 py-1.5">
            <span className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
              <Icon name="status" size={14} className="text-slate-400" />
              Status
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  closeHeaderMenus()
                  setIsPriorityDropdownOpen(false)
                  setIsAssigneeDropdownOpen(false)
                  setIsDateDropdownOpen(false)
                  setIsStatusDropdownOpen(!isStatusDropdownOpen)
                }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold text-slate-800 transition-all hover:bg-slate-100/80 active:scale-95 cursor-pointer"
                aria-expanded={isStatusDropdownOpen}
                aria-haspopup="menu"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      statusColors[item.status] || "#0ea5e9",
                  }}
                />
                <span>{formatStatus(item.status)}</span>
                <Icon
                  name="chevron-down"
                  size={10}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isStatusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <FloatingMenu
                open={isStatusDropdownOpen}
                widthClassName="w-40"
                align="right"
              >
                <MenuCaption>Set status</MenuCaption>
                {statusOptions.map((st) => {
                  const isSelected = item.status === st.id
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        onUpdate(item.id, {
                          status: st.id,
                          progress:
                            st.id === "COMPLETED"
                              ? 100
                              : st.id === "IN PROGRESS"
                                ? 50
                                : undefined,
                        })
                        setIsStatusDropdownOpen(false)
                      }}
                      className={`flex min-h-8 w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: st.color }}
                        />
                        <span>{st.label}</span>
                      </span>
                      <MenuCheck active={isSelected} />
                    </button>
                  )
                })}
              </FloatingMenu>
            </div>
          </div>

          {/* 2. Priority Row - filled colored flag */}
          <div className="flex items-center justify-between px-0.5 py-1.5">
            <span className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
              <FilledFlagIcon color={priorityColors[item.severity]} size={14} />
              Priority
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  closeHeaderMenus()
                  setIsStatusDropdownOpen(false)
                  setIsAssigneeDropdownOpen(false)
                  setIsDateDropdownOpen(false)
                  setIsPriorityDropdownOpen(!isPriorityDropdownOpen)
                }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold text-slate-800 transition-all hover:bg-slate-100/80 active:scale-95"
                aria-expanded={isPriorityDropdownOpen}
                aria-haspopup="menu"
              >
                <FilledFlagIcon
                  color={priorityColors[item.severity]}
                  size={13}
                />
                <span>{formatPriority(item.severity)}</span>
                <Icon
                  name="chevron-down"
                  size={10}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isPriorityDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <FloatingMenu
                open={isPriorityDropdownOpen}
                widthClassName="w-36"
                align="right"
              >
                <MenuCaption>Set priority</MenuCaption>
                {priorityOrder.map((sev) => {
                  const isSelected = item.severity === sev
                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => {
                        onUpdate(item.id, { severity: sev })
                        setIsPriorityDropdownOpen(false)
                      }}
                      className={`flex min-h-8 w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold transition-all duration-150 active:scale-[0.98] ${
                        isSelected
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FilledFlagIcon color={priorityColors[sev]} size={13} />
                        <span>{formatPriority(sev)}</span>
                      </span>
                      <MenuCheck active={isSelected} />
                    </button>
                  )
                })}
              </FloatingMenu>
            </div>
          </div>

          {/* 3. Assignee Row - single: avatar + name; multiple: only overlapped avatars */}
          <div className="flex items-center justify-between px-0.5 py-1.5">
            <span className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
              <Icon name="users" size={14} className="text-slate-400" />
              Assignee
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  closeHeaderMenus()
                  setIsPriorityDropdownOpen(false)
                  setIsDateDropdownOpen(false)
                  setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)
                }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold text-slate-800 transition-all hover:bg-slate-100/80 active:scale-95 cursor-pointer"
                aria-expanded={isAssigneeDropdownOpen}
                aria-haspopup="menu"
              >
                {(() => {
                  const assignees = item.assignees || []
                  if (assignees.length === 0) {
                    return (
                      <>
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                          <Icon name="users" size={11} />
                        </span>
                        <span className="max-w-[130px] truncate text-slate-600">
                          Unassigned
                        </span>
                      </>
                    )
                  }

                  if (assignees.length === 1) {
                    return (
                      <>
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: assignees[0].color }}
                        >
                          {assignees[0].initials}
                        </span>
                        <span className="max-w-[130px] truncate">
                          {assignees[0].name}
                        </span>
                      </>
                    )
                  }

                  // Multiple assignees: ONLY overlapped icons without name
                  return (
                    <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                      {assignees.slice(0, 3).map((assignee) => (
                        <span
                          key={assignee.id}
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8.5px] font-bold text-white ring-1.5 ring-white shadow-2xs"
                          style={{ backgroundColor: assignee.color }}
                          title={assignee.name}
                        >
                          {assignee.initials}
                        </span>
                      ))}
                      {assignees.length > 3 && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[8px] font-bold text-slate-700 ring-1.5 ring-white">
                          +{assignees.length - 3}
                        </span>
                      )}
                    </div>
                  )
                })()}
                <Icon
                  name="chevron-down"
                  size={10}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isAssigneeDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <FloatingMenu
                open={isAssigneeDropdownOpen}
                widthClassName="w-52"
                align="right"
              >
                <MenuCaption>Manage assignees</MenuCaption>
                {availableAssignees.map((user) => {
                  const currentAssignees = item.assignees || []
                  const isSelected = currentAssignees.some(
                    (a) => a.id === user.id,
                  )
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        const newAssignees = isSelected
                          ? currentAssignees.filter((a) => a.id !== user.id)
                          : [...currentAssignees, user]
                        onUpdate(item.id, { assignees: newAssignees })
                      }}
                      className={`flex min-h-8 w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold transition-all duration-150 active:scale-[0.98] ${
                        isSelected
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.initials}
                        </span>
                        <span className="truncate">{user.name}</span>
                      </div>
                      <MenuCheck active={isSelected} />
                    </button>
                  )
                })}
              </FloatingMenu>
            </div>
          </div>

          {/* 4. Due Date Row - opens custom calendar bottom sheet */}
          <div className="flex items-center justify-between px-0.5 py-1.5">
            <span className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
              <Icon name="calendar" size={14} className="text-slate-400" />
              Due date
            </span>
            <button
              type="button"
              onClick={() => {
                closeHeaderMenus()
                closeInlineMenus()
                if (item.dueDate) {
                  const [y, m] = item.dueDate.split("-").map(Number)
                  if (!isNaN(y) && !isNaN(m)) {
                    setCalendarViewMonth(new Date(y, m - 1, 1))
                  }
                }
                setCalendarTarget({ type: "item" })
                setIsCalendarSheetOpen(true)
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-semibold text-slate-800 transition-all hover:bg-slate-100/80 active:scale-95 cursor-pointer"
            >
              <Icon name="calendar" size={14} className="text-slate-500" />
              <span>{formatDate(item.dueDate)}</span>
              <Icon
                name="chevron-down"
                size={10}
                className={`text-slate-400 transition-transform duration-200 ${
                  isCalendarSheetOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Description Section */}
        <div
          className={`relative transition-all ${
            activeField === "description" ? "z-40" : "z-10"
          }`}
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Description
          </label>
          <textarea
            ref={descInputRef}
            value={description}
            onFocus={() => setActiveField("description")}
            onChange={(event) => {
              setDescription(event.target.value)
              onUpdate(item.id, { description: event.target.value })
            }}
            onBlur={saveDescription}
            rows={3}
            placeholder="Add description or site notes..."
            className={`w-full resize-none text-[13px] font-normal leading-relaxed text-slate-800 outline-none transition-all placeholder:text-slate-400 ${
              activeField === "description"
                ? "rounded-xl border border-[#0055ff] bg-white p-2.5 -mx-2.5 ring-2 ring-[#0055ff]/15 shadow-2xs"
                : "rounded-xl border border-transparent bg-transparent p-2.5 -mx-2.5 hover:bg-slate-50/70 cursor-text"
            }`}
          />
        </div>

        {/* More Information (Active, Functional & Editable) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              More information
            </label>
            <span className="text-[11px] font-medium text-slate-400">
              Planning &amp; Sign-off
            </span>
          </div>
          <div className="divide-y divide-slate-100 border-y border-slate-100">
            {/* 1. Approver */}
            <PropertyRow icon="approval" label="Approver">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    closeInlineMenus()
                    setIsApproverMenuOpen(!isApproverMenuOpen)
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg py-1 px-1.5 text-left text-[13px] text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-2xs">
                      {approver
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {approver}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {approvalStage === "approved" && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Approved
                      </span>
                    )}
                    <Icon
                      name="chevron-down"
                      size={11}
                      className={`text-slate-400 transition-transform ${
                        isApproverMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                <FloatingMenu
                  open={isApproverMenuOpen}
                  widthClassName="w-52"
                  align="left"
                >
                  <MenuCaption>Change approver</MenuCaption>
                  {availableAssignees.map((user) => {
                    const isSelected = approver === user.name
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setApprover(user.name)
                          setIsApproverMenuOpen(false)
                          showToast(`Approver updated to ${user.name}`)
                        }}
                        className={`flex min-h-8 w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold transition-all duration-150 active:scale-[0.98] ${
                          isSelected
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                            style={{ backgroundColor: user.color }}
                          >
                            {user.initials}
                          </span>
                          <span>{user.name}</span>
                        </div>
                        <MenuCheck active={isSelected} />
                      </button>
                    )
                  })}
                </FloatingMenu>
              </div>
            </PropertyRow>

            {/* 2. Dates */}
            <PropertyRow icon="calendar" label="Dates">
              <button
                type="button"
                onClick={() => {
                  closeInlineMenus()
                  if (item.dueDate) {
                    const [y, m] = item.dueDate.split("-").map(Number)
                    if (!isNaN(y) && !isNaN(m)) {
                      setCalendarViewMonth(new Date(y, m - 1, 1))
                    }
                  }
                  setCalendarTarget({ type: "item" })
                  setIsCalendarSheetOpen(true)
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg py-1 px-1.5 text-left text-[13px] text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-slate-800">
                  {formatDate(item.dueDate)}
                </span>
                <Icon
                  name="chevron-down"
                  size={11}
                  className={`text-slate-400 transition-transform ${
                    isCalendarSheetOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </PropertyRow>

            {/* 3. Progress */}
            <PropertyRow icon="progress" label="Progress">
              <div className="flex items-center gap-3 py-1">
                <div
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId)
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = Math.max(
                      0,
                      Math.min(rect.width, e.clientX - rect.left),
                    )
                    const pct = Math.round((x / rect.width) * 100)
                    onUpdate(item.id, { progress: pct })
                  }}
                  onPointerMove={(e) => {
                    if (e.buttons === 1) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = Math.max(
                        0,
                        Math.min(rect.width, e.clientX - rect.left),
                      )
                      const pct = Math.round((x / rect.width) * 100)
                      onUpdate(item.id, { progress: pct })
                    }
                  }}
                  className="group relative flex h-5 min-w-0 flex-1 cursor-pointer touch-none select-none items-center"
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.progress ?? 0}
                  aria-label="Progress slider"
                >
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                    <div
                      className="h-full rounded-full bg-[#0055ff] transition-all duration-150"
                      style={{ width: `${item.progress ?? 0}%` }}
                    />
                  </div>
                  <div
                    className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white shadow-xs transition-transform group-active:scale-125"
                    style={{ left: `${item.progress ?? 0}%` }}
                  />
                </div>

                {/* Simple last mein percentage */}
                <span className="shrink-0 text-[13px] font-bold text-slate-800 tabular-nums">
                  {item.progress ?? 0}
                  <span
                    style={{
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    %
                  </span>
                </span>
              </div>
            </PropertyRow>

            {/* 4. Watchers */}
            <PropertyRow icon="eye" label="Watchers">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    closeInlineMenus()
                    setIsWatchersMenuOpen(!isWatchersMenuOpen)
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg py-1 px-1.5 text-left text-[13px] text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <AvatarStack assignees={item.assignees || []} limit={3} />
                    <span className="font-semibold text-slate-800">
                      {Math.max(
                        (item.assignees || []).length + (isWatching ? 2 : 1),
                        2,
                      )}{" "}
                      watching
                    </span>
                    {isWatching && (
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9.5px] font-bold text-[#0055ff]">
                        Watching
                      </span>
                    )}
                  </div>
                  <Icon
                    name="chevron-down"
                    size={11}
                    className={`text-slate-400 transition-transform ${
                      isWatchersMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <FloatingMenu
                  open={isWatchersMenuOpen}
                  widthClassName="w-52"
                  align="left"
                >
                  <MenuCaption>Watch preferences</MenuCaption>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isWatching
                      setIsWatching(next)
                      showToast(
                        next
                          ? "You are now watching this task"
                          : "You stopped watching this task",
                      )
                      setIsWatchersMenuOpen(false)
                    }}
                    className="flex min-h-8 w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-150 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        name="eye"
                        size={13}
                        className={
                          isWatching ? "text-[#0055ff]" : "text-slate-400"
                        }
                      />
                      <span>{isWatching ? "Stop watching" : "Watch task"}</span>
                    </div>
                    <MenuCheck active={isWatching} />
                  </button>
                </FloatingMenu>
              </div>
            </PropertyRow>

            {/* 5. Tags */}
            <PropertyRow icon="tag" label="Tags">
              <div className="relative">
                <div className="flex flex-wrap items-center gap-1.5 py-1">
                  {(item.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const next = (item.tags || []).filter(
                            (t) => t !== tag,
                          )
                          onUpdate(item.id, { tags: next })
                        }}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Remove tag"
                      >
                        <Icon name="close" size={10} />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      closeInlineMenus()
                      setIsTagsMenuOpen(!isTagsMenuOpen)
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:border-[#0055ff] hover:text-[#0055ff] transition-colors cursor-pointer"
                  >
                    <Icon name="plus" size={10} />
                    <span>Add tag</span>
                  </button>
                </div>

                <FloatingMenu
                  open={isTagsMenuOpen}
                  widthClassName="w-56"
                  align="left"
                >
                  <MenuCaption>Manage tags</MenuCaption>
                  <div className="max-h-44 overflow-y-auto space-y-0.5">
                    {commonTagOptions.map((tag) => {
                      const isSelected = (item.tags || []).includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const currentTags = item.tags || []
                            const next = isSelected
                              ? currentTags.filter((t) => t !== tag)
                              : [...currentTags, tag]
                            onUpdate(item.id, { tags: next })
                          }}
                          className={`flex min-h-7 w-full items-center justify-between rounded-lg px-2.5 py-1 text-left text-[11.5px] font-semibold transition-all ${
                            isSelected
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>#{tag}</span>
                          <MenuCheck active={isSelected} />
                        </button>
                      )
                    })}
                  </div>
                  <div className="border-t border-slate-100 p-2 flex gap-1">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newTagInput.trim()) {
                          const clean = newTagInput.trim().replace(/^#/, "")
                          const next = [...(item.tags || []), clean]
                          onUpdate(item.id, { tags: next })
                          setNewTagInput("")
                        }
                      }}
                      placeholder="Custom tag..."
                      className="h-7 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-[11px] outline-none focus:border-[#0055ff]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTagInput.trim()) {
                          const clean = newTagInput.trim().replace(/^#/, "")
                          const next = [...(item.tags || []), clean]
                          onUpdate(item.id, { tags: next })
                          setNewTagInput("")
                        }
                      }}
                      className="h-7 rounded-lg bg-[#0055ff] px-2 text-[10.5px] font-bold text-white hover:bg-blue-600 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </FloatingMenu>
              </div>
            </PropertyRow>

            {/* 6. Phase */}
            <PropertyRow icon="sliders" label="Phase">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    closeInlineMenus()
                    setIsPhaseMenuOpen(!isPhaseMenuOpen)
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg py-1 px-1.5 text-left text-[13px] text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-slate-800">
                    {item.phase || "Construction Execution"}
                  </span>
                  <Icon
                    name="chevron-down"
                    size={11}
                    className={`text-slate-400 transition-transform ${
                      isPhaseMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <FloatingMenu
                  open={isPhaseMenuOpen}
                  widthClassName="w-56"
                  align="left"
                >
                  <MenuCaption>Select project phase</MenuCaption>
                  {phaseOptions.map((ph) => {
                    const isSelected =
                      (item.phase || "Construction Execution") === ph
                    return (
                      <button
                        key={ph}
                        type="button"
                        onClick={() => {
                          onUpdate(item.id, { phase: ph })
                          setIsPhaseMenuOpen(false)
                          showToast(`Phase set to ${ph}`)
                        }}
                        className={`flex min-h-8 w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold transition-all duration-150 active:scale-[0.98] ${
                          isSelected
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{ph}</span>
                        <MenuCheck active={isSelected} />
                      </button>
                    )
                  })}
                </FloatingMenu>
              </div>
            </PropertyRow>

            {/* 7. Category */}
            <PropertyRow icon="description" label="Category">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    closeInlineMenus()
                    setIsCategoryMenuOpen(!isCategoryMenuOpen)
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg py-1 px-1.5 text-left text-[13px] text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-slate-800">
                    {item.category || "MEP · HVAC"}
                  </span>
                  <Icon
                    name="chevron-down"
                    size={11}
                    className={`text-slate-400 transition-transform ${
                      isCategoryMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <FloatingMenu
                  open={isCategoryMenuOpen}
                  widthClassName="w-56"
                  align="left"
                >
                  <MenuCaption>Select category</MenuCaption>
                  {categoryOptions.map((cat) => {
                    const isSelected = (item.category || "MEP · HVAC") === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          onUpdate(item.id, { category: cat })
                          setIsCategoryMenuOpen(false)
                          showToast(`Category set to ${cat}`)
                        }}
                        className={`flex min-h-8 w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold transition-all duration-150 active:scale-[0.98] ${
                          isSelected
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{cat}</span>
                        <MenuCheck active={isSelected} />
                      </button>
                    )
                  })}
                </FloatingMenu>
              </div>
            </PropertyRow>

            {/* 8. Location */}
            <PropertyRow icon="map" label="Location" last>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    closeInlineMenus()
                    setIsLocationMenuOpen(!isLocationMenuOpen)
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg py-1 px-1.5 text-left text-[13px] text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-slate-800">
                    {item.location?.label || "Level 03 — Corridor"}
                  </span>
                  <Icon
                    name="chevron-down"
                    size={11}
                    className={`text-slate-400 transition-transform ${
                      isLocationMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <FloatingMenu
                  open={isLocationMenuOpen}
                  widthClassName="w-56"
                  align="left"
                >
                  <MenuCaption>Select location</MenuCaption>
                  {locationOptions.map((loc) => {
                    const isSelected =
                      (item.location?.label || "Level 03 — Corridor") === loc
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          onUpdate(item.id, {
                            location: {
                              ...item.location,
                              label: loc,
                              lat: item.location?.lat || 25.1972,
                              lng: item.location?.lng || 55.2744,
                            },
                          })
                          setIsLocationMenuOpen(false)
                          showToast(`Location set to ${loc}`)
                        }}
                        className={`flex min-h-8 w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold transition-all duration-150 active:scale-[0.98] ${
                          isSelected
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{loc}</span>
                        <MenuCheck active={isSelected} />
                      </button>
                    )
                  })}
                </FloatingMenu>
              </div>
            </PropertyRow>
          </div>
        </div>

        {/* BIMBOX Elegant Brand Watermark */}
        <div className="mt-10 mb-6 flex flex-col items-center justify-center select-none pointer-events-none py-4">
          <div className="flex flex-col items-center gap-2.5 opacity-20 transition-opacity">
            {/* BIMBOX Icon Mark */}
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200/80 to-slate-300/80 p-2 shadow-inner">
              <svg viewBox="0 0 46 46" fill="none" className="h-full w-full">
                <rect width="46" height="46" rx="11" fill="#0055ff" />
                <path
                  d="M13.5 19.5C13.5 20.6 14.4 21.5 15.5 21.5H20.5C21.6 21.5 22.5 20.6 22.5 19.5V18H26.5V24.5C26.5 25.6 27.4 26.5 28.5 26.5H29.5C30.6 26.5 31.5 25.6 31.5 24.5V16C31.5 14.34 30.16 13 28.5 13H15.5C14.4 13 13.5 13.9 13.5 15V19.5Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* BIMBOX Official Vector Wordmark */}
            <svg
              width="88"
              height="19"
              viewBox="0 0 152 32"
              fill="none"
              className="text-slate-800"
            >
              {/* Letter B */}
              <path
                d="M0.0341187 5.68102C0.0341187 2.56424 2.53675 0.0372009 5.62205 0.0372009H11.824C13.1927 0.0372009 14.5709 0.135031 15.9546 0.33069C17.3397 0.52635 18.5814 0.916291 19.684 1.50327C20.7852 2.08887 21.679 2.90871 22.364 3.96142C23.049 5.01412 23.3915 6.41267 23.3915 8.1557C23.3915 9.89872 22.8921 11.4557 21.896 12.6421C20.8985 13.8298 19.5803 14.6786 17.9442 15.1898V15.2794C18.9853 15.4296 19.931 15.723 20.7798 16.1585C21.6285 16.5952 22.3572 17.1505 22.9685 17.8271C23.5785 18.5036 24.0479 19.2931 24.3754 20.1943C24.7029 21.0968 24.8667 22.0586 24.8667 23.0809C24.8667 24.7647 24.5091 26.1702 23.7955 27.2973C23.0804 28.4244 22.158 29.3338 21.0267 30.0255C19.8955 30.7172 18.6224 31.2132 17.2087 31.5136C15.7936 31.814 14.3867 31.9642 12.988 31.9642H5.62478C2.53675 31.9655 0.0341187 29.4385 0.0341187 26.3217V5.68102ZM7.00164 10.8026C7.00164 11.9049 7.88725 12.7992 8.97891 12.7992H12.0478C12.5841 12.7992 13.1122 12.7399 13.6335 12.6187C14.1534 12.4988 14.6228 12.3031 15.0403 12.0331C15.4565 11.763 15.7922 11.402 16.0447 10.9514C16.2971 10.5009 16.424 9.95935 16.424 9.32828C16.424 8.69721 16.2821 8.1185 15.9996 7.68171C15.7158 7.24629 15.3528 6.90871 14.9053 6.66758C14.459 6.42783 13.9514 6.25422 13.3865 6.1495C12.8202 6.04478 12.2703 5.99104 11.734 5.99104H7.00027V10.804L7.00164 10.8026ZM7.00164 24.5608C7.00164 25.3627 7.64572 26.0117 8.43854 26.0117H13.2528C13.789 26.0117 14.3321 25.9525 14.8834 25.8312C15.4333 25.7113 15.9328 25.5005 16.379 25.2001C16.8252 24.8998 17.1896 24.5084 17.4734 24.0276C17.7559 23.5467 17.8978 22.9611 17.8978 22.2694C17.8978 21.5184 17.7108 20.9094 17.3397 20.4423C16.9671 19.9766 16.4977 19.6238 15.9328 19.3827C15.3665 19.143 14.7565 18.9762 14.1015 18.8867C13.4465 18.7971 12.8352 18.7516 12.2703 18.7516H7.00027V24.5608H7.00164Z"
                fill="currentColor"
              />
              {/* Letter I */}
              <path
                d="M25.8069 0.0372009H30.3277C31.6787 0.0372009 32.7744 1.14364 32.7744 2.50775V31.9642H28.2113C26.8835 31.9642 25.8069 30.877 25.8069 29.5363V0.0372009Z"
                fill="currentColor"
              />
              {/* Letter M */}
              <path
                d="M36.9526 0.0372009H42.3795C44.3882 0.0372009 46.1785 1.31588 46.8471 3.22838L53.0109 20.8708H53.0996L59.0219 4.0248C59.8624 1.63417 62.1031 0.0372009 64.6152 0.0372009H70.9196V31.9642H69.3735C66.3796 31.9642 63.9534 29.5143 63.9534 26.4912V7.47778H63.8647L55.998 30.6662C55.7346 31.4433 55.0114 31.9642 54.1981 31.9642H51.6177C50.7962 31.9642 50.0689 31.4323 49.811 30.6455L42.2471 7.47778H42.1584V28.9204C42.1584 30.6014 40.8089 31.9655 39.1427 31.9655H35.1909V1.81467C35.1909 0.833618 35.9796 0.0372009 36.9512 0.0372009H36.9526Z"
                fill="currentColor"
              />
              {/* Letter B */}
              <path
                d="M63.5688 5.68101C63.5688 2.56424 66.0715 0.0385742 69.1568 0.0385742H75.3588C76.7274 0.0385742 78.1057 0.136404 79.4893 0.332064C80.8744 0.527723 82.1161 0.917665 83.2187 1.50464C84.3199 2.09024 85.2137 2.91009 85.8988 3.96279C86.5838 5.01549 86.9263 6.41405 86.9263 8.15707C86.9263 9.9001 86.4268 11.4571 85.4307 12.6435C84.4332 13.8312 83.115 14.68 81.4789 15.1912V15.2807C82.5201 15.4309 83.4657 15.7244 84.3145 16.1598C85.1632 16.5966 85.8919 17.1519 86.5033 17.8284C87.1132 18.505 87.5826 19.2945 87.9101 20.1957C88.2376 21.0982 88.4014 22.0599 88.4014 23.0823C88.4014 24.7661 88.0439 26.1715 87.3302 27.2986C86.6152 28.4258 85.6927 29.3352 84.5615 30.0269C83.4302 30.7186 82.1571 31.2146 80.7434 31.515C79.3283 31.8154 77.9215 31.9655 76.5228 31.9655H69.1595C66.0728 31.9655 63.5716 29.4385 63.5716 26.3231V5.68101H63.5688ZM70.535 9.85049C70.535 11.4792 71.8423 12.8005 73.4566 12.8005H75.5826C76.1188 12.8005 76.6469 12.7413 77.1682 12.62C77.6881 12.5002 78.1575 12.3045 78.5751 12.0344C78.9913 11.7644 79.327 11.4034 79.5794 10.9528C79.8319 10.5022 79.9588 9.96072 79.9588 9.32965C79.9588 8.69858 79.8168 8.11987 79.5344 7.68308C79.2505 7.24767 78.8876 6.91009 78.44 6.66896C77.9938 6.4292 77.4861 6.25559 76.9212 6.15087C76.3549 6.04615 75.805 5.99242 75.2687 5.99242H70.535V9.85187V9.85049ZM70.535 22.9914C70.535 24.66 71.8737 26.0117 73.5262 26.0117H76.7875C77.3238 26.0117 77.8669 25.9525 78.4181 25.8312C78.9681 25.7113 79.4675 25.5005 79.9137 25.2001C80.3599 24.8998 80.7243 24.5084 81.0081 24.0276C81.2906 23.5467 81.4325 22.9611 81.4325 22.2694C81.4325 21.5184 81.2456 20.9094 80.8744 20.4423C80.5019 19.9766 80.0324 19.6238 79.4675 19.3827C78.9012 19.1429 78.2912 18.9762 77.6363 18.8867C76.9813 18.7971 76.3699 18.7516 75.805 18.7516H70.535V22.9914Z"
                fill="currentColor"
              />
              {/* Letter O */}
              <path
                d="M123.206 12.9466L117.719 3.58801C116.431 1.39028 114.05 0.0372009 111.472 0.0372009H101.08C98.5032 0.0372009 96.1221 1.39028 94.8325 3.58801L89.3456 12.9466C88.2403 14.8302 88.2403 17.1726 89.3456 19.0561L94.8325 28.4147C96.1207 30.6125 98.5019 31.9655 101.08 31.9655H111.472C114.048 31.9655 116.43 30.6125 117.719 28.4147L123.206 19.0561C124.311 17.1726 124.311 14.8302 123.206 12.9466ZM115.028 17.0927L111.903 22.4223C111.328 23.4047 110.263 24.0096 109.11 24.0096H103.442C102.29 24.0096 101.226 23.4047 100.648 22.4223L97.5235 17.0927C97.1291 16.4189 97.1291 15.5825 97.5235 14.9087L100.648 9.57905C101.224 8.59662 102.289 7.99173 103.442 7.99173H109.11C110.262 7.99173 111.326 8.59662 111.903 9.57905L115.028 14.9087C115.423 15.5825 115.423 16.4189 115.028 17.0927Z"
                fill="currentColor"
              />
              {/* Letter X */}
              <path
                d="M127.987 13.1023L118.521 0.0344543H125.437C126.892 0.0344543 128.247 0.781268 129.034 2.01723L134.898 11.2201L140.857 1.47986C141.405 0.582852 142.377 0.0358322 143.421 0.0358322H150.659L141.131 13.3545C140.367 14.4223 140.368 15.865 141.134 16.9301L151.932 31.9656H144.863C143.504 31.9656 142.239 31.267 141.505 30.1123L134.518 19.1126L127.683 30.1936C127.004 31.2959 125.807 31.9669 124.521 31.9669H117.86L128.02 17.4799C128.943 16.1654 128.929 14.403 127.987 13.1037V13.1023Z"
                fill="currentColor"
              />
            </svg>

            {/* Subtitle / Tagline */}
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              <span>SiteSync</span>
              <span>•</span>
              <span>Construction OS</span>
            </div>
          </div>
        </div>

        {/* Approval Banner reflecting the current sign-off stage */}
        {(approvalStage === "approved" ||
          approvalStage === "sent" ||
          approvalStage === "sent-back") && (
          <button
            type="button"
            onClick={() => selectTab("approval")}
            className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors cursor-pointer ${
              approvalStage === "approved"
                ? "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50"
                : approvalStage === "sent"
                  ? "border-blue-200 bg-blue-50/60 hover:bg-blue-50"
                  : "border-amber-200 bg-amber-50/60 hover:bg-amber-50"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                approvalStage === "approved"
                  ? "bg-emerald-100 text-emerald-700"
                  : approvalStage === "sent"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              <Icon
                name={
                  approvalStage === "approved"
                    ? "check"
                    : approvalStage === "sent"
                      ? "clock"
                      : "return"
                }
                size={16}
              />
            </span>
            <div className="min-w-0 flex-1">
              <span
                className={`block text-[12px] font-bold ${
                  approvalStage === "approved"
                    ? "text-emerald-800"
                    : approvalStage === "sent"
                      ? "text-blue-800"
                      : "text-amber-800"
                }`}
              >
                {approvalStage === "approved"
                  ? `Approved by ${approver}`
                  : approvalStage === "sent"
                    ? `Awaiting sign-off from ${approver}`
                    : `Sent back by ${approver}`}
              </span>
              <span
                className={`mt-0.5 block text-[11px] ${
                  approvalStage === "approved"
                    ? "text-emerald-700"
                    : approvalStage === "sent"
                      ? "text-blue-700"
                      : "text-amber-700"
                }`}
              >
                {approvalStage === "approved"
                  ? `${approvalTimes.decided} · Final sign-off complete`
                  : approvalStage === "sent"
                    ? `Sent ${approvalTimes.sent}`
                    : `${approvalTimes.decided} · Changes requested`}
              </span>
            </div>
            <Icon
              name="chevron-right"
              size={16}
              className={
                approvalStage === "approved"
                  ? "text-emerald-700"
                  : approvalStage === "sent"
                    ? "text-blue-700"
                    : "text-amber-700"
              }
            />
          </button>
        )}
      </div>
    )
  }

  const renderActivity = () => (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <SectionHeading title="Activity" />

        <div className="pt-2">
          {activityEntries.map((entry, index) => {
            const isLast = index === activityEntries.length - 1
            return (
              <div key={entry.id} className="flex items-stretch gap-3.5">
                {/* Perfectly centered timeline spine */}
                <div className="flex w-8 shrink-0 flex-col items-center">
                  <span
                    className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold text-white shadow-2xs ring-4 ring-white"
                    style={{ backgroundColor: entry.color }}
                  >
                    {entry.avatar}
                  </span>
                  {!isLast && (
                    <div className="w-[1.5px] flex-1 bg-slate-200/90" />
                  )}
                </div>

                {/* Activity content */}
                <div
                  className={`min-w-0 flex-1 pt-1 ${isLast ? "pb-2" : "pb-6"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-slate-900">
                      {entry.user}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 shrink-0">
                      {entry.date}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-[19px] text-slate-600">
                    {entry.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        className="shrink-0 border-t border-slate-100 bg-white px-4 py-3"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 transition-colors focus-within:bg-white focus-within:border-[#0055ff]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Add attachment"
          >
            <Icon name="paperclip" size={16} />
          </button>
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            onKeyDown={handleCommentKeyDown}
            placeholder="Write a comment..."
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={addComment}
            disabled={!comment.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0055ff] text-white transition-opacity disabled:opacity-30 cursor-pointer"
            aria-label="Send comment"
          >
            <Icon name="send" size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  const docTypeStyles: Record<DocumentAttachment["type"], {
    chip: string
    label: string
  }> = {
    pdf: { chip: "bg-rose-50 text-rose-600", label: "PDF" },
    dwg: { chip: "bg-sky-50 text-sky-600", label: "CAD" },
    sheet: { chip: "bg-violet-50 text-violet-600", label: "SHT" },
  }

  const docsForFilter = (filter: AttachmentFilter) =>
    documents.filter((doc) => {
      if (filter === "PDFs") return doc.type === "pdf"
      if (filter === "Sheets") return doc.type === "sheet"
      if (filter === "CAD") return doc.type === "dwg"
      return true
    })

  const attachmentFilterCount = (filter: AttachmentFilter) => {
    if (filter === "All")
      return tagRecords.length + imageAttachments.length + documents.length
    if (filter === "Tags") return tagRecords.length
    if (filter === "Images") return imageAttachments.length
    if (filter === "Snap") return snapFrames.length + returnSnaps.length
    return docsForFilter(filter).length
  }

  const removeImage = (id: string) => {
    setImageAttachments((current) => {
      const next = current.filter((image) => image.id !== id)
      setActivePhotoIndex((index) =>
        Math.max(0, Math.min(index, next.length - 1)),
      )
      return next
    })
    showToast("Image removed")
  }

  /* The 5 capture sources shown whenever a filter has nothing in it yet. */
  const renderAttachmentSources = (caption: string) => (
    <div className="flex min-h-[260px] flex-col items-center justify-center py-6">
      <p className="mb-5 max-w-[230px] text-center text-[11.5px] leading-[16px] text-slate-400">
        {caption}
      </p>
      <div className="flex w-full flex-wrap justify-center gap-2.5">
        {attachmentSources.map((source) => (
          <button
            type="button"
            key={source.id}
            onClick={() => {
              if (source.id === "captures") {
                if (onOpenCaptures) onOpenCaptures()
                else showToast("Captures unavailable")
                return
              }
              if (source.id === "map" || source.id === "drawing") {
                fileInputRef.current?.click()
                return
              }
              showToast(`Capture from ${source.label}`)
            }}
            className="flex w-[calc(33.333%-7px)] cursor-pointer flex-col items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white px-2 py-4 transition-all duration-150 hover:border-[#0055ff]/40 hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)] active:scale-[0.97]"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${source.tint} ${source.fg}`}
            >
              <Icon name={source.icon} size={21} />
            </span>
            <span className="text-center text-[11.5px] font-semibold leading-tight text-slate-700">
              {source.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )

  const renderTagsSection = () => {
    if (tagRecords.length === 0)
      return renderAttachmentSources(
        "No locations tagged yet. Pick a source to link this record to the model.",
      )

    return (
      <div className="space-y-2.5">
        {tagRecords.map((tag) => {
          const isActive = activeTagId === tag.id
          return (
            <div
              key={tag.id}
              className={`relative overflow-hidden rounded-2xl transition-all duration-200 ${
                isActive ? "ring-2 ring-[#0055ff]" : "ring-1 ring-slate-200/90"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTagId(isActive ? null : tag.id)}
                className="block w-full cursor-pointer text-left"
              >
                <img
                  src={tag.image}
                  alt={tag.element}
                  className="h-[148px] w-full bg-slate-100 object-cover"
                />
                <span className="absolute left-2.5 top-2.5 rounded-md bg-white/92 px-2 py-[3px] text-[9.5px] font-bold uppercase tracking-wide text-slate-700 shadow-2xs backdrop-blur-sm">
                  {tag.kind}
                </span>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-2 bg-gradient-to-t from-slate-950/88 via-slate-950/45 to-transparent px-3 pb-2.5 pt-9">
                  <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold text-white">
                    {tag.element}
                  </span>
                  <span className="shrink-0 text-[10.5px] font-bold text-white">
                    {tag.level}
                  </span>
                </div>
              </button>

              {isActive && (
                <button
                  type="button"
                  onClick={() => showToast(`Opening ${tag.level} in viewer`)}
                  className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[11.5px] font-semibold text-[#0055ff] shadow-[0_8px_22px_rgba(15,23,42,0.28)] transition-transform duration-150 active:scale-95"
                >
                  <Icon name="eye" size={14} /> Open viewer
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setTagRecords((current) =>
                    current.filter((entry) => entry.id !== tag.id),
                  )
                  showToast("Location unlinked")
                }}
                className="absolute right-2.5 top-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-slate-950/45 text-white/90 backdrop-blur-sm transition-colors hover:bg-slate-950/70"
                aria-label={`Unlink ${tag.element}`}
              >
                <Icon name="close" size={13} />
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  const renderImagesSection = () => {
    if (imageAttachments.length === 0)
      return renderAttachmentSources(
        "No images captured yet. Choose a source to bring visuals into this record.",
      )

    const safeIndex = Math.min(activePhotoIndex, imageAttachments.length - 1)
    const activeImage = imageAttachments[safeIndex]

    if (attachmentView === "grid")
      return (
        <div className="grid grid-cols-2 gap-2.5">
          {imageAttachments.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => {
                setActivePhotoIndex(index)
                setIsPreviewOpen(true)
              }}
              className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200/90 bg-white text-left shadow-2xs transition-shadow hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
            >
              <img
                src={image.src}
                alt={image.name}
                className="h-28 w-full bg-slate-100 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="p-2">
                <span className="block truncate text-[11.5px] font-semibold text-slate-800">
                  {image.name}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {image.size} · {image.date}
                </span>
              </div>
            </button>
          ))}
        </div>
      )

    if (attachmentView === "list")
      return (
        <div className="divide-y divide-slate-100 border-y border-slate-100">
          {imageAttachments.map((image, index) => (
            <div
              key={image.id}
              className="flex items-center gap-3 py-2.5 transition-colors hover:bg-slate-50/50"
            >
              <img
                src={image.src}
                alt=""
                className="h-10 w-12 shrink-0 rounded-lg bg-slate-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-slate-800">
                  {image.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {image.size} · {image.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActivePhotoIndex(index)
                  setIsPreviewOpen(true)
                }}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-600 active:scale-95"
                aria-label={`Preview ${image.name}`}
              >
                <Icon name="eye" size={15} />
              </button>
            </div>
          ))}
        </div>
      )

    /* Gallery view — the dark stage with counter, tools, arrows and filmstrip. */
    return (
      <div className="space-y-2.5">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="relative aspect-[4/3] w-full bg-slate-100/70">
            <img
              src={activeImage.src}
              alt={activeImage.name}
              className="absolute inset-0 h-full w-full object-contain"
            />

            <span className="absolute left-3 top-3 rounded-lg bg-white/85 px-2 py-1 text-[10.5px] font-bold text-slate-800 shadow-2xs backdrop-blur-md">
              {safeIndex + 1}
              <span className="ml-1 font-medium text-slate-400">
                of {imageAttachments.length}
              </span>
            </span>

            <div className="absolute right-2.5 top-2.5 flex items-center gap-0.5">
              {([
                { icon: "eye", label: "Open preview" },
                { icon: "download", label: "Download image" },
                { icon: "trash", label: "Delete image" },
              ] as const).map((tool) => (
                <button
                  type="button"
                  key={tool.icon}
                  onClick={() => {
                    if (tool.icon === "eye") setIsPreviewOpen(true)
                    else if (tool.icon === "download")
                      showToast("Download started")
                    else removeImage(activeImage.id)
                  }}
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/85 shadow-2xs backdrop-blur-md transition-colors active:scale-95 ${
                    tool.icon === "trash"
                      ? "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      : "text-slate-500 hover:bg-white hover:text-[#0055ff]"
                  }`}
                  aria-label={tool.label}
                >
                  <Icon name={tool.icon} size={15} />
                </button>
              ))}
            </div>

            {imageAttachments.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIndex(
                      safeIndex === 0
                        ? imageAttachments.length - 1
                        : safeIndex - 1,
                    )
                  }
                  className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-slate-600 shadow-2xs backdrop-blur-md transition-colors hover:bg-white hover:text-[#0055ff] active:scale-95"
                  aria-label="Previous image"
                >
                  <Icon name="chevron-left" size={20} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIndex(
                      safeIndex === imageAttachments.length - 1
                        ? 0
                        : safeIndex + 1,
                    )
                  }
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-slate-600 shadow-2xs backdrop-blur-md transition-colors hover:bg-white hover:text-[#0055ff] active:scale-95"
                  aria-label="Next image"
                >
                  <Icon name="chevron-right" size={20} />
                </button>
              </>
            )}
          </div>

          <div className="flex items-end gap-3 border-t border-slate-200/80 bg-white px-3.5 py-2.5">
            <p className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-slate-800">
              {activeImage.name}
            </p>
            <span className="shrink-0 text-[10.5px] font-medium text-slate-400">
              {activeImage.size} · {activeImage.date}
            </span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          {imageAttachments.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setActivePhotoIndex(index)}
              className={`h-14 w-[68px] shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-150 ${
                index === safeIndex
                  ? "border-[#0055ff] opacity-100"
                  : "border-transparent opacity-55 hover:opacity-80"
              }`}
              aria-label={`View ${image.name}`}
            >
              <img
                src={image.src}
                alt=""
                className="h-full w-full bg-slate-100 object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderDocsSection = (filter: AttachmentFilter) => {
    const list = docsForFilter(filter)
    if (list.length === 0)
      return renderAttachmentSources(
        `No ${
          filter === "All" ? "documents" : filter.toLowerCase()
        } attached yet. Pick a source to add one.`,
      )

    if (attachmentView === "grid")
      return (
        <div className="grid grid-cols-2 gap-2.5">
          {list.map((doc) => (
            <button
              type="button"
              key={doc.id}
              onClick={() => setPreviewDocument(doc)}
              className="cursor-pointer rounded-xl border border-slate-200/90 bg-white p-3 text-left transition-shadow hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-[10.5px] font-bold ${docTypeStyles[doc.type].chip}`}
              >
                {docTypeStyles[doc.type].label}
              </span>
              <p className="mt-2.5 line-clamp-2 text-[11.5px] font-semibold leading-[15px] text-slate-800">
                {doc.name}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                {doc.size} · {doc.date}
              </p>
            </button>
          ))}
        </div>
      )

    return (
      <div className="divide-y divide-slate-100 border-y border-slate-100">
        {list.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 py-2.5 transition-colors hover:bg-slate-50/50"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10.5px] font-bold ${docTypeStyles[doc.type].chip}`}
            >
              {docTypeStyles[doc.type].label}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-slate-800">
                {doc.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {doc.size} · Uploaded by {doc.author}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewDocument(doc)}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-600 active:scale-95"
              aria-label={`Preview ${doc.name}`}
            >
              <Icon name="eye" size={15} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  const renderSnapSection = () => {
    const activeSnap =
      snapFrames[Math.min(activeSnapIndex, snapFrames.length - 1)]

    const frameStrip = (
      frames: SnapFrame[],
      activeIndex: number,
      onPick: (index: number) => void,
      onAdd: () => void,
      numbered: boolean,
    ) => (
      <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {frames.map((frame, index) => (
          <button
            type="button"
            key={frame.id}
            onClick={() => onPick(index)}
            className={`relative h-[58px] w-[62px] shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-150 ${
              index === activeIndex
                ? "border-[#0055ff]"
                : "border-slate-200 opacity-70 hover:opacity-100"
            }`}
            aria-label={frame.name}
          >
            <img
              src={frame.src}
              alt=""
              className="h-full w-full bg-slate-100 object-cover"
            />
            {numbered && (
              <span className="absolute bottom-1 left-1 flex h-4 w-4 items-center justify-center rounded-[5px] bg-slate-950/70 text-[9px] font-bold text-white">
                {index + 1}
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="flex h-[58px] w-[62px] shrink-0 cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-dashed border-slate-200 text-slate-300 transition-colors hover:border-[#0055ff]/50 hover:text-[#0055ff] active:bg-slate-50"
          aria-label="Add frame"
        >
          <Icon name="image-plus" size={19} />
        </button>
      </div>
    )

    const sectionLabel = (icon: IconName, title: string, meta: string) => (
      <div className="flex items-center gap-2.5">
        <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-bold text-slate-800">
          <Icon name={icon} size={14} className="text-slate-400" />
          {title}
        </span>
        <span className="h-px flex-1 bg-slate-100" />
        <span className="shrink-0 text-[10.5px] font-medium text-slate-400">
          {meta}
        </span>
      </div>
    )

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-[15px] font-bold leading-snug text-slate-900">
            Snap
          </h2>
          <p className="mt-1 text-[11.5px] leading-[16px] text-slate-500">
            The photo or viewer capture behind this record — and what came back
            from site against it.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={snapFrames.length === 0 || returnSnaps.length === 0}
            onClick={() => {
              setComparePosition(52)
              setIsCompareOpen(true)
            }}
            className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Icon name="compare" size={15} /> Compare
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0055ff] text-[12px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 active:scale-[0.98]"
          >
            <Icon name="image-plus" size={15} /> Add snap
          </button>
        </div>

        {sectionLabel(
          "camera",
          "Snap",
          `${snapFrames.length} frame${snapFrames.length === 1 ? "" : "s"}`,
        )}

        {frameStrip(
          snapFrames,
          Math.min(activeSnapIndex, snapFrames.length - 1),
          setActiveSnapIndex,
          () => fileInputRef.current?.click(),
          false,
        )}

        {activeSnap ? (
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100">
            <img
              src={activeSnap.src}
              alt={activeSnap.name}
              className="h-[210px] w-full object-cover"
            />
            <span className="absolute bottom-2.5 left-3 rounded-lg bg-white/90 px-2 py-1 text-[10.5px] font-semibold text-slate-700 shadow-2xs backdrop-blur-md">
              {activeSnap.label}
            </span>
          </div>
        ) : (
          <div className="flex h-[140px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-[11.5px] text-slate-400">
            No snap captured yet
          </div>
        )}

        {sectionLabel(
          "return",
          "Return snap",
          `${returnSnaps.length} return${returnSnaps.length === 1 ? "" : "s"}`,
        )}

        {frameStrip(
          returnSnaps,
          Math.min(activeReturnIndex, returnSnaps.length - 1),
          setActiveReturnIndex,
          () => fileInputRef.current?.click(),
          true,
        )}

        <div className="flex items-center gap-2.5 border-t border-slate-100 pt-3.5">
          <button
            type="button"
            onClick={() => showToast("Marking frame in viewer")}
            className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-slate-100 px-3 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
          >
            <Icon name="marker" size={13} /> Mark in viewer
          </button>
          <p className="min-w-0 flex-1 text-[10.5px] leading-[14px] text-slate-400">
            Pick any frame to view it, or hit Compare to wipe the two together
          </p>
        </div>
      </div>
    )
  }

  const renderAllOverviewSection = () => {
    if (attachmentFilterCount("All") === 0) {
      return renderAttachmentSources(
        "Nothing attached yet. Pick a source to capture or link the first record.",
      )
    }

    return (
      <div className="space-y-6">
        {/* Tagged locations glimpse */}
        {tagRecords.length > 0 && (
          <section>
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setAttachmentFilter("Tags")}
                className="group flex cursor-pointer items-center gap-1.5 text-left transition-colors"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0055ff]">
                  Tagged locations
                </span>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 group-hover:bg-blue-50 group-hover:text-[#0055ff]">
                  {tagRecords.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAttachmentFilter("Tags")}
                className="flex cursor-pointer items-center gap-0.5 text-[11.5px] font-semibold text-[#0055ff] hover:underline"
              >
                <span>View all</span>
                <Icon name="chevron-right" size={13} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {tagRecords.slice(0, 2).map((tag) => (
                <div
                  key={tag.id}
                  onClick={() => showToast(`Opening ${tag.level} in viewer`)}
                  className="group flex cursor-pointer items-center gap-3 py-2.5 transition-colors hover:bg-slate-50/70"
                >
                  <img
                    src={tag.image}
                    alt={tag.element}
                    className="h-10 w-12 shrink-0 rounded-lg bg-slate-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600">
                        {tag.kind}
                      </span>
                      <p className="truncate text-[12px] font-semibold text-slate-800 group-hover:text-[#0055ff]">
                        {tag.element}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {tag.level} · 3D Model
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      showToast(`Opening ${tag.level} in viewer`)
                    }}
                    className="flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-slate-100 px-2.5 text-[10.5px] font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#0055ff]"
                  >
                    <Icon name="eye" size={12} />
                    <span>View</span>
                  </button>
                </div>
              ))}
            </div>

            {tagRecords.length > 2 && (
              <button
                type="button"
                onClick={() => setAttachmentFilter("Tags")}
                className="flex w-full cursor-pointer items-center justify-center gap-1 pt-2 text-[11.5px] font-semibold text-[#0055ff] hover:underline"
              >
                <span>See all {tagRecords.length} locations</span>
                <Icon name="arrow-right" size={11} />
              </button>
            )}
          </section>
        )}

        {/* Images glimpse */}
        {imageAttachments.length > 0 && (
          <section>
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setAttachmentFilter("Images")}
                className="group flex cursor-pointer items-center gap-1.5 text-left transition-colors"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0055ff]">
                  Images
                </span>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 group-hover:bg-blue-50 group-hover:text-[#0055ff]">
                  {imageAttachments.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAttachmentFilter("Images")}
                className="flex cursor-pointer items-center gap-0.5 text-[11.5px] font-semibold text-[#0055ff] hover:underline"
              >
                <span>View all</span>
                <Icon name="chevron-right" size={13} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {imageAttachments.slice(0, 2).map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => {
                    setActivePhotoIndex(index)
                    setIsPreviewOpen(true)
                  }}
                  className="group flex cursor-pointer items-center gap-3 py-2.5 transition-colors hover:bg-slate-50/70"
                >
                  <img
                    src={image.src}
                    alt={image.name}
                    className="h-10 w-12 shrink-0 rounded-lg bg-slate-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-slate-800 group-hover:text-[#0055ff]">
                      {image.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {image.size} · {image.date}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActivePhotoIndex(index)
                      setIsPreviewOpen(true)
                    }}
                    className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label={`Preview ${image.name}`}
                  >
                    <Icon name="eye" size={14} />
                  </button>
                </div>
              ))}
            </div>

            {imageAttachments.length > 2 && (
              <button
                type="button"
                onClick={() => setAttachmentFilter("Images")}
                className="flex w-full cursor-pointer items-center justify-center gap-1 pt-2 text-[11.5px] font-semibold text-[#0055ff] hover:underline"
              >
                <span>See all {imageAttachments.length} images</span>
                <Icon name="arrow-right" size={11} />
              </button>
            )}
          </section>
        )}

        {/* Documents & drawings glimpse */}
        {documents.length > 0 && (
          <section>
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setAttachmentFilter("PDFs")}
                className="group flex cursor-pointer items-center gap-1.5 text-left transition-colors"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0055ff]">
                  Documents &amp; drawings
                </span>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 group-hover:bg-blue-50 group-hover:text-[#0055ff]">
                  {documents.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAttachmentFilter("PDFs")}
                className="flex cursor-pointer items-center gap-0.5 text-[11.5px] font-semibold text-[#0055ff] hover:underline"
              >
                <span>View all</span>
                <Icon name="chevron-right" size={13} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {documents.slice(0, 2).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setPreviewDocument(doc)}
                  className="group flex cursor-pointer items-center gap-3 py-2.5 transition-colors hover:bg-slate-50/70"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${docTypeStyles[doc.type].chip}`}
                  >
                    {docTypeStyles[doc.type].label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-slate-800 group-hover:text-[#0055ff]">
                      {doc.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {doc.size} · Uploaded by {doc.author}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewDocument(doc)
                    }}
                    className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label={`Preview ${doc.name}`}
                  >
                    <Icon name="eye" size={14} />
                  </button>
                </div>
              ))}
            </div>

            {documents.length > 2 && (
              <button
                type="button"
                onClick={() => setAttachmentFilter("PDFs")}
                className="flex w-full cursor-pointer items-center justify-center gap-1 pt-2 text-[11.5px] font-semibold text-[#0055ff] hover:underline"
              >
                <span>See all {documents.length} documents</span>
                <Icon name="arrow-right" size={11} />
              </button>
            )}
          </section>
        )}
      </div>
    )
  }

  const renderAttachments = () => {
    const filters: AttachmentFilter[] = [
      "All",
      "Tags",
      "Images",
      "PDFs",
      "Sheets",
      "CAD",
      "Snap",
    ]
    const isSnap = attachmentFilter === "Snap"

    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto pb-20">
          {/* Sticky control bar: small optimized filter chips */}
          <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 pb-2 pt-2.5 backdrop-blur-xl">
            <div className="overflow-x-auto px-4 no-scrollbar">
              <div className="flex w-max gap-1">
                {filters.map((filter) => {
                  const isActive = attachmentFilter === filter
                  const count = attachmentFilterCount(filter)
                  return (
                    <button
                      type="button"
                      key={filter}
                      onClick={() => setAttachmentFilter(filter)}
                      className={`flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[10.5px] font-semibold transition-colors ${
                        isActive
                          ? "bg-[#0055ff] text-white shadow-2xs"
                          : "border border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{filter === "Tags" ? "TAGS" : filter}</span>
                      <span
                        className={`text-[9.5px] font-medium tabular-nums ${
                          isActive ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {!isSnap && attachmentFilter !== "All" && (
              <div className="flex items-center px-4 pt-2">
                <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50/70 p-0.5">
                  {attachmentViews.map((view) => {
                    const isActive = attachmentView === view.id
                    return (
                      <button
                        type="button"
                        key={view.id}
                        onClick={() => setAttachmentView(view.id)}
                        className={`flex h-6 w-7 cursor-pointer items-center justify-center rounded-[6px] transition-all duration-150 ${
                          isActive
                            ? "bg-white text-[#0055ff] shadow-2xs"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                        aria-label={view.label}
                        aria-pressed={isActive}
                      >
                        <Icon name={view.icon} size={13} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 pt-3.5">
            {isSnap ? (
              renderSnapSection()
            ) : attachmentFilter === "Tags" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="lines" size={13} className="text-slate-400" />
                  <span className="shrink-0 text-[11.5px] font-medium text-slate-400">
                    Locations assigned
                  </span>
                  <span className="h-px flex-1 bg-slate-100" />
                  {tagRecords.length > 0 && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6d4534] text-[9.5px] font-bold text-white">
                      R
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => showToast("Pick a location to link")}
                    className="flex shrink-0 cursor-pointer items-center gap-1 text-[11.5px] font-semibold text-[#0055ff] hover:underline"
                  >
                    <Icon name="plus" size={12} /> Link More
                  </button>
                </div>
                {renderTagsSection()}
              </div>
            ) : attachmentFilter === "Images" ? (
              renderImagesSection()
            ) : attachmentFilter === "All" ? (
              renderAllOverviewSection()
            ) : (
              renderDocsSection(attachmentFilter)
            )}
          </div>
        </div>

        {/* Floating Upload Circle Icon Button at Bottom Right */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-5 right-4 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#0055ff] text-white shadow-[0_6px_20px_rgba(0,85,255,0.38)] transition-all duration-150 hover:bg-blue-600 hover:scale-105 active:scale-95"
          aria-label="Upload attachment"
          title="Upload attachment"
        >
          <Icon name="upload" size={18} />
        </button>
      </div>
    )
  }

  const renderSubtasks = () => {
    const rootSubtasks = subtasks.filter((s) => !s.parentId)
    const getChildren = (parentId: string) =>
      subtasks.filter((s) => s.parentId === parentId)

    /* One compact context menu shared by root rows and nested rows. */
    const subtaskMenu = (target: Subtask, canNest: boolean) => {
      const assigned = target.assignees?.[0]

      const menuItem = (
        icon: IconName,
        label: string,
        onSelect: () => void,
        options?: { value?: string destructive?: boolean },
      ) => (
        <button
          type="button"
          onClick={onSelect}
          className={`flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-[11.5px] font-medium transition-colors ${
            options?.destructive
              ? "text-rose-600 hover:bg-rose-50"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Icon
            name={icon}
            size={12}
            className={
              options?.destructive ? "text-rose-500" : "text-slate-400"
            }
          />
          <span className="min-w-0 truncate">{label}</span>
          {options?.value && (
            <span className="ml-auto shrink-0 text-[11px] text-slate-400">
              {options.value}
            </span>
          )}
        </button>
      )

      return (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-[184px] rounded-xl border border-slate-200/80 bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)] animate-scale-in"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="px-2 pb-1 pt-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Assign to
          </p>
          <div className="flex items-center gap-1 overflow-x-auto px-2 pb-1.5 no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSubtasks((current) =>
                  current.map((s) =>
                    s.id === target.id ? { ...s, assignees: [] } : s,
                  ),
                )
                setOpenMenuSubtaskId(null)
                showToast("Subtask unassigned")
              }}
              className={`flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all ${
                assigned
                  ? "border-dashed border-slate-300 text-slate-400 hover:border-slate-400"
                  : "border-[#0055ff] bg-blue-50 text-[#0055ff]"
              }`}
              title="Unassigned"
            >
              <Icon name="close" size={9} />
            </button>
            {availableAssignees.map((user) => {
              const isSelected = assigned?.id === user.id
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSubtasks((current) =>
                      current.map((s) =>
                        s.id === target.id ? { ...s, assignees: [user] } : s,
                      ),
                    )
                    setOpenMenuSubtaskId(null)
                    showToast(`Assigned to ${user.name}`)
                  }}
                  className={`flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[8.5px] font-bold text-white transition-all ${
                    isSelected
                      ? "ring-2 ring-[#0055ff] ring-offset-1"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {user.initials}
                </button>
              )
            })}
          </div>

          <div className="my-1 h-px bg-slate-100" />

          {menuItem(
            "calendar",
            "Due date",
            () => {
              setOpenMenuSubtaskId(null)
              openSubtaskCalendar(target)
            },
            { value: formatSubtaskDueDate(target.dueDate) },
          )}

          {canNest &&
            menuItem("plus", "Add nested task", () => {
              setOpenMenuSubtaskId(null)
              setAddingChildToParentId(target.id)
              setActiveField("childSubtask")
              setCollapsedParents((prev) => {
                const next = new Set(prev)
                next.delete(target.id)
                return next
              })
            })}

          <div className="my-1 h-px bg-slate-100" />

          {menuItem(
            "trash",
            "Delete subtask",
            () => {
              setOpenMenuSubtaskId(null)
              deleteSubtask(target.id)
            },
            { destructive: true },
          )}
        </div>
      )
    }

    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 pb-8 pt-4 space-y-4">
        {/* Backdrop for closing assignee dropdown or 3-dot menu when tapping outside */}
        {(openAssigneeSubtaskId || openMenuSubtaskId) && (
          <div
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => {
              setOpenAssigneeSubtaskId(null)
              setOpenMenuSubtaskId(null)
            }}
          />
        )}

        {/* Add Main / Root Subtask Input Bar at TOP - Rounded-full, seamless, modern */}
        <div
          className={`flex items-center gap-2 rounded-full bg-slate-100/80 px-3.5 py-1 transition-all ${
            activeField === "subtask"
              ? "relative z-40 bg-slate-100 ring-2 ring-[#0055ff]/20"
              : ""
          }`}
        >
          <input
            value={subtaskDraft}
            onFocus={() => setActiveField("subtask")}
            onClick={() => setActiveField("subtask")}
            onChange={(event) => setSubtaskDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addSubtask()
                setActiveField(null)
              }
            }}
            placeholder="Add a new subtask..."
            className="min-w-0 flex-1 bg-transparent py-1 text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400 font-normal"
          />
          <button
            type="button"
            onClick={() => {
              addSubtask()
              setActiveField(null)
            }}
            disabled={!subtaskDraft.trim()}
            className="flex h-7 items-center gap-1 rounded-full bg-[#0055ff] px-3 text-[11px] font-medium text-white transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Icon name="plus" size={10} />
            <span>Add</span>
          </button>
        </div>

        {/* Nested Task Tree Structure */}
        <div className="divide-y divide-slate-100 border-y border-slate-100">
          {rootSubtasks.map((root, rootIndex) => {
            const children = getChildren(root.id)
            const isCollapsed = collapsedParents.has(root.id)
            const isAddingChild = addingChildToParentId === root.id

            return (
              <div key={root.id} className="py-2.5 transition-colors">
                {/* Root Task Row */}
                <div className="relative flex items-start gap-2 group/root">
                  {/* Vertical spine line coming down from under chevron */}
                  {children.length > 0 && !isCollapsed && (
                    <div
                      className="pointer-events-none absolute left-[7.5px] top-[21px] bottom-0 w-px bg-slate-200"
                      aria-hidden="true"
                    />
                  )}

                  {/* Left Expand/Collapse or clean aligned spacer */}
                  {children.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => toggleParentCollapse(root.id)}
                      className="relative z-10 mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                      aria-label={
                        isCollapsed ? "Expand subtasks" : "Collapse subtasks"
                      }
                    >
                      <Icon
                        name="chevron-down"
                        size={11}
                        className={`transition-transform duration-200 ${
                          isCollapsed
                            ? "-rotate-90 text-slate-400"
                            : "rotate-0 text-slate-600"
                        }`}
                      />
                    </button>
                  ) : (
                    <div className="mt-[3px] h-4 w-4 shrink-0" />
                  )}

                  {/* Root Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSubtaskDone(root.id)}
                    className={`mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer active:scale-90 ${
                      root.done
                        ? "border-[#0055ff] bg-[#0055ff] text-white shadow-2xs"
                        : "border-slate-300 bg-white hover:border-slate-400 text-transparent"
                    }`}
                    aria-label={root.done ? "Mark incomplete" : "Mark complete"}
                  >
                    <Icon name="check" size={10} />
                  </button>

                  {/* Root Task Body */}
                  <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                    <div className="min-w-0 flex-1 flex items-center gap-1.5">
                      <p
                        className={`text-[13px] font-semibold leading-snug truncate transition-colors ${
                          root.done
                            ? "text-slate-400 line-through font-normal"
                            : "text-slate-900"
                        }`}
                      >
                        <span className="text-slate-400 font-medium mr-1 tabular-nums">
                          {rootIndex + 1}.
                        </span>
                        {root.title}
                      </p>
                      {children.length > 0 && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-500 tabular-nums">
                          {children.filter((c) => c.done).length}/
                          {children.length}
                        </span>
                      )}
                    </div>

                    {/* Right side: Assignee indicator + Vertical 3-Dot Menu */}
                    <div className="relative flex shrink-0 items-center gap-1.5">
                      {/* Subtle assignee avatar if assigned */}
                      {root.assignees && root.assignees.length > 0 && (
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: root.assignees[0].color }}
                          title={`Assigned to ${root.assignees[0].name}`}
                        >
                          {root.assignees[0].initials}
                        </span>
                      )}

                      {/* Vertical 3-Dot Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuSubtaskId(
                            openMenuSubtaskId === root.id ? null : root.id,
                          )
                        }}
                        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer ${
                          openMenuSubtaskId === root.id
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                        aria-label="Subtask options"
                      >
                        <Icon name="more" size={14} />
                      </button>

                      {/* 3-Dot Dropdown Menu */}
                      {openMenuSubtaskId === root.id && subtaskMenu(root, true)}
                    </div>
                  </div>
                </div>

                {/* Nested Tree Children */}
                {!isCollapsed && (children.length > 0 || isAddingChild) && (
                  <div className="relative space-y-0.5 mt-0.5">
                    {children.map((child, childIdx) => {
                      const isLast =
                        childIdx === children.length - 1 && !isAddingChild
                      return (
                        <div
                          key={child.id}
                          className="relative flex items-start gap-1.5 py-1.5 pl-[22px] rounded-lg hover:bg-slate-50/60 transition-colors animate-fade-in"
                        >
                          {/* Seamless Single Vector Tree Branch */}
                          <svg
                            className="pointer-events-none absolute left-0 top-0 h-full w-[22px] overflow-visible"
                            aria-hidden="true"
                          >
                            {/* Continuing vertical line if not last child */}
                            {!isLast && (
                              <line
                                x1="8"
                                y1="0"
                                x2="8"
                                y2="100%"
                                stroke="#e2e8f0"
                                strokeWidth="1.25"
                              />
                            )}

                            {/* Curved branch into child checkbox */}
                            <path
                              d="M 8 0 V 10 Q 8 16 14 16 H 20"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                            />
                          </svg>

                          {/* Child Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleSubtaskDone(child.id)}
                            className={`mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer active:scale-90 ${
                              child.done
                                ? "border-[#0055ff] bg-[#0055ff] text-white shadow-2xs"
                                : "border-slate-300 bg-white hover:border-slate-400 text-transparent"
                            }`}
                            aria-label={
                              child.done ? "Mark incomplete" : "Mark complete"
                            }
                          >
                            <Icon name="check" size={9} />
                          </button>

                          {/* Child Content */}
                          <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                            <p
                              className={`text-[12.5px] font-normal leading-snug truncate transition-colors ${
                                child.done
                                  ? "text-slate-400 line-through"
                                  : "text-slate-800"
                              }`}
                            >
                              <span className="text-slate-400 font-medium mr-1 tabular-nums">
                                {rootIndex + 1}.{childIdx + 1}
                              </span>
                              {child.title}
                            </p>

                            {/* Right side: assignee avatar + 3-dot */}
                            <div className="relative flex shrink-0 items-center gap-1">
                              {child.assignees &&
                                child.assignees.length > 0 && (
                                  <span
                                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white shadow-2xs"
                                    style={{
                                      backgroundColor: child.assignees[0].color,
                                    }}
                                    title={`Assigned to ${child.assignees[0].name}`}
                                  >
                                    {child.assignees[0].initials}
                                  </span>
                                )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuSubtaskId(
                                    openMenuSubtaskId === child.id
                                      ? null
                                      : child.id,
                                  )
                                }}
                                className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors cursor-pointer ${
                                  openMenuSubtaskId === child.id
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                }`}
                                aria-label="Child subtask options"
                              >
                                <Icon name="more" size={12} />
                              </button>

                              {/* Child 3-dot menu */}
                              {openMenuSubtaskId === child.id &&
                                subtaskMenu(child, false)}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Inline Input for Adding Child Subtask */}
                    {isAddingChild && (
                      <div
                        className={`relative flex items-center gap-1.5 py-1.5 pl-[22px] animate-slide-up ${
                          activeField === "childSubtask" ? "z-40" : ""
                        }`}
                      >
                        {/* Branch line into child input */}
                        <svg
                          className="pointer-events-none absolute left-0 top-0 h-full w-[22px] overflow-visible"
                          aria-hidden="true"
                        >
                          <path
                            d="M 8 0 V 10 Q 8 16 14 16 H 20"
                            fill="none"
                            stroke="#93c5fd"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                          />
                        </svg>
                        <input
                          value={childSubtaskDraft}
                          onFocus={() => setActiveField("childSubtask")}
                          onClick={() => setActiveField("childSubtask")}
                          onChange={(e) => setChildSubtaskDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddChildSubtask(root.id)
                              setActiveField(null)
                            }
                            if (e.key === "Escape") {
                              setAddingChildToParentId(null)
                              setActiveField(null)
                            }
                          }}
                          placeholder="Add nested task title..."
                          className="flex-1 rounded-full border border-blue-200 bg-blue-50/40 px-3 py-1 text-[12px] text-slate-900 outline-none focus:border-[#0055ff] focus:bg-white transition-all shadow-xs"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleAddChildSubtask(root.id)
                            setActiveField(null)
                          }}
                          disabled={!childSubtaskDraft.trim()}
                          className="rounded-full bg-[#0055ff] px-3 py-1 text-[11px] font-medium text-white shadow-xs disabled:opacity-40 hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingChildToParentId(null)
                            setChildSubtaskDraft("")
                            setActiveField(null)
                          }}
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDependencies = () => {
    const blockers = dependencies.filter((d) => d.blocks)
    const waiting = dependencies.filter(
      (d) => !d.blocks && d.direction === "waiting",
    )
    const holding = dependencies.filter(
      (d) => !d.blocks && d.direction === "holding",
    )

    const summary = [
      {
        id: "blocking" as const,
        icon: "ban" as IconName,
        count: blockers.length,
        label: "blocking",
        active: "border-rose-200 bg-rose-50 text-rose-700",
        idle: "border-transparent bg-rose-50/60 text-rose-600",
      },
      {
        id: "waiting" as const,
        icon: "link" as IconName,
        count: waiting.length,
        label: "waiting on",
        active: "border-blue-200 bg-blue-50 text-blue-700",
        idle: "border-transparent bg-slate-100 text-slate-600",
      },
      {
        id: "holding" as const,
        icon: "arrow-right" as IconName,
        count: holding.length,
        label: "held up by this",
        active: "border-slate-300 bg-slate-100 text-slate-800",
        idle: "border-transparent bg-slate-100 text-slate-600",
      },
    ]

    const sectionLabel = (icon: IconName, title: string) => (
      <div className="flex items-center gap-2.5">
        <span className="flex shrink-0 items-center gap-1.5 text-[11.5px] font-semibold text-slate-500">
          <Icon name={icon} size={13} className="text-slate-400" />
          {title}
        </span>
        <span className="h-px flex-1 bg-slate-100" />
      </div>
    )

    const removeDependency = (id: string, relation: DependencyRelation) => {
      setDependencies((current) =>
        current.filter(
          (entry) => !(entry.id === id && entry.relation === relation),
        ),
      )
      showToast("Link removed")
    }

    /* Plain scheduling link — id and title on one line, meta chips underneath. */
    const linkRow = (dep: Dependency) => (
      <div
        key={`${dep.id}-${dep.relation}`}
        className="group flex items-start gap-2.5 py-2.5"
      >
        <span
          className="mt-[7px] h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: dep.dotColor }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium text-slate-800">
            <span className="text-slate-400 tabular-nums">{dep.id}</span>
            <span className="mx-1 text-slate-300">·</span>
            {dep.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              <RelationDiagram relation={dep.relation} muted />
              {dep.relation}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {dep.kind}
            </span>
            {(dep.gaps.wait !== "0" ||
              dep.gaps.safety !== "0" ||
              dep.gaps.free !== "0") && (
              <span className="text-[10px] text-slate-400">
                +{dep.gaps.wait}w · {dep.gaps.safety}s · {dep.gaps.free}f
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => removeDependency(dep.id, dep.relation)}
          className="mt-0.5 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label={`Remove link to ${dep.title}`}
        >
          <Icon name="close" size={13} />
        </button>
      </div>
    )

    /* Active blocker — tinted card, resolve and remove actions, optional reason. */
    const blockerCard = (dep: Dependency) => (
      <div
        key={`${dep.id}-${dep.relation}`}
        className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-3"
      >
        <div className="flex items-start gap-2.5">
          <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
            <Icon name="ban" size={13} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-slate-900">
              <span className="text-slate-400 tabular-nums">{dep.id}</span>
              <span className="mx-1 text-slate-300">·</span>
              {dep.title}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-slate-500">
              <span className="font-bold uppercase tracking-wide text-rose-600">
                Blocking
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-medium">{dep.relation}</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold uppercase tracking-wide">
                {dep.kind}
              </span>
              <span className="text-slate-300">·</span>
              <span>{dep.addedAt}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => {
                setDependencies((current) =>
                  current.map((entry) =>
                    entry.id === dep.id && entry.relation === dep.relation
                      ? { ...entry, blocks: false, reason: undefined }
                      : entry,
                  ),
                )
                showToast("Blocker resolved")
              }}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-emerald-600"
              aria-label={`Resolve blocker ${dep.title}`}
            >
              <Icon name="check-circle" size={15} />
            </button>
            <button
              type="button"
              onClick={() => removeDependency(dep.id, dep.relation)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-rose-600"
              aria-label={`Remove blocker ${dep.title}`}
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>

        {dep.reason && (
          <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-white px-2.5 py-2">
            <Icon
              name="message"
              size={13}
              className="mt-px shrink-0 text-rose-400"
            />
            <p className="min-w-0 text-[11.5px] leading-[16px] text-slate-600">
              {dep.reason}
            </p>
          </div>
        )}
      </div>
    )

    const showBlockers =
      blockers.length > 0 &&
      (dependencyFilter === null || dependencyFilter === "blocking")
    const showWaiting =
      waiting.length > 0 &&
      (dependencyFilter === null || dependencyFilter === "waiting")
    const showHolding =
      holding.length > 0 &&
      (dependencyFilter === null || dependencyFilter === "holding")

    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 pb-8 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[13.5px] font-bold leading-snug text-slate-900">
              Dependencies &amp; blockers
            </h2>
            <p className="mt-0.5 text-[11.5px] leading-[16px] text-slate-500">
              What this task waits for and what it is holding up.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDependencyStep(1)}
            className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-3.5 text-[11.5px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 active:scale-[0.98]"
          >
            <Icon name="plus" size={13} /> Link
          </button>
        </div>

        {/* Summary chips double as section filters */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {summary.map((chip) => {
            const isActive = dependencyFilter === chip.id
            return (
              <button
                type="button"
                key={chip.id}
                onClick={() => setDependencyFilter(isActive ? null : chip.id)}
                disabled={chip.count === 0}
                className={`flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition-all disabled:cursor-default disabled:opacity-60 ${
                  isActive ? chip.active : chip.idle
                }`}
              >
                <Icon name={chip.icon} size={12} />
                <span className="tabular-nums">{chip.count}</span>
                <span className="font-medium">{chip.label}</span>
              </button>
            )
          })}
        </div>

        {dependencies.length === 0 ? (
          <div className="pt-2">
            <EmptyState
              icon="link"
              title="No dependencies"
              description="Link a task when this work waits on it, or when it is holding something else up."
              action={
                <button
                  type="button"
                  onClick={() => setDependencyStep(1)}
                  className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-4 text-[12px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700"
                >
                  <Icon name="plus" size={14} /> Link a task
                </button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {showBlockers && (
              <section className="space-y-2">
                {sectionLabel("ban", "Blocking this task")}
                <div className="space-y-2">{blockers.map(blockerCard)}</div>
              </section>
            )}

            {showWaiting && (
              <section className="space-y-1">
                {sectionLabel("link", "This task waits for")}
                <div className="divide-y divide-slate-100">
                  {waiting.map(linkRow)}
                </div>
              </section>
            )}

            {showHolding && (
              <section className="space-y-1">
                {sectionLabel("arrow-right", "Held up by this task")}
                <div className="divide-y divide-slate-100">
                  {holding.map(linkRow)}
                </div>
              </section>
            )}

            {!showBlockers && !showWaiting && !showHolding && (
              <p className="py-10 text-center text-[12px] text-slate-400">
                Nothing in this group.
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderLinked = () => {
    const visible = linkedRecords.filter((record) => record.kind === linkedKind)
    const kindLabel =
      linkedKind === "Field Note" ? "field note" : linkedKind.toLowerCase()

    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-20 pt-3">
          {/* Record-type switch - full width single line */}
          <div className="flex w-full rounded-xl bg-slate-100/80 p-0.5">
            {linkedKinds.map((kind) => {
              const isActive = linkedKind === kind
              const count = linkedRecords.filter((r) => r.kind === kind).length
              return (
                <button
                  type="button"
                  key={kind}
                  onClick={() => {
                    setLinkedKind(kind)
                    setLinkSearch("")
                  }}
                  className={`flex h-7.5 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] text-[11.5px] font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span className="whitespace-nowrap">{kind}</span>
                  {count > 0 && (
                    <span className="text-[10px] tabular-nums text-slate-400">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {visible.length > 0 ? (
            <div className="mt-3 divide-y divide-slate-100">
              {visible.map((record) => (
                <article key={record.id} className="py-3.5">
                  <div className="flex items-start gap-2">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-[#0055ff] tabular-nums">
                        #{record.id}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-slate-500">
                        {record.kind}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${linkedStatusStyles[record.status]}`}
                      >
                        {record.status}
                      </span>
                      <span
                        className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide"
                        style={{ color: priorityColors[record.priority] }}
                      >
                        <FilledFlagIcon
                          color={priorityColors[record.priority]}
                          size={11}
                        />
                        {record.priority}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => showToast(`Opening ${record.id}`)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        aria-label={`Open ${record.id}`}
                      >
                        <Icon name="eye" size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedRecords((current) =>
                            current.filter((entry) => entry.id !== record.id),
                          )
                          showToast("Record unlinked")
                        }}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        aria-label={`Unlink ${record.id}`}
                      >
                        <Icon name="close" size={13} />
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-1.5 text-[13px] font-bold leading-[18px] text-slate-900">
                    {record.title}
                  </h3>
                  <p className="mt-1 text-[11.5px] leading-[16px] text-slate-500">
                    {record.description}
                  </p>

                  {record.owners.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <Icon
                        name="users"
                        size={12}
                        className="shrink-0 text-slate-300"
                      />
                      <span className="min-w-0 truncate text-[10.5px] text-slate-400">
                        {record.owners.join(", ")}
                      </span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="pt-2">
              <EmptyState
                icon="file"
                title={`No ${kindLabel} linked`}
                description={`Link the ${kindLabel} this task resolves, so both records close out together.`}
                action={
                  <button
                    type="button"
                    onClick={() => setIsLinkPickerOpen(true)}
                    className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-4 text-[12px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700"
                  >
                    <Icon name="link" size={14} /> Link {linkedKind}
                  </button>
                }
              />
            </div>
          )}
        </div>

        {/* Floating action button at bottom right */}
        <button
          type="button"
          onClick={() => setIsLinkPickerOpen(true)}
          className="absolute bottom-5 right-4 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#0055ff] text-white shadow-[0_6px_20px_rgba(0,85,255,0.38)] transition-all duration-150 hover:bg-blue-600 hover:scale-105 active:scale-95"
          aria-label={`Link ${linkedKind}`}
          title={`Link ${linkedKind}`}
        >
          <Icon name="link" size={19} />
        </button>
      </div>
    )
  }

  const renderApproval = () => {
    const approverMatch = availableAssignees.find((a) => a.name === approver)
    const approverInitials =
      approverMatch?.initials ??
      approver
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    const approverColor = approverMatch?.color ?? "#7c3aed"
    const approverFirstName = approver.split(" ")[0]

    const stageBadge: Record<ApprovalStage, {
      label: string
      className: string
    }> = {
      empty: {
        label: "NOT SUBMITTED",
        className: "bg-slate-100 text-slate-600",
      },
      posted: {
        label: "NOT SUBMITTED",
        className: "bg-slate-100 text-slate-600",
      },
      sent: {
        label: "IN REVIEW",
        className: "border border-blue-200 bg-blue-50 text-blue-700",
      },
      approved: {
        label: "APPROVED",
        className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
      },
      "sent-back": {
        label: "SENT BACK",
        className: "border border-amber-200 bg-amber-50 text-amber-700",
      },
    }
    const badge = stageBadge[approvalStage]

    const stampNow = () =>
      new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

    const markerTones: Record<"green" | "blue" | "amber" | "rose" | "idle", {
      dot: string
      label: string
    }> = {
      green: { dot: "bg-emerald-500", label: "text-emerald-600" },
      blue: { dot: "bg-[#0055ff]", label: "text-[#0055ff]" },
      amber: { dot: "bg-amber-500", label: "text-amber-600" },
      rose: { dot: "bg-rose-500", label: "text-rose-600" },
      idle: { dot: "", label: "text-slate-500" },
    }

    /* One entry in the sign-off journal: marker rail on the left, content right. */
    const step = (config: {
      key: string
      tone: keyof typeof markerTones
      label: string
      byline?: string
      time?: string
      last?: boolean
      children?: ReactNode
    }) => (
      <div key={config.key} className="relative flex gap-2.5 pb-4 last:pb-0">
        <div className="relative flex w-3 shrink-0 justify-center">
          {config.tone === "idle" ? (
            <span className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-slate-300 bg-white" />
          ) : (
            <span
              className={`mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full ${markerTones[config.tone].dot}`}
            />
          )}
          {!config.last && (
            <span
              className="absolute left-1/2 top-[19px] bottom-[-4px] w-px -translate-x-1/2 bg-slate-200"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span
              className={`text-[11px] font-bold uppercase tracking-wide ${markerTones[config.tone].label}`}
            >
              {config.label}
            </span>
            {config.byline && (
              <span className="text-[11px] text-slate-400">
                {config.byline}
              </span>
            )}
            {config.time && (
              <span className="ml-auto shrink-0 text-[10.5px] text-slate-400 tabular-nums">
                {config.time}
              </span>
            )}
          </div>
          {config.children && <div className="mt-2">{config.children}</div>}
        </div>
      </div>
    )

    const snapThumbs = (
      <div className="flex gap-2">
        {returnSnaps.map((snap) => (
          <button
            type="button"
            key={snap.id}
            onClick={() => {
              setAttachmentFilter("Snap")
              selectTab("attachments")
            }}
            className="h-[54px] w-[58px] shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-100 transition-all hover:border-[#0055ff] active:scale-95"
            aria-label={`Open ${snap.name}`}
          >
            <img src={snap.src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
        {approvalStage !== "approved" && (
          <button
            type="button"
            onClick={() => {
              setAttachmentFilter("Snap")
              fileInputRef.current?.click()
            }}
            className="flex h-[54px] w-[58px] shrink-0 cursor-pointer items-center justify-center rounded-lg border-[1.5px] border-dashed border-slate-200 text-slate-300 transition-colors hover:border-[#0055ff]/50 hover:text-[#0055ff]"
            aria-label="Add return snap"
          >
            <Icon name="image-plus" size={17} />
          </button>
        )}
      </div>
    )

    const fileRow = (file: ApprovalFile, removable: boolean) => (
      <div
        key={file.id}
        className="flex items-center gap-2 py-1 text-[11.5px] text-slate-600"
      >
        <Icon name="file" size={13} className="shrink-0 text-slate-400" />
        <span className="min-w-0 truncate font-medium text-slate-700">
          {file.name}
        </span>
        <span className="shrink-0 text-[10.5px] text-slate-400">
          {file.size}
        </span>
        {removable && (
          <button
            type="button"
            onClick={() =>
              setApprovalFiles((current) =>
                current.filter((entry) => entry.id !== file.id),
              )
            }
            className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-slate-300 transition-colors hover:text-slate-600"
            aria-label={`Remove ${file.name}`}
          >
            <Icon name="close" size={11} />
          </button>
        )}
      </div>
    )

    const postReturnSnaps = () => {
      setApprovalStage("posted")
      setApprovalTimes((current) => ({ ...current, posted: stampNow() }))
      showToast("Return snaps posted")
    }

    const sendForSignOff = () => {
      setApprovalStage("sent")
      setApprovalTimes((current) => ({ ...current, sent: stampNow() }))
      recordApprovalAction(
        sendNote.trim()
          ? `sent this to ${approver} for sign-off: ${sendNote.trim()}`
          : `sent this to ${approver} for sign-off`,
        "REVIEW",
      )
      showToast(`Sent to ${approverFirstName}`)
    }

    const approveAndClose = () => {
      setApprovalStage("approved")
      setApprovalTimes((current) => ({ ...current, decided: stampNow() }))
      recordApprovalAction(
        decisionNote.trim()
          ? `approved and closed this: ${decisionNote.trim()}`
          : "approved and closed this",
        "APPROVED",
      )
      setDecisionNote("")
      showToast("Approved & closed")
    }

    const sendBack = () => {
      if (!decisionNote.trim()) {
        showToast("Add a note before sending back")
        return
      }
      setApprovalStage("sent-back")
      setApprovalTimes((current) => ({ ...current, decided: stampNow() }))
      recordApprovalAction(
        `sent this back for rework: ${decisionNote.trim()}`,
        "REVIEW",
      )
      showToast("Sent back for rework")
    }

    /* Steps 1 and 2 are shared by every stage past the empty prompt. */
    const returnSnapsStep = (last: boolean) =>
      step({
        key: "return-snaps",
        tone: "green",
        label: "Return snaps",
        byline: "Current User",
        time: approvalTimes.posted,
        last,
        children: (
          <div className="space-y-2.5">
            {approvalStage === "posted" || approvalStage === "sent-back" ? (
              <input
                value={returnSnapNote}
                onChange={(event) => setReturnSnapNote(event.target.value)}
                placeholder="Add a note for this visit..."
                className="w-full bg-transparent text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400"
              />
            ) : (
              <p
                className={`text-[12.5px] ${
                  returnSnapNote ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {returnSnapNote || "No note added for this visit"}
              </p>
            )}
            {snapThumbs}
          </div>
        ),
      })

    const sentStep = (last: boolean) =>
      step({
        key: "sent",
        tone: "blue",
        label: "Sent for sign-off",
        byline: "by me",
        time: approvalTimes.sent,
        last,
        children: (
          <div>
            {sendNote.trim() && (
              <p className="mb-1.5 text-[12.5px] leading-[17px] text-slate-700">
                {sendNote.trim()}
              </p>
            )}
            {approvalFiles.length > 0 ? (
              approvalFiles.map((file) => fileRow(file, false))
            ) : (
              <p className="text-[11.5px] text-slate-400">No files attached</p>
            )}
          </div>
        ),
      })

    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 pb-8 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[13.5px] font-bold leading-snug text-slate-900">
              Approval &amp; sign-off
            </h2>
            <p className="mt-0.5 text-[11.5px] leading-[16px] text-slate-500">
              {approvalStage === "approved"
                ? "This record is signed off and closed."
                : `Post what came back from site, then send it to ${approver}.`}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Designated approver */}
        <div className="mt-3.5 flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-2xs"
            style={{ backgroundColor: approverColor }}
          >
            {approverInitials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-900">
              {approver}
            </p>
            <p className="text-[11px] text-slate-400">Project Manager</p>
          </div>
          {approvalStage !== "approved" && (
            <button
              type="button"
              onClick={() => {
                selectTab("details")
                setIsApproverMenuOpen(true)
              }}
              className="shrink-0 cursor-pointer rounded-full px-2 py-1 text-[11px] font-semibold text-[#0055ff] hover:bg-blue-50"
            >
              Change
            </button>
          )}
        </div>

        {/* Sign-off journal */}
        <div className="pt-4">
          {approvalStage === "empty" ? (
            step({
              key: "post-prompt",
              tone: "idle",
              label: "",
              last: true,
              children: (
                <button
                  type="button"
                  onClick={postReturnSnaps}
                  className="-mt-6 flex w-full cursor-pointer items-center gap-2 rounded-xl py-1 text-left transition-colors hover:bg-slate-50/70"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-400">
                    <Icon name="image" size={13} />
                  </span>
                  <span className="text-[12.5px] font-semibold text-slate-800">
                    Post return snaps
                  </span>
                  <span className="text-[12px] text-slate-400">
                    — photos of what was done
                  </span>
                </button>
              ),
            })
          ) : (
            <>
              {returnSnapsStep(false)}

              {approvalStage === "posted" &&
                step({
                  key: "send",
                  tone: "idle",
                  label: "",
                  last: true,
                  children: (
                    <div className="-mt-6 space-y-3">
                      <input
                        value={sendNote}
                        onChange={(event) => setSendNote(event.target.value)}
                        placeholder="Anything the approver should check before closing this?"
                        className="w-full bg-transparent text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={sendForSignOff}
                          className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-4 text-[12px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 active:scale-[0.98]"
                        >
                          <Icon name="send" size={14} /> Send to{" "}
                          {approverFirstName}
                        </button>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Icon name="paperclip" size={12} />
                          {approvalFiles.length} file
                          {approvalFiles.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      {approvalFiles.length > 0 && (
                        <div>
                          {approvalFiles.map((file) => fileRow(file, true))}
                        </div>
                      )}
                    </div>
                  ),
                })}

              {(approvalStage === "sent" ||
                approvalStage === "approved" ||
                approvalStage === "sent-back") &&
                sentStep(false)}

              {approvalStage === "sent" &&
                step({
                  key: "decision",
                  tone: "amber",
                  label: "Your decision",
                  last: true,
                  children: (
                    <div className="space-y-3">
                      <textarea
                        value={decisionNote}
                        onChange={(event) =>
                          setDecisionNote(event.target.value)
                        }
                        rows={2}
                        placeholder="Add a note for the record — required when sending it back"
                        className="w-full resize-none bg-transparent text-[12.5px] leading-[17px] text-slate-800 outline-none placeholder:text-slate-400"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={approveAndClose}
                          className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-[12px] font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-700 active:scale-[0.98]"
                        >
                          <Icon name="check" size={14} /> Approve &amp; close
                        </button>
                        <button
                          type="button"
                          onClick={sendBack}
                          className={`flex shrink-0 cursor-pointer items-center gap-1.5 text-[12px] font-semibold transition-colors ${
                            decisionNote.trim()
                              ? "text-rose-600 hover:text-rose-700"
                              : "text-rose-300"
                          }`}
                        >
                          <Icon name="return" size={14} /> Send back
                        </button>
                      </div>
                    </div>
                  ),
                })}

              {approvalStage === "approved" &&
                step({
                  key: "approved",
                  tone: "green",
                  label: "Approved & closed",
                  byline: `by ${approver}`,
                  time: approvalTimes.decided,
                  last: true,
                  children: (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Icon name="check" size={15} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-bold text-emerald-900">
                            Signed off &amp; verified
                          </p>
                          <p className="mt-0.5 text-[11.5px] leading-[16px] text-emerald-700">
                            {decisionNote.trim() ||
                              `Approved by ${approver}. The sign-off certificate is recorded in the activity audit trail.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                })}

              {approvalStage === "sent-back" && (
                <>
                  {step({
                    key: "sent-back",
                    tone: "rose",
                    label: "Sent back",
                    byline: `by ${approver}`,
                    time: approvalTimes.decided,
                    children: (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                        <p className="text-[12px] leading-[17px] text-amber-800">
                          {decisionNote.trim() ||
                            "Changes requested before this can be closed."}
                        </p>
                      </div>
                    ),
                  })}
                  {step({
                    key: "resend",
                    tone: "idle",
                    label: "Rework & resend",
                    last: true,
                    children: (
                      <div className="space-y-3">
                        <input
                          value={sendNote}
                          onChange={(event) => setSendNote(event.target.value)}
                          placeholder="Note what changed since the last submission..."
                          className="w-full bg-transparent text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDecisionNote("")
                            sendForSignOff()
                          }}
                          className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-4 text-[12px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 active:scale-[0.98]"
                        >
                          <Icon name="send" size={14} /> Resend to{" "}
                          {approverFirstName}
                        </button>
                      </div>
                    ),
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* Reopen a closed sign-off */}
        {approvalStage === "approved" && (
          <button
            type="button"
            onClick={() => {
              setApprovalStage("sent")
              setDecisionNote("")
              showToast("Sign-off reopened")
            }}
            className="mt-2 h-9 w-full cursor-pointer rounded-full border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Reopen sign-off
          </button>
        )}
      </div>
    )
  }

  const renderNotes = () => {
    const pendingCount = notesList.filter((n) => !n.done).length
    const completedCount = notesList.filter((n) => n.done).length

    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 pb-8 pt-4 space-y-4">
        {/* Add Todo Input Bar - Simple, borderless, compact rounded-full button */}
        <div
          className={`flex items-center gap-2 rounded-full bg-slate-100/80 px-3.5 py-1 transition-all ${
            activeField === "note"
              ? "relative z-40 bg-slate-100 ring-2 ring-[#0055ff]/20"
              : ""
          }`}
        >
          <input
            type="text"
            value={newNoteInput}
            onFocus={() => setActiveField("note")}
            onClick={() => setActiveField("note")}
            onChange={(e) => setNewNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddNote()
                setActiveField(null)
              }
            }}
            placeholder="Add a note..."
            className="min-w-0 flex-1 bg-transparent py-1 text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400 font-normal"
          />
          <button
            type="button"
            onClick={() => {
              handleAddNote()
              setActiveField(null)
            }}
            disabled={!newNoteInput.trim()}
            className="flex h-7 items-center gap-1 rounded-full bg-[#0055ff] px-3 text-[11px] font-medium text-white transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Icon name="plus" size={10} />
            <span>Add</span>
          </button>
        </div>

        {/* Todo Items List */}
        {notesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#0055ff] mb-2">
              <Icon name="task" size={20} />
            </span>
            <span className="text-[13px] font-semibold text-slate-700">
              No notes or to-dos yet
            </span>
            <span className="text-[11.5px] text-slate-400 mt-0.5">
              Type an item above to keep track of quick tasks
            </span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border-y border-slate-100">
            {notesList.map((note) => {
              const isEditing = editingNoteId === note.id
              return (
                <div
                  key={note.id}
                  className={`group flex items-center justify-between gap-3 py-3 px-1 transition-colors ${
                    isEditing ? "bg-blue-50/30" : "hover:bg-slate-50/60"
                  }`}
                >
                  {isEditing ? (
                    <div
                      className={`flex min-w-0 flex-1 items-center gap-2.5 ${
                        activeField === "noteEdit" ? "relative z-40" : ""
                      }`}
                    >
                      {/* Active pen indicator on left */}
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0055ff] bg-blue-50 text-[#0055ff]">
                        <Icon name="pen" size={10} />
                      </span>
                      {/* Simple borderless input */}
                      <input
                        type="text"
                        value={editingNoteText}
                        onFocus={() => setActiveField("noteEdit")}
                        onClick={() => setActiveField("noteEdit")}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit()
                            setActiveField(null)
                          }
                          if (e.key === "Escape") {
                            setEditingNoteId(null)
                            setActiveField(null)
                          }
                        }}
                        autoFocus
                        placeholder="Edit note..."
                        className="min-w-0 flex-1 bg-transparent py-0.5 text-[13px] font-medium text-slate-900 outline-none border-0 focus:outline-none focus:ring-0 caret-[#0055ff]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleSaveEdit()
                          setActiveField(null)
                        }}
                        className="rounded-full bg-[#0055ff] px-3.5 py-1 text-[11px] font-medium text-white shadow-2xs hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(null)
                          setActiveField(null)
                        }}
                        className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Checkbox toggle - rounded-full circle */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleNote(note.id)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer active:scale-90 ${
                            note.done
                              ? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
                              : "border-slate-300 bg-white hover:border-[#0055ff] text-transparent"
                          }`}
                          aria-label={note.done ? "Mark pending" : "Mark done"}
                        >
                          <Icon name="check" size={11} />
                        </button>

                        <div
                          onClick={() => handleStartEdit(note)}
                          className="min-w-0 flex-1 cursor-pointer"
                          title="Click to edit"
                        >
                          <span
                            className={`block text-[13px] leading-snug transition-colors ${
                              note.done
                                ? "text-slate-400 line-through"
                                : "font-medium text-slate-800 group-hover:text-[#0055ff]"
                            }`}
                          >
                            {note.text}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {note.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons: Pen Edit & Delete - all rounded-full */}
                      <div className="flex shrink-0 items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(note)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-blue-50 hover:text-[#0055ff] active:scale-90 transition-all cursor-pointer"
                          title="Edit to-do"
                        >
                          <Icon name="pen" size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:scale-90 transition-all cursor-pointer"
                          title="Delete to-do"
                        >
                          <Icon name="close" size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
            {completedCount > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="rounded-full px-3 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                >
                  Clear {completedCount} completed
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

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
      case "notes":
        return renderNotes()
    }
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white text-slate-800">
      <DeviceStatusBar />

      {isMoreMenuOpen && (
        <button
          type="button"
          className="absolute inset-0 z-30 cursor-default"
          onClick={closeHeaderMenus}
          aria-label="Close header menus"
        />
      )}

      <header className="relative z-40 shrink-0 border-b border-slate-100 bg-white">
        <div className="flex min-h-[52px] items-center gap-1.5 px-3 py-1">
          <BackButton onClick={onBack} />
          <div className="min-w-0 flex-1 px-1.5">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13.5px] font-bold text-slate-900 leading-tight tabular-nums">
                {(item.id.replace(/[^0-9]/g, "") || "0").split("").join(".")}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                · {typeConfig.header}
              </span>
            </div>
            {/* Uske niche ye chhotasa breadcrumb */}
            <div className="flex items-center gap-1 overflow-x-auto text-[10.5px] no-scrollbar mt-0.5 whitespace-nowrap">
              <span className="flex shrink-0 items-center gap-1 font-medium text-slate-600">
                <svg
                  width="11"
                  height="11"
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
                className="shrink-0 text-slate-300 font-normal select-none"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                /
              </span>
              <span className="flex shrink-0 items-center gap-1 font-medium text-slate-600">
                <svg
                  width="11"
                  height="11"
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
                className="shrink-0 text-slate-300 font-normal select-none"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                /
              </span>
              <span className="flex shrink-0 items-center gap-1 font-medium text-slate-800">
                <svg
                  width="11"
                  height="11"
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
          </div>
          <div className="relative">
            <IconButton
              label="More options"
              icon="more"
              onClick={() => {
                closeInlineMenus()
                setIsMoreMenuOpen(!isMoreMenuOpen)
              }}
            />
            <FloatingMenu
              open={isMoreMenuOpen}
              align="right"
              widthClassName="w-48"
            >
              <MenuCaption>Quick actions</MenuCaption>
              <button
                type="button"
                onClick={() => {
                  closeHeaderMenus()
                  handleShare()
                }}
                className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98]"
              >
                <Icon name="share" size={13} className="text-slate-400" />
                Share task
              </button>
              <button
                type="button"
                onClick={() => {
                  closeHeaderMenus()
                  onNavigate(item)
                }}
                className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98]"
              >
                <Icon name="timer" size={13} className="text-slate-400" />
                Track time & navigate
              </button>
              <button
                type="button"
                onClick={() => selectTab("activity")}
                className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98]"
              >
                <Icon name="clock" size={13} className="text-slate-400" />
                Open activity
              </button>
              <button
                type="button"
                onClick={() => {
                  closeHeaderMenus()
                  fileInputRef.current?.click()
                }}
                className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98]"
              >
                <Icon name="paperclip" size={13} className="text-slate-400" />
                Add attachment
              </button>
              <button
                type="button"
                onClick={markComplete}
                className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98]"
              >
                <Icon name="check" size={13} className="text-emerald-500" />
                Mark complete
              </button>
              <button
                type="button"
                onClick={() => {
                  setApprovalStage("sent")
                  recordApprovalAction(`sent this to ${approver} for sign-off`)
                  selectTab("approval")
                  showToast("Sent for approval")
                }}
                className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98]"
              >
                <Icon name="approval" size={13} className="text-blue-500" />
                Request approval
              </button>
            </FloatingMenu>
          </div>
        </div>

        <nav
          className="relative border-t border-slate-100 bg-white"
          aria-label="Item detail sections"
        >
          {/* Continuous thin blue baseline spanning the bottom of the tab bar */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[1px] bg-[#0055ff]" />

          <div
            ref={tabListRef}
            role="tablist"
            className="relative flex items-end overflow-x-auto pl-0 pr-3.5 pt-2.5 no-scrollbar scroll-smooth"
          >
            {/* Sliding Elastic Active Tab Background */}
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
                {/* Left swoop curve (hidden on first tab) */}
                {tabs.findIndex((t) => t.id === tab) > 0 && (
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

                {/* Right swoop curve */}
                <svg
                  className="pointer-events-none absolute -right-[11px] bottom-0 z-15 h-[12px] w-[12px]"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 0 0 C 0 6.6 5.4 12 12 12 L 0 12 Z"
                    fill="#0055ff"
                  />
                </svg>
              </div>
            )}

            {tabs.map((taskTab) => {
              const isActive = tab === taskTab.id
              return (
                <button
                  type="button"
                  key={taskTab.id}
                  id={`task-tab-${taskTab.id}`}
                  onClick={() => selectTab(taskTab.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`task-panel-${taskTab.id}`}
                  className={`group relative z-20 flex h-[35px] shrink-0 items-center gap-1.5 px-3.5 text-left font-medium transition-all duration-200 cursor-pointer active:scale-[0.96] ${
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {/* Icon */}
                  <Icon
                    name={tabIcons[taskTab.id]}
                    size={13}
                    className={`shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />

                  {/* Label */}
                  <span className="whitespace-nowrap text-[12.5px] font-medium leading-none transition-colors duration-200">
                    {taskTab.label}
                  </span>

                  {/* Count badge */}
                  {taskTab.count !== undefined && taskTab.count > 0 && (
                    <span
                      className={`ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] transition-all duration-200 ${
                        isActive
                          ? "bg-white/25 font-bold text-white scale-105"
                          : "bg-slate-100 font-semibold text-slate-500 group-hover:bg-slate-200/70 scale-100"
                      }`}
                    >
                      {taskTab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      </header>

      <div
        id={`task-panel-${tab}`}
        className="flex min-h-0 flex-1 flex-col"
        role="tabpanel"
        aria-labelledby={`task-tab-${tab}`}
      >
        <div
          key={tab}
          className="flex min-h-0 flex-1 flex-col animate-task-tab-panel"
        >
          {renderCurrentTab()}
        </div>
      </div>

      {/* Backdrop to dismiss keyboard and save when clicking outside */}
      {activeField !== null && (
        <div
          className="fixed inset-0 z-35 cursor-default"
          onClick={() => {
            if (activeField === "title") saveTitle()
            if (activeField === "description") saveDescription()
            if (activeField === "noteEdit") handleSaveEdit()
            setActiveField(null)
          }}
          aria-label="Dismiss keyboard"
        />
      )}

      {/* Interactive Mobile Keyboard when editing title, description, subtask, or notes */}
      {activeField !== null && (
        <div
          className="relative z-50 w-full shrink-0 border-t border-slate-200 bg-white shadow-2xl animate-slide-up"
          onClick={(event) => event.stopPropagation()}
        >
          <CustomKeyboard
            type="alpha"
            actionLabel={
              activeField === "subtask" ||
              activeField === "childSubtask" ||
              activeField === "note"
                ? "Add"
                : activeField === "noteEdit"
                  ? "Save"
                  : "Done"
            }
            onKeyPress={(char) => {
              if (activeField === "title") {
                setTitle((prev) => {
                  const updated = prev + char
                  onUpdate(item.id, { title: updated })
                  return updated
                })
              } else if (activeField === "description") {
                setDescription((prev) => {
                  const updated = prev + char
                  onUpdate(item.id, { description: updated })
                  return updated
                })
              } else if (activeField === "subtask") {
                setSubtaskDraft((prev) => prev + char)
              } else if (activeField === "childSubtask") {
                setChildSubtaskDraft((prev) => prev + char)
              } else if (activeField === "note") {
                setNewNoteInput((prev) => prev + char)
              } else if (activeField === "noteEdit") {
                setEditingNoteText((prev) => prev + char)
              }
            }}
            onBackspace={() => {
              if (activeField === "title") {
                setTitle((prev) => {
                  const updated = prev.slice(0, -1)
                  onUpdate(item.id, { title: updated })
                  return updated
                })
              } else if (activeField === "description") {
                setDescription((prev) => {
                  const updated = prev.slice(0, -1)
                  onUpdate(item.id, { description: updated })
                  return updated
                })
              } else if (activeField === "subtask") {
                setSubtaskDraft((prev) => prev.slice(0, -1))
              } else if (activeField === "childSubtask") {
                setChildSubtaskDraft((prev) => prev.slice(0, -1))
              } else if (activeField === "note") {
                setNewNoteInput((prev) => prev.slice(0, -1))
              } else if (activeField === "noteEdit") {
                setEditingNoteText((prev) => prev.slice(0, -1))
              }
            }}
            onSubmit={() => {
              if (activeField === "title") {
                saveTitle()
              } else if (activeField === "description") {
                saveDescription()
              } else if (activeField === "subtask") {
                if (subtaskDraft.trim()) {
                  addSubtask()
                }
              } else if (activeField === "childSubtask") {
                if (addingChildToParentId && childSubtaskDraft.trim()) {
                  handleAddChildSubtask(addingChildToParentId)
                }
              } else if (activeField === "note") {
                if (newNoteInput.trim()) {
                  handleAddNote()
                }
              } else if (activeField === "noteEdit") {
                handleSaveEdit()
              }
              setActiveField(null)
            }}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={addPhoto}
      />

      {toastMessage && (
        <div className="pointer-events-none absolute left-1/2 top-[106px] z-[60] -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.16)] backdrop-blur-xl animate-task-toast">
          {toastMessage}
        </div>
      )}

      {isPreviewOpen && displayPhotos.length > 0 && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white p-4">
          <div className="flex h-11 shrink-0 items-center justify-between text-slate-700">
            <span className="text-[12px] font-semibold">
              {activePhotoIndex + 1} of {displayPhotos.length}
            </span>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 transition-colors hover:bg-slate-200"
              aria-label="Close preview"
            >
              <Icon name="close" size={19} />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-7">
            {displayPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActivePhotoIndex((current) =>
                    current === 0 ? displayPhotos.length - 1 : current - 1,
                  )
                }
                className="absolute left-0 z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-slate-600 shadow-2xs backdrop-blur-md cursor-pointer transition-colors hover:text-[#0055ff]"
                aria-label="Previous attachment"
              >
                <Icon name="arrow-left" size={20} />
              </button>
            )}
            <img
              src={displayPhotos[activePhotoIndex]}
              alt={`Attachment preview ${activePhotoIndex + 1}`}
              className="max-h-full max-w-full rounded-2xl object-contain"
            />
            {displayPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActivePhotoIndex((current) =>
                    current === displayPhotos.length - 1 ? 0 : current + 1,
                  )
                }
                className="absolute right-0 z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-slate-600 shadow-2xs backdrop-blur-md cursor-pointer transition-colors hover:text-[#0055ff]"
                aria-label="Next attachment"
              >
                <Icon name="chevron-right" size={20} />
              </button>
            )}
          </div>
          <div className="flex h-16 shrink-0 items-center justify-center gap-2">
            {displayPhotos.map((photo, index) => (
              <button
                type="button"
                key={`${photo}-${index}`}
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

      {previewDocument && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-slate-950/45 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Attachment preview"
        >
          <button
            type="button"
            onClick={() => setPreviewDocument(null)}
            className="absolute inset-0"
            aria-label="Close attachment preview"
          />
          <section className="relative z-10 w-full rounded-t-[22px] bg-white px-4 pb-4 pt-2 shadow-[0_-16px_40px_rgba(15,23,42,0.18)] animate-task-sheet">
            <div className="flex flex-col items-center">
              <span className="h-1 w-9 rounded-full bg-slate-300" />
            </div>
            <div className="mt-4 flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${
                  previewDocument.type === "pdf"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {previewDocument.type.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-slate-900">
                  {previewDocument.name}
                </p>
                <p className="mt-0.5 text-[11.5px] text-slate-500">
                  {previewDocument.size} · {previewDocument.date}
                </p>
              </div>
              <IconButton
                label="Close attachment preview"
                icon="close"
                onClick={() => setPreviewDocument(null)}
              />
            </div>
            <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
              {[
                ["Owner", previewDocument.author],
                ["Type", previewDocument.type.toUpperCase()],
                ["Linked task", item.id],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <span className="text-[11px] font-semibold text-slate-500">
                    {label}
                  </span>
                  <span className="min-w-0 truncate text-right text-[12px] font-semibold text-slate-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPreviewDocument(null)}
              className="mt-4 h-10 w-full rounded-xl bg-[#0055ff] text-[12.5px] font-semibold text-white transition-all duration-150 hover:bg-blue-700 active:scale-[0.98]"
            >
              Done
            </button>
          </section>
        </div>
      )}

      {/* Snap vs return-snap wipe comparison */}
      {isCompareOpen && snapFrames.length > 0 && returnSnaps.length > 0 && (
        <div
          className="absolute inset-0 z-[60] flex flex-col bg-white animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Compare snap with return snap"
        >
          <div className="flex shrink-0 items-start gap-3 border-b border-slate-100 px-4 pb-3 pt-4">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-slate-900">Compare</p>
              <p className="mt-0.5 text-[11px] leading-[15px] text-slate-500">
                Drag the handle to wipe the site return over the original snap.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCompareOpen(false)}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
              aria-label="Close compare"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-4">
            <div
              ref={compareTrackRef}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId)
                handleCompareMove(event.clientX)
              }}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  handleCompareMove(event.clientX)
              }}
              onPointerUp={(event) =>
                event.currentTarget.releasePointerCapture(event.pointerId)
              }
              className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.07)]"
            >
              <img
                src={
                  returnSnaps[
                    Math.min(activeReturnIndex, returnSnaps.length - 1)
                  ].src
                }
                alt="Return snap"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  clipPath: `inset(0 ${100 - comparePosition}% 0 0)`,
                }}
              >
                <img
                  src={
                    snapFrames[Math.min(activeSnapIndex, snapFrames.length - 1)]
                      .src
                  }
                  alt="Original snap"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>

              <span className="pointer-events-none absolute bottom-2.5 left-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-2xs backdrop-blur-md">
                Snap
              </span>
              <span className="pointer-events-none absolute bottom-2.5 right-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-2xs backdrop-blur-md">
                Return
              </span>

              <div
                className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(15,23,42,0.35)]"
                style={{ left: `calc(${comparePosition}% - 1px)` }}
              >
                <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0055ff] shadow-[0_4px_14px_rgba(15,23,42,0.28)] ring-1 ring-slate-200">
                  <Icon name="compare" size={16} />
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 px-4 pb-5 pt-4">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(comparePosition)}
              onChange={(event) =>
                setComparePosition(Number(event.target.value))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#0055ff]"
              aria-label="Wipe position"
            />
            <div className="mt-3 flex gap-2">
              {[
                { label: "Return only", value: 0 },
                { label: "Split", value: 50 },
                { label: "Snap only", value: 100 },
              ].map((preset) => {
                const isActive = Math.round(comparePosition) === preset.value
                return (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => setComparePosition(preset.value)}
                    className={`h-9 flex-1 cursor-pointer rounded-full text-[11.5px] font-semibold transition-colors ${
                      isActive
                        ? "bg-[#0055ff] text-white shadow-2xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {dependencyStep > 0 && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-slate-950/45 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Link a dependency"
        >
          <button
            type="button"
            onClick={resetDependencyDraft}
            className="absolute inset-0"
            aria-label="Close dependency picker"
          />

          <section className="relative z-10 flex max-h-[82%] w-full flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_-16px_40px_rgba(15,23,42,0.18)] animate-task-sheet">
            {/* Header */}
            <div className="shrink-0 px-4 pb-3 pt-2">
              <div className="flex flex-col items-center">
                <span className="h-1 w-9 rounded-full bg-slate-300" />
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                {dependencyStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setDependencyStep(dependencyStep - 1)}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                    aria-label="Previous step"
                  >
                    <Icon name="chevron-left" size={17} />
                  </button>
                ) : (
                  <span className="h-8 w-8 shrink-0" />
                )}

                <div className="min-w-0 flex-1 text-center">
                  <h2 className="truncate text-[14px] font-bold text-slate-900">
                    {dependencyStep === 1
                      ? "Choose the relationship"
                      : dependencyStep === 2
                        ? "Choose what to link"
                        : "Set the detail"}
                  </h2>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    Step {dependencyStep} of 3 ·{" "}
                    {dependencyStep === 1
                      ? "How the two are tied together"
                      : dependencyStep === 2
                        ? "Phase, category, item, or task"
                        : "Gap days and whether it blocks"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetDependencyDraft}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Close"
                >
                  <Icon name="close" size={17} />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="h-0.5 shrink-0 bg-slate-100">
              <div
                className="h-full rounded-r-full bg-[#0055ff] transition-all duration-300 ease-out"
                style={{ width: `${(dependencyStep / 3) * 100}%` }}
              />
            </div>

            {/* Step 1 — relationship */}
            {dependencyStep === 1 && (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
                {dependencyRelations.map((relation) => {
                  const isActive = dependencyRelation === relation.id
                  return (
                    <button
                      type="button"
                      key={relation.id}
                      onClick={() => {
                        setDependencyRelation(relation.id)
                        setDependencyStep(2)
                      }}
                      className={`flex w-full cursor-pointer items-start gap-3 rounded-xl px-2.5 py-3 text-left transition-colors ${
                        isActive ? "bg-blue-50/70" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                        <RelationDiagram relation={relation.id} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-slate-900">
                            {relation.id}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-px text-[9.5px] font-bold tracking-wide text-slate-500">
                            {relation.short}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[11.5px] leading-[16px] text-slate-500">
                          {relation.description}
                        </span>
                      </span>
                      {isActive && (
                        <Icon
                          name="check"
                          size={15}
                          className="mt-1 shrink-0 text-[#0055ff]"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 2 — target */}
            {dependencyStep === 2 && (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="shrink-0 px-4 pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10.5px] font-semibold text-[#0055ff]">
                    <RelationDiagram relation={dependencyRelation} />
                    {dependencyRelation}
                  </span>
                </div>

                <div className="mt-3 shrink-0 border-b border-slate-100 px-4">
                  <div className="flex gap-4">
                    {dependencyKinds.map((kind) => {
                      const isActive = dependencyKind === kind
                      return (
                        <button
                          type="button"
                          key={kind}
                          onClick={() => {
                            setDependencyKind(kind)
                            setDependencySearch("")
                          }}
                          className={`relative cursor-pointer pb-2 text-[11.5px] font-bold uppercase tracking-wide transition-colors ${
                            isActive
                              ? "text-[#0055ff]"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {kind}
                          {isActive && (
                            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#0055ff]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="shrink-0 px-4 pt-3">
                  <div className="flex h-10 items-center gap-2 rounded-xl bg-slate-100/80 px-3">
                    <Icon
                      name="search"
                      size={15}
                      className="shrink-0 text-slate-400"
                    />
                    <input
                      value={dependencySearch}
                      onChange={(event) =>
                        setDependencySearch(event.target.value)
                      }
                      placeholder={`Search ${dependencyKind.toLowerCase()} number or name...`}
                      className="min-w-0 flex-1 bg-transparent text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    {dependencySearch && (
                      <button
                        type="button"
                        onClick={() => setDependencySearch("")}
                        className="shrink-0 cursor-pointer text-slate-400 hover:text-slate-600"
                        aria-label="Clear search"
                      >
                        <Icon name="close" size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-1.5">
                  {dependencyCandidates.map((candidate) => (
                    <button
                      type="button"
                      key={candidate.id}
                      onClick={() => {
                        setDependencyTarget(candidate)
                        setDependencyStep(3)
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-1.5 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: candidate.dotColor }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[12.5px] text-slate-800">
                        <span className="text-slate-400 tabular-nums">
                          {candidate.id}
                        </span>
                        <span className="mx-1 text-slate-300">·</span>
                        {candidate.title}
                      </span>
                      <Icon
                        name="chevron-right"
                        size={15}
                        className="shrink-0 text-slate-300"
                      />
                    </button>
                  ))}

                  {dependencyCandidates.length === 0 && (
                    <p className="py-12 text-center text-[12px] text-slate-400">
                      No {dependencyKind.toLowerCase()} matches that search.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 — detail */}
            {dependencyStep === 3 && dependencyTarget && (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10.5px] font-semibold text-[#0055ff]">
                    {dependencyRelation}
                  </span>
                  <Icon
                    name="chevron-right"
                    size={12}
                    className="shrink-0 text-slate-300"
                  />
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-slate-600">
                    {dependencyKind}
                  </span>
                  <Icon
                    name="chevron-right"
                    size={12}
                    className="shrink-0 text-slate-300"
                  />
                  <span className="min-w-0 truncate text-[10.5px] font-medium text-slate-500 tabular-nums">
                    {dependencyTarget.id}
                  </span>
                </div>

                <div className="mt-3.5 border-t border-slate-100 pt-3.5">
                  <p className="text-[13px] font-semibold leading-snug text-slate-900">
                    {dependencyTarget.title}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">
                    Set the gap and whether this blocks work.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {([
                    ["wait", "Wait"],
                    ["safety", "Safety"],
                    ["free", "Free"],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-1 block text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                        {label}
                      </span>
                      <input
                        inputMode="numeric"
                        value={dependencyGaps[key]}
                        onChange={(event) =>
                          setDependencyGaps((current) => ({
                            ...current,
                            [key]: event.target.value.replace(/[^0-9]/g, ""),
                          }))
                        }
                        className="h-10 w-full rounded-xl bg-slate-100/80 px-3 text-[13px] font-medium text-slate-800 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-[#0055ff]/30 tabular-nums"
                      />
                    </label>
                  ))}
                </div>
                <p className="mt-1.5 text-[10.5px] text-slate-400">
                  Gap in days between the two.
                </p>

                <button
                  type="button"
                  onClick={() => setDependencyBlocksTask(!dependencyBlocksTask)}
                  className="mt-4 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all ${
                      dependencyBlocksTask
                        ? "border-rose-500 bg-rose-500 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    <Icon name="check" size={11} />
                  </span>
                  <Icon
                    name="ban"
                    size={14}
                    className={
                      dependencyBlocksTask ? "text-rose-500" : "text-slate-400"
                    }
                  />
                  <span className="text-[12.5px] font-medium text-slate-800">
                    This blocks the task
                  </span>
                </button>

                {dependencyBlocksTask && (
                  <div className="mt-2 animate-fade-in">
                    <textarea
                      value={dependencyReason}
                      onChange={(event) =>
                        setDependencyReason(event.target.value)
                      }
                      rows={2}
                      placeholder="Why is it blocked?"
                      className="w-full resize-none rounded-xl bg-slate-100/80 px-3 py-2.5 text-[12.5px] leading-[17px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0055ff]/30"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {dependencyStep === 3 && (
              <div
                className="shrink-0 border-t border-slate-100 px-4 pt-3"
                style={{
                  paddingBottom: "max(14px, env(safe-area-inset-bottom))",
                }}
              >
                <button
                  type="button"
                  onClick={addDependency}
                  className="h-11 w-full cursor-pointer rounded-full bg-[#0055ff] text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 active:scale-[0.99]"
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
          className="absolute inset-0 z-50 flex items-end bg-slate-950/45 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Link a record"
        >
          <button
            type="button"
            onClick={() => {
              setIsLinkPickerOpen(false)
              setLinkSearch("")
            }}
            className="absolute inset-0"
            aria-label="Close record picker"
          />

          <section className="relative z-10 flex max-h-[80%] min-h-[440px] w-full flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_-16px_40px_rgba(15,23,42,0.18)] animate-task-sheet">
            <div className="shrink-0 px-4 pb-3 pt-2">
              <div className="flex flex-col items-center">
                <span className="h-1 w-9 rounded-full bg-slate-300" />
              </div>
              <div className="mt-2.5 flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h2 className="text-[14px] font-bold text-slate-900">
                    Link an existing record
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Issue, RFI or field note this task resolves
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLinkPickerOpen(false)
                    setLinkSearch("")
                  }}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Close"
                >
                  <Icon name="close" size={17} />
                </button>
              </div>

              <div className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-slate-100/80 px-3">
                <Icon
                  name="search"
                  size={15}
                  className="shrink-0 text-slate-400"
                />
                <input
                  value={linkSearch}
                  onChange={(event) => setLinkSearch(event.target.value)}
                  placeholder="Search issue, RFI or field note..."
                  className="min-w-0 flex-1 bg-transparent text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400"
                />
                {linkSearch && (
                  <button
                    type="button"
                    onClick={() => setLinkSearch("")}
                    className="shrink-0 cursor-pointer text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <Icon name="close" size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              {filteredLinkCandidates.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredLinkCandidates.map((candidate) => {
                    const isLinked = linkedRecords.some(
                      (record) => record.id === candidate.id,
                    )
                    return (
                      <button
                        type="button"
                        key={candidate.id}
                        disabled={isLinked}
                        onClick={() => linkRecord(candidate)}
                        className="flex w-full cursor-pointer items-start gap-2.5 py-3 text-left transition-colors hover:bg-slate-50/70 disabled:cursor-default disabled:opacity-45"
                      >
                        <span
                          className="mt-[7px] h-2 w-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: priorityColors[candidate.priority],
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-1.5">
                            <span className="shrink-0 text-[11px] font-bold text-[#0055ff] tabular-nums">
                              #{candidate.id}
                            </span>
                            <span className="min-w-0 truncate text-[12.5px] font-medium text-slate-800">
                              {candidate.title}
                            </span>
                          </span>
                          <span className="mt-1.5 flex items-center gap-1.5">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${linkedStatusStyles[candidate.status]}`}
                            >
                              {candidate.status}
                            </span>
                            <span
                              className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide"
                              style={{
                                color: priorityColors[candidate.priority],
                              }}
                            >
                              <FilledFlagIcon
                                color={priorityColors[candidate.priority]}
                                size={11}
                              />
                              {candidate.priority}
                            </span>
                          </span>
                        </span>
                        {isLinked && (
                          <span className="mt-1 flex shrink-0 items-center gap-1 text-[10px] font-semibold text-emerald-600">
                            <Icon name="check" size={12} /> Linked
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  icon="search"
                  title="No records found"
                  description="Try another search term, or create the record in its own workspace first."
                />
              )}
            </div>
          </section>
        </div>
      )}

      {/* Custom-made Beautiful Calendar Date Picker Bottom Sheet */}
      {isCalendarSheetOpen && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-slate-950/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Select due date"
        >
          {/* Backdrop dismiss */}
          <button
            type="button"
            onClick={() => setIsCalendarSheetOpen(false)}
            className="absolute inset-0 cursor-default"
            aria-label="Close calendar"
          />

          {/* Bottom Sheet Card */}
          <section
            className="relative z-10 w-full rounded-t-[28px] bg-white px-4 pb-6 pt-3 shadow-[0_-16px_48px_rgba(15,23,42,0.22)] animate-task-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drag Handle */}
            <div className="flex justify-center mb-2.5">
              <span className="h-1 w-10 rounded-full bg-slate-200" />
            </div>

            {/* Header and Calendar Body */}
            {(() => {
              const isSubtask =
                calendarTarget?.type === "subtask" &&
                Boolean(calendarTarget.subtaskId)
              const targetSubtask = isSubtask
                ? subtasks.find((s) => s.id === calendarTarget?.subtaskId)
                : null
              const activeDueDate = isSubtask
                ? targetSubtask?.dueDate || ""
                : item.dueDate || ""
              const displayDateTitle = isSubtask
                ? formatSubtaskDueDate(activeDueDate) !== "Set date"
                  ? formatSubtaskDueDate(activeDueDate)
                  : targetSubtask?.title || "Subtask Due Date"
                : formatDate(item.dueDate)

              const handleApplyDate = (targetIso: string) => {
                if (isSubtask && calendarTarget?.subtaskId) {
                  const sId = calendarTarget.subtaskId
                  setSubtasks((current) =>
                    current.map((s) =>
                      s.id === sId ? { ...s, dueDate: targetIso } : s,
                    ),
                  )
                  const [y, m] = targetIso.split("-").map(Number)
                  if (!isNaN(y) && !isNaN(m)) {
                    setCalendarViewMonth(new Date(y, m - 1, 1))
                  }
                  showToast(`Subtask date set to ${formatDate(targetIso)}`)
                } else {
                  onUpdate(item.id, { dueDate: targetIso })
                  const [y, m] = targetIso.split("-").map(Number)
                  if (!isNaN(y) && !isNaN(m)) {
                    setCalendarViewMonth(new Date(y, m - 1, 1))
                  }
                  showToast(`Date set to ${formatDate(targetIso)}`)
                }
              }

              const handleClearDate = () => {
                if (isSubtask && calendarTarget?.subtaskId) {
                  const sId = calendarTarget.subtaskId
                  setSubtasks((current) =>
                    current.map((s) =>
                      s.id === sId ? { ...s, dueDate: undefined } : s,
                    ),
                  )
                  setIsCalendarSheetOpen(false)
                  showToast("Subtask due date cleared")
                } else {
                  onUpdate(item.id, { dueDate: "" })
                  setIsCalendarSheetOpen(false)
                  showToast("Due date cleared")
                }
              }

              return (
                <>
                  <div className="relative flex items-center justify-between pb-2.5 border-b border-slate-100">
                    {/* Dropdown for Day / Week / Month */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIsCalendarModeDropdownOpen((prev) => !prev)
                        }
                        className="flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 text-[11.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 active:scale-95"
                        aria-haspopup="listbox"
                        aria-expanded={isCalendarModeDropdownOpen}
                      >
                        <Icon
                          name="calendar"
                          size={12}
                          className="text-[#0055ff]"
                        />
                        <span className="capitalize">{calendarMode}</span>
                        <Icon
                          name="chevron-down"
                          size={11}
                          className={`text-slate-400 transition-transform duration-150 ${
                            isCalendarModeDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isCalendarModeDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setIsCalendarModeDropdownOpen(false)}
                          />
                          <div
                            className="absolute left-0 top-full z-40 mt-1 w-32 rounded-xl border border-slate-200/90 bg-white p-1 shadow-lg shadow-slate-900/10 animate-scale-in"
                            onClick={(e) => e.stopPropagation()}
                            role="listbox"
                          >
                            {(["day", "week", "month"] as CalendarMode[]).map(
                              (m) => {
                                const isSelected = calendarMode === m
                                return (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                      setCalendarMode(m)
                                      setIsCalendarModeDropdownOpen(false)
                                    }}
                                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] font-semibold transition-colors ${
                                      isSelected
                                        ? "bg-blue-50 text-[#0055ff]"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                    role="option"
                                    aria-selected={isSelected}
                                  >
                                    <span className="capitalize">{m}</span>
                                    {isSelected && (
                                      <Icon
                                        name="check"
                                        size={12}
                                        className="text-[#0055ff]"
                                      />
                                    )}
                                  </button>
                                )
                              },
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCalendarModeDropdownOpen(false)
                        setIsCalendarSheetOpen(false)
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label="Close calendar"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </div>

                  <div className="mt-2">
                    <Calendar
                      value={activeDueDate || undefined}
                      onChange={(selection) => handleApplyDate(selection.start)}
                      modes={["day", "week", "month"]}
                      mode={calendarMode}
                      onModeChange={setCalendarMode}
                      hideModeSwitch={true}
                      accent="#0055ff"
                    />
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleClearDate}
                      className="flex-1 h-7.5 rounded-full border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Clear date
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCalendarSheetOpen(false)
                        showToast(`Due date confirmed: ${displayDateTitle}`)
                      }}
                      className="flex-2 h-7.5 rounded-full bg-[#0055ff] text-[11px] font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {activeDueDate
                        ? `Confirm ${formatDate(activeDueDate)}`
                        : "Done"}
                    </button>
                  </div>
                </>
              )
            })()}
          </section>
        </div>
      )}
    </div>
  )
}
