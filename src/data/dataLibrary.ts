/**
 * Workspace "Data" library — the five data buckets that hang off the
 * drawer's Data entry, plus the files/folders each one holds.
 */

export type DataCategoryId =
  | "drawings2d"
  | "model3d"
  | "survey"
  | "submissions"
  | "bimbox"

export type DataTab = "uploads" | "shared" | "structure"

export type DataEntryKind =
  | "pdf"
  | "csv"
  | "xlsx"
  | "dwg"
  | "ifc"
  | "rvt"
  | "image"
  | "zip"
  | "folder"

export interface DataEntry {
  id: string
  name: string
  kind: DataEntryKind
  /** Bytes as shown in the size column. */
  sizeKb: number
  createdOn: string
  editedOn: string
  /** Initials of the collaborators the entry is shared with. */
  sharedWith: string[]
  /** Folders only: how many children sit inside. */
  items?: number
  /** Folders only: the two-letter tile shown ahead of the name. */
  badge?: string
  badgeColor?: string
  /** Folders only: what opening the folder shows. */
  children?: DataEntry[]
}

export interface DataCategory {
  id: DataCategoryId
  label: string
  description: string
  /** Icon key understood by the screen's <Icon /> switch. */
  icon: string
  entries: Record<DataTab, DataEntry[]>
}

const owners = {
  ak: "AK",
  jd: "JD",
  rv: "RV",
  sm: "SM",
  pn: "PN",
}

const childExtension: Record<DataEntryKind, string> = {
  pdf: "pdf",
  csv: "csv",
  xlsx: "xlsx",
  dwg: "dwg",
  ifc: "ifc",
  rvt: "rvt",
  image: "jpg",
  zip: "zip",
  folder: "",
}

/** Deterministic contents for a discipline folder, so opening the same
 *  folder always shows the same files. */
function folderChildren(
  prefix: string,
  badge: string,
  discipline: string,
  count: number,
): DataEntry[] {
  const kinds: DataEntryKind[] = [
    "pdf",
    "dwg",
    "ifc",
    "csv",
    "xlsx",
    "image",
    "zip",
    "rvt",
  ]
  const crews = [
    [owners.rv, owners.jd],
    [owners.ak],
    [owners.sm, owners.pn],
    [owners.jd, owners.ak, owners.rv],
    [],
  ]
  const slug = discipline.replace(/\s+/g, "")

  return Array.from({ length: count }, (_, index) => {
    const kind = kinds[index % kinds.length]
    const seq = String(index + 1).padStart(3, "0")
    const day = String((index % 27) + 1).padStart(2, "0")
    return {
      id: `${prefix}-${badge}-${seq}`,
      name: `${badge}-${seq}-${slug}.${childExtension[kind]}`,
      kind,
      sizeKb: 120 + ((index * 977) % 9200),
      createdOn: `${day} Aug 2026 09:15`,
      editedOn: `${day} Aug 2026 16:30`,
      sharedWith: crews[index % crews.length],
    }
  })
}

/** Shared "Project structure" skeleton — the same discipline folders
 *  every bucket is organised by, so the tab reads the same everywhere. */
function structureFolders(prefix: string): DataEntry[] {
  const disciplines: { name: string; badge: string; color: string; items: number }[] = [
    { name: "Architectural", badge: "AR", color: "#0055ff", items: 24 },
    { name: "Structural", badge: "ST", color: "#7c3aed", items: 18 },
    { name: "MEP", badge: "ME", color: "#0891b2", items: 31 },
    { name: "HVAC", badge: "HV", color: "#ea580c", items: 12 },
    { name: "Site Capture", badge: "SI", color: "#059669", items: 9 },
    { name: "ICT", badge: "IC", color: "#db2777", items: 6 },
    { name: "Plumbing", badge: "PL", color: "#2563eb", items: 14 },
  ]

  return disciplines.map((d, index) => ({
    id: `${prefix}-fld-${index + 1}`,
    name: d.name,
    kind: "folder",
    sizeKb: 5 * 1024,
    createdOn: "19 Aug 2026 17:48",
    editedOn: "19 Aug 2026 17:48",
    sharedWith: [owners.rv, owners.jd],
    items: d.items,
    badge: d.badge,
    badgeColor: d.color,
    children: folderChildren(prefix, d.badge, d.name, d.items),
  }))
}

export const dataCategories: DataCategory[] = [
  {
    id: "drawings2d",
    label: "2D Drawings",
    description: "Plans, sections & sheet sets",
    icon: "drawings",
    entries: {
      uploads: [
        {
          id: "d2-u1",
          name: "A-101_Level03_FloorPlan.pdf",
          kind: "pdf",
          sizeKb: 4820,
          createdOn: "19 Aug 2026 17:48",
          editedOn: "21 Aug 2026 09:12",
          sharedWith: [owners.rv, owners.jd],
        },
        {
          id: "d2-u2",
          name: "S-204_Rebar_Detail.dwg",
          kind: "dwg",
          sizeKb: 12640,
          createdOn: "18 Aug 2026 11:02",
          editedOn: "20 Aug 2026 16:35",
          sharedWith: [owners.ak],
        },
        {
          id: "d2-u3",
          name: "Sheet_Register_Rev_C.csv",
          kind: "csv",
          sizeKb: 42,
          createdOn: "17 Aug 2026 08:20",
          editedOn: "17 Aug 2026 08:20",
          sharedWith: [owners.rv, owners.jd, owners.sm],
        },
      ],
      shared: [
        {
          id: "d2-s1",
          name: "M-310_Ductwork_Coordination.pdf",
          kind: "pdf",
          sizeKb: 6180,
          createdOn: "14 Aug 2026 13:44",
          editedOn: "19 Aug 2026 10:05",
          sharedWith: [owners.pn, owners.ak],
        },
        {
          id: "d2-s2",
          name: "E-402_Riser_Diagram.dwg",
          kind: "dwg",
          sizeKb: 8930,
          createdOn: "12 Aug 2026 09:15",
          editedOn: "18 Aug 2026 14:50",
          sharedWith: [owners.jd],
        },
      ],
      structure: structureFolders("d2"),
    },
  },
  {
    id: "model3d",
    label: "3D Model",
    description: "Federated models & coordination",
    icon: "cube",
    entries: {
      uploads: [
        {
          id: "m3-u1",
          name: "STW_Federated_R12.ifc",
          kind: "ifc",
          sizeKb: 486400,
          createdOn: "19 Aug 2026 17:48",
          editedOn: "22 Aug 2026 07:30",
          sharedWith: [owners.rv, owners.jd],
        },
        {
          id: "m3-u2",
          name: "Structural_TowerB.rvt",
          kind: "rvt",
          sizeKb: 312800,
          createdOn: "16 Aug 2026 15:10",
          editedOn: "21 Aug 2026 18:02",
          sharedWith: [owners.ak, owners.sm],
        },
      ],
      shared: [
        {
          id: "m3-s1",
          name: "MEP_Services_R08.ifc",
          kind: "ifc",
          sizeKb: 254300,
          createdOn: "11 Aug 2026 10:25",
          editedOn: "20 Aug 2026 12:40",
          sharedWith: [owners.pn],
        },
        {
          id: "m3-s2",
          name: "Clash_Report_Week34.xlsx",
          kind: "xlsx",
          sizeKb: 780,
          createdOn: "20 Aug 2026 09:00",
          editedOn: "20 Aug 2026 09:00",
          sharedWith: [owners.rv, owners.jd, owners.ak],
        },
      ],
      structure: structureFolders("m3"),
    },
  },
  {
    id: "survey",
    label: "Survey Data",
    description: "Setting-out, control & as-builts",
    icon: "survey",
    entries: {
      uploads: [
        {
          id: "sv-u1",
          name: "Control_Points_GridB.csv",
          kind: "csv",
          sizeKb: 96,
          createdOn: "19 Aug 2026 17:48",
          editedOn: "19 Aug 2026 17:48",
          sharedWith: [owners.rv, owners.jd],
        },
        {
          id: "sv-u2",
          name: "L03_Slab_Levels_Asbuilt.xlsx",
          kind: "xlsx",
          sizeKb: 340,
          createdOn: "18 Aug 2026 07:55",
          editedOn: "21 Aug 2026 11:24",
          sharedWith: [owners.ak],
        },
        {
          id: "sv-u3",
          name: "Setting_Out_Report.pdf",
          kind: "pdf",
          sizeKb: 2140,
          createdOn: "15 Aug 2026 16:30",
          editedOn: "15 Aug 2026 16:30",
          sharedWith: [owners.sm, owners.pn],
        },
      ],
      shared: [
        {
          id: "sv-s1",
          name: "Topographic_Survey_Rev_B.dwg",
          kind: "dwg",
          sizeKb: 15280,
          createdOn: "09 Aug 2026 12:05",
          editedOn: "17 Aug 2026 09:45",
          sharedWith: [owners.jd, owners.rv],
        },
      ],
      structure: structureFolders("sv"),
    },
  },
  {
    id: "submissions",
    label: "Submissions",
    description: "Estimates, RFIs & approvals",
    icon: "submissions",
    entries: {
      uploads: [
        {
          id: "sb-u1",
          name: "EST_002_Estimate_002 (1).pdf",
          kind: "pdf",
          sizeKb: 5 * 1024,
          createdOn: "19 Aug 2026 17:48",
          editedOn: "19 Aug 2026 17:48",
          sharedWith: [owners.rv, owners.jd],
        },
        {
          id: "sb-u2",
          name: "InteliBIM Employee Details .csv",
          kind: "csv",
          sizeKb: 5 * 1024,
          createdOn: "19 Aug 2026 17:48",
          editedOn: "19 Aug 2026 17:48",
          sharedWith: [owners.rv, owners.jd],
        },
      ],
      shared: [
        {
          id: "sb-s1",
          name: "RFI_118_Response_Pack.pdf",
          kind: "pdf",
          sizeKb: 3260,
          createdOn: "13 Aug 2026 14:18",
          editedOn: "19 Aug 2026 08:02",
          sharedWith: [owners.ak, owners.pn],
        },
        {
          id: "sb-s2",
          name: "Material_Approvals_Q3.zip",
          kind: "zip",
          sizeKb: 48600,
          createdOn: "10 Aug 2026 10:40",
          editedOn: "18 Aug 2026 17:10",
          sharedWith: [owners.sm],
        },
      ],
      structure: structureFolders("sb"),
    },
  },
  {
    id: "bimbox",
    label: "BIMBOX Data",
    description: "Telemetry, exports & device logs",
    icon: "layers",
    entries: {
      uploads: [
        {
          id: "bx-u1",
          name: "BIMBOX_Session_0912.zip",
          kind: "zip",
          sizeKb: 128400,
          createdOn: "19 Aug 2026 17:48",
          editedOn: "19 Aug 2026 17:48",
          sharedWith: [owners.rv],
        },
        {
          id: "bx-u2",
          name: "Device_Telemetry_Aug.csv",
          kind: "csv",
          sizeKb: 1480,
          createdOn: "18 Aug 2026 20:11",
          editedOn: "22 Aug 2026 06:45",
          sharedWith: [owners.jd, owners.ak],
        },
        {
          id: "bx-u3",
          name: "L03_Corridor_Pano_Preview.jpg",
          kind: "image",
          sizeKb: 2260,
          createdOn: "17 Aug 2026 09:41",
          editedOn: "17 Aug 2026 09:41",
          sharedWith: [owners.rv, owners.sm],
        },
      ],
      shared: [
        {
          id: "bx-s1",
          name: "Scan_Registration_Log.xlsx",
          kind: "xlsx",
          sizeKb: 620,
          createdOn: "12 Aug 2026 11:30",
          editedOn: "16 Aug 2026 15:20",
          sharedWith: [owners.pn, owners.jd],
        },
      ],
      structure: structureFolders("bx"),
    },
  },
]

export function getDataCategory(id: DataCategoryId): DataCategory {
  return dataCategories.find((c) => c.id === id) ?? dataCategories[0]
}

/** Total files a category holds across My uploads + Shared. */
export function categoryFileCount(category: DataCategory): number {
  return category.entries.uploads.length + category.entries.shared.length
}

export function formatEntrySize(sizeKb: number): string {
  if (sizeKb >= 1024 * 1024) return `${(sizeKb / (1024 * 1024)).toFixed(1)} GB`
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`
  return `${Math.round(sizeKb)} KB`
}

export const dataTabs: { id: DataTab; label: string; icon: string }[] = [
  { id: "uploads", label: "My uploads", icon: "folder" },
  { id: "shared", label: "Shared", icon: "share" },
  { id: "structure", label: "Project structure", icon: "tree" },
]
