export type ItemType = "issue" | "task" | "rfi" | "fieldnote"
export type Status = "TO DO" | "IN PROGRESS" | "COMPLETED" | "BLOCKED" | "REVIEW" | "APPROVED"
export type Severity = "HIGH" | "MEDIUM" | "LOW"

export interface Assignee {
  id: string
  name: string
  initials: string
  color: string
}

export interface ActivityEntry {
  id: string
  text: string
  date: string
}

export interface Item {
  id: string
  type: ItemType
  title: string
  description: string
  status: Status
  severity: Severity
  assignees: Assignee[]
  dueDate: string
  location: { x: number y: number label: string }
  photos: string[]
  activity: ActivityEntry[]
  progress?: number
  tags?: string[]
  phase?: string
  category?: string
}

export const availablePhases = [
  "Pre - construction Tasks",
  "Construction Execution",
  "Testing & Handover",
  "Site Survey & Foundation",
]

export const availableCategories = [
  "Structural",
  "MEP & HVAC",
  "Architectural",
  "Safety & Fire",
  "Finishing",
  "Civil & Earthworks",
]

const assignees: Assignee[] = [
  { id: "a1", name: "Robert Miller", initials: "RM", color: "#6366f1" },
  { id: "a2", name: "John Doe", initials: "JD", color: "#f43f5e" },
  { id: "a3", name: "Priya Singh", initials: "PS", color: "#22c55e" },
  { id: "a4", name: "Carlos Lima", initials: "CL", color: "#f97316" },
  { id: "a5", name: "Nadia Wu", initials: "NW", color: "#a855f7" },
]

const sitePhotos = [
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop&auto=format",
]

export const mockItems: Item[] = [
  {
    id: "ISSUE-018",
    type: "issue",
    title: "Structural Column Clash with M&E Duct",
    description:
      "400mm vertical drainage pipe intersects primary structural column at Grid B4, Level 03. Immediate coordination required before concrete pour.",
    status: "TO DO",
    severity: "HIGH",
    assignees: [assignees[0], assignees[1]],
    dueDate: "2026-09-15",
    location: { x: 55, y: 230, label: "Grid B4, Level 03" },
    photos: [sitePhotos[0], sitePhotos[1]],
    activity: [
      {
        id: "ac1",
        text: "Issue created by Robert Miller",
        date: "10 Aug 2026",
      },
      {
        id: "ac2",
        text: "You changed status from 'in progress' to 'blocked'",
        date: "12 Aug 2026",
      },
      { id: "ac3", text: "Uploaded 2 attachments", date: "14 Aug 2026" },
    ],
    tags: ["Structural", "Rebar & Formwork"],
    phase: "Construction Execution",
    category: "Structural",
  },
  {
    id: "ISSUE-017",
    type: "issue",
    title: "Fire Damper Inspection Clearance Required",
    description:
      "Motorised fire damper actuator on Floor 4 has less than 150mm maintenance clearance per code requirements.",
    status: "IN PROGRESS",
    severity: "HIGH",
    assignees: [assignees[2], assignees[3]],
    dueDate: "2026-09-10",
    location: { x: 185, y: 280, label: "Floor 4 — North Wing" },
    photos: [sitePhotos[2]],
    activity: [
      {
        id: "ac4",
        text: "Issue flagged during site walk",
        date: "08 Aug 2026",
      },
    ],
    tags: ["Fire Safety"],
    phase: "Testing & Handover",
    category: "Safety & Fire",
  },
  {
    id: "ISSUE-016",
    type: "issue",
    title: "Electrical Cable Tray Intersection with Chiller",
    description:
      "Heavy-duty 600mm electrical ladder tray overlaps with chiller maintenance access panel.",
    status: "TO DO",
    severity: "MEDIUM",
    assignees: [assignees[4]],
    dueDate: "2026-09-20",
    location: { x: 290, y: 380, label: "Basement — Plant Room" },
    photos: [],
    activity: [],
    tags: ["Electrical", "MEP"],
    phase: "Pre - construction Tasks",
    category: "MEP & HVAC",
  },
  {
    id: "ISSUE-015",
    type: "issue",
    title: "Expansion Joint Cover Flashing Detail Conflict",
    description:
      "Architectural flashing detail drawing REV-D does not match structural joint location in Tower B.",
    status: "IN PROGRESS",
    severity: "MEDIUM",
    assignees: [assignees[0]],
    dueDate: "2026-09-05",
    location: { x: 70, y: 580, label: "Tower B — Level 02" },
    photos: [sitePhotos[3], sitePhotos[4]],
    activity: [
      {
        id: "ac5",
        text: "Reviewed by structural consultant",
        date: "05 Aug 2026",
      },
    ],
    tags: ["Architectural"],
    phase: "Pre - construction Tasks",
    category: "Architectural",
  },
  {
    id: "ISSUE-014",
    type: "issue",
    title: "Curtain Wall Bracket Anchor Point Misalignment",
    description:
      "Drilling embedded anchors for Level 02 Elevation curtain wall deviated 35mm from drawing.",
    status: "REVIEW",
    severity: "HIGH",
    assignees: [assignees[1], assignees[3]],
    dueDate: "2026-09-08",
    location: { x: 300, y: 580, label: "East Facade — Level 02" },
    photos: [sitePhotos[0]],
    activity: [],
    tags: ["Facade"],
    phase: "Construction Execution",
    category: "Architectural",
  },
  {
    id: "ISSUE-013",
    type: "issue",
    title: "Elevator Pit Waterproofing Membrane Gap",
    description:
      "Sump pump discharge sleeve in Elevator Pit #2 penetrates waterproofing membrane without proper seal.",
    status: "BLOCKED",
    severity: "HIGH",
    assignees: [assignees[2]],
    dueDate: "2026-09-12",
    location: { x: 25, y: 745, label: "Basement — Lift Core" },
    photos: [],
    activity: [],
    tags: ["Waterproofing"],
    phase: "Site Survey & Foundation",
    category: "Civil & Earthworks",
  },
  {
    id: "TASK-001",
    type: "task",
    title: "Complete reinforcement inspection for Grid B4",
    description:
      "Inspect all rebar placement and cover depths at Grid B4 before formwork close-up.",
    status: "COMPLETED",
    severity: "HIGH",
    assignees: [assignees[0], assignees[1], assignees[2]],
    dueDate: "2026-09-11",
    location: { x: 120, y: 200, label: "Grid B4 — Level 03" },
    photos: [sitePhotos[1], sitePhotos[2]],
    activity: [
      {
        id: "ac6",
        text: "You changed status from 'in progress' to 'completed'",
        date: "14 Aug 2026",
      },
      {
        id: "ac7",
        text: "Approved by John Doe · 14 Aug 2026",
        date: "14 Aug 2026",
      },
    ],
    progress: 100,
    tags: ["Rebar & Formwork", "Milestone"],
    phase: "Pre - construction Tasks",
    category: "Structural",
  },
  {
    id: "TASK-002",
    type: "task",
    title: "Install supply air duct in Level 03 corridor",
    description:
      "Install 600×400mm supply air duct along the Level 03 main corridor per drawing M-301.",
    status: "TO DO",
    severity: "MEDIUM",
    assignees: [assignees[3]],
    dueDate: "2026-09-18",
    location: { x: 200, y: 430, label: "Level 03 — Corridor" },
    photos: [],
    activity: [],
    progress: 0,
    tags: ["HVAC"],
    phase: "Construction Execution",
    category: "MEP & HVAC",
  },
  {
    id: "TASK-003",
    type: "task",
    title: "Install tiles in Tower B reception area",
    description:
      "Lay 600×600mm porcelain tiles in Tower B ground floor reception per finish schedule.",
    status: "IN PROGRESS",
    severity: "LOW",
    assignees: [assignees[4], assignees[0]],
    dueDate: "2026-09-22",
    location: { x: 340, y: 260, label: "Tower B — Ground Floor" },
    photos: [sitePhotos[4]],
    activity: [],
    progress: 35,
    tags: ["Finishing"],
    phase: "Testing & Handover",
    category: "Finishing",
  },
  {
    id: "TASK-004",
    type: "task",
    title: "Pour concrete for Level 01 slab (Tower A)",
    description:
      "Concrete pour for Level 01 suspended slab, Tower A. Volume: 420m³. Target slump: 120mm.",
    status: "IN PROGRESS",
    severity: "HIGH",
    assignees: [assignees[2], assignees[3]],
    dueDate: "2026-09-09",
    location: { x: 90, y: 490, label: "Tower A — Level 01" },
    photos: [sitePhotos[0], sitePhotos[3]],
    activity: [
      {
        id: "ac8",
        text: "Concrete delivery confirmed — 07:00 AM",
        date: "09 Sep 2026",
      },
    ],
    progress: 60,
    tags: ["Structure"],
    phase: "Construction Execution",
    category: "Structural",
  },
  {
    id: "TASK-005",
    type: "task",
    title: "Calibrate fire alarm sensors and test panel",
    description:
      "Verify addressable fire detection sensors across Level 02 and test central control annunciator.",
    status: "REVIEW",
    severity: "HIGH",
    assignees: [assignees[1]],
    dueDate: "2026-09-14",
    location: { x: 190, y: 290, label: "Level 02 — Control Room" },
    photos: [],
    activity: [],
    progress: 85,
    tags: ["Safety"],
    phase: "Testing & Handover",
    category: "Safety & Fire",
  },
  {
    id: "TASK-006",
    type: "task",
    title: "Excavation shoring inspection for West Wing",
    description:
      "Verify soldier pile deflection limits and tie-back anchor tension load test reports.",
    status: "BLOCKED",
    severity: "HIGH",
    assignees: [assignees[0], assignees[3]],
    dueDate: "2026-09-07",
    location: { x: 50, y: 150, label: "West Wing — Perimeter" },
    photos: [sitePhotos[0]],
    activity: [],
    progress: 20,
    tags: ["Civil"],
    phase: "Site Survey & Foundation",
    category: "Civil & Earthworks",
  },
  {
    id: "RFI-001",
    type: "rfi",
    title: "Clarification on Beam Depth at Grid C-C5",
    description:
      "Drawing S-204 shows 600mm deep beam but structural calculations indicate 750mm. Please confirm correct depth for fabrication.",
    status: "IN PROGRESS",
    severity: "HIGH",
    assignees: [assignees[1]],
    dueDate: "2026-09-14",
    location: { x: 185, y: 380, label: "Grid C-C5 — Level 02" },
    photos: [sitePhotos[1]],
    activity: [
      {
        id: "ac9",
        text: "RFI submitted to structural engineer",
        date: "11 Aug 2026",
      },
    ],
    tags: ["Structural"],
    phase: "Pre - construction Tasks",
    category: "Structural",
  },
  {
    id: "RFI-002",
    type: "rfi",
    title: "Door Schedule Discrepancy — Block D Stairwell",
    description:
      "Door D-47 is listed as 1800mm width in schedule but opening in wall is 900mm. Confirm correct dimension.",
    status: "TO DO",
    severity: "MEDIUM",
    assignees: [assignees[4]],
    dueDate: "2026-09-20",
    location: { x: 290, y: 580, label: "Block D — Stairwell" },
    photos: [],
    activity: [],
    tags: ["Architectural"],
    phase: "Construction Execution",
    category: "Architectural",
  },
  {
    id: "RFI-003",
    type: "rfi",
    title: "Pipe Insulation Specification for Chilled Water",
    description:
      "Specification section 15080 references two different insulation thicknesses. Please confirm applicable thickness for DN150 chilled water pipes.",
    status: "APPROVED",
    severity: "LOW",
    assignees: [assignees[0], assignees[2]],
    dueDate: "2026-08-30",
    location: { x: 140, y: 660, label: "Basement — Plant Room" },
    photos: [sitePhotos[2]],
    activity: [
      {
        id: "ac10",
        text: "Approved by consultant · 29 Aug 2026",
        date: "29 Aug 2026",
      },
    ],
    tags: ["MEP", "Specification"],
    phase: "Pre - construction Tasks",
    category: "MEP & HVAC",
  },
  {
    id: "RFI-004",
    type: "rfi",
    title: "Acoustic Ceiling Rating Verification for Tower B",
    description:
      "Confirmation needed whether NRC rating of 0.85 applies to common corridors or only conference halls.",
    status: "REVIEW",
    severity: "LOW",
    assignees: [assignees[3]],
    dueDate: "2026-09-25",
    location: { x: 210, y: 340, label: "Tower B — Level 03" },
    photos: [],
    activity: [],
    tags: ["Finishing"],
    phase: "Testing & Handover",
    category: "Finishing",
  },
  {
    id: "FN-001",
    type: "fieldnote",
    title: "Rebar exposed at north perimeter wall",
    description:
      "Observed corroded rebar exposure at north perimeter retaining wall, approx 3m length. Requires treatment before waterproofing.",
    status: "TO DO",
    severity: "MEDIUM",
    assignees: [assignees[3]],
    dueDate: "2026-09-16",
    location: { x: 50, y: 160, label: "North Perimeter — Retaining Wall" },
    photos: [sitePhotos[3]],
    activity: [],
    tags: ["Site Observation"],
    phase: "Construction Execution",
    category: "Civil & Earthworks",
  },
  {
    id: "FN-002",
    type: "fieldnote",
    title: "Temporary lighting insufficient in Level B2",
    description:
      "Level B2 parking area has inadequate temporary lighting — below minimum 50 lux for safe works. Additional lights required urgently.",
    status: "IN PROGRESS",
    severity: "HIGH",
    assignees: [assignees[2]],
    dueDate: "2026-09-06",
    location: { x: 220, y: 700, label: "Level B2 — Parking" },
    photos: [],
    activity: [
      { id: "ac11", text: "Notified site safety officer", date: "05 Sep 2026" },
    ],
    tags: ["Safety"],
    phase: "Construction Execution",
    category: "Safety & Fire",
  },
  {
    id: "FN-003",
    type: "fieldnote",
    title: "Hoarding damage at south gate entry",
    description:
      "Site hoarding panels at south entry gate have been displaced, creating gap. Requires immediate repair for site security.",
    status: "COMPLETED",
    severity: "LOW",
    assignees: [assignees[0]],
    dueDate: "2026-09-03",
    location: { x: 180, y: 800, label: "South Gate Entry" },
    photos: [sitePhotos[4]],
    activity: [
      {
        id: "ac12",
        text: "Repaired and signed off · 03 Sep 2026",
        date: "03 Sep 2026",
      },
    ],
    tags: ["Site Logistics"],
    phase: "Site Survey & Foundation",
    category: "Safety & Fire",
  },
  {
    id: "FN-004",
    type: "fieldnote",
    title: "Crane swing radius conflict — Tower crane TC-02",
    description:
      "TC-02 swing radius overlaps with adjacent street during peak traffic hours. Coordination with council required.",
    status: "REVIEW",
    severity: "HIGH",
    assignees: [assignees[1], assignees[4]],
    dueDate: "2026-09-10",
    location: { x: 310, y: 150, label: "Site Perimeter — East" },
    photos: [sitePhotos[0], sitePhotos[1]],
    activity: [],
    tags: ["Crane", "Safety"],
    phase: "Pre - construction Tasks",
    category: "Safety & Fire",
  },
  {
    id: "FN-005",
    type: "fieldnote",
    title: "Water ponding observed on roof terrace slab",
    description:
      "Slope toward rainwater outlet is insufficient near Grid A1, causing 20mm standing water after overnight rain.",
    status: "BLOCKED",
    severity: "MEDIUM",
    assignees: [assignees[0], assignees[2]],
    dueDate: "2026-09-17",
    location: { x: 160, y: 190, label: "Roof Terrace — Grid A1" },
    photos: [sitePhotos[2]],
    activity: [],
    tags: ["Waterproofing"],
    phase: "Testing & Handover",
    category: "Civil & Earthworks",
  },
]

export const getItemsByType = (type: ItemType) =>
  mockItems.filter((item) => item.type === type)

export const getItemById = (id: string) =>
  mockItems.find((item) => item.id === id)

export const statusColors: Record<string, { bg: string text: string }> = {
  "TO DO": { bg: "#eff6ff", text: "#1d4ed8" },
  "IN PROGRESS": { bg: "#faf5ff", text: "#7c3aed" },
  COMPLETED: { bg: "#f0fdf4", text: "#15803d" },
  BLOCKED: { bg: "#fef2f2", text: "#dc2626" },
  REVIEW: { bg: "#fffbeb", text: "#b45309" },
  APPROVED: { bg: "#f0fdf4", text: "#15803d" },
}

export const severityColors: Record<string, {
  bg: string
  text: string
  dot: string
}> = {
  HIGH: { bg: "#fff7ed", text: "#c2410c", dot: "#f97316" },
  MEDIUM: { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
  LOW: { bg: "#f9fafb", text: "#374151", dot: "#9ca3af" },
}

export const typeLabels: Record<ItemType, string> = {
  issue: "Issue",
  task: "Task",
  rfi: "RFI",
  fieldnote: "Field Note",
}

export const typeColors: Record<ItemType, string> = {
  issue: "#ef4444",
  task: "#0052ff",
  rfi: "#f59e0b",
  fieldnote: "#10b981",
}

export const typeIcons: Record<ItemType, string> = {
  issue: "!",
  task: "✓",
  rfi: "?",
  fieldnote: "N",
}
