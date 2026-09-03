export type CaptureFileKind = "panorama" | "photo" | "video" | "scan"

export interface CaptureFile {
  id: string
  name: string
  kind: CaptureFileKind
  sizeMb: number
  capturedAt: string
  detail: string
  session: string
  location: string
  thumb: string
  /** Downloaded to this phone. */
  onDevice: boolean
  /** Backed up to the project workspace. */
  inCloud: boolean
  /** Still sitting on the camera's SD card. */
  onCamera: boolean
}

export const captureSessions: {
  id: string
  label: string
  capturedAt: string
}[] = [
  {
    id: "walk-03",
    label: "Level 03 — Corridor walk",
    capturedAt: "Today, 09:41",
  },
  {
    id: "walk-02",
    label: "Basement B1 — Plant room",
    capturedAt: "Yesterday, 16:20",
  },
  {
    id: "walk-01",
    label: "Grid B4 — Rebar inspection",
    capturedAt: "12 Aug 2026",
  },
]

export const mockCaptureFiles: CaptureFile[] = [
  {
    id: "cap-001",
    name: "L03_corridor_pano_001.insp",
    kind: "panorama",
    sizeMb: 412,
    capturedAt: "09:41",
    detail: "8K · 360°",
    session: "walk-03",
    location: "Level 03 — Corridor",
    thumb:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&auto=format",
    onDevice: false,
    inCloud: false,
    onCamera: true,
  },
  {
    id: "cap-002",
    name: "L03_corridor_pano_002.insp",
    kind: "panorama",
    sizeMb: 398,
    capturedAt: "09:43",
    detail: "8K · 360°",
    session: "walk-03",
    location: "Level 03 — Corridor",
    thumb:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop&auto=format",
    onDevice: false,
    inCloud: false,
    onCamera: true,
  },
  {
    id: "cap-003",
    name: "L03_walk_sequence.mp4",
    kind: "video",
    sizeMb: 1240,
    capturedAt: "09:44",
    detail: "2:18 · 5.7K",
    session: "walk-03",
    location: "Level 03 — Corridor",
    thumb:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop&auto=format",
    onDevice: false,
    inCloud: false,
    onCamera: true,
  },
  {
    id: "cap-004",
    name: "B1_plantroom_pano_001.insp",
    kind: "panorama",
    sizeMb: 386,
    capturedAt: "16:20",
    detail: "8K · 360°",
    session: "walk-02",
    location: "Basement B1 — Mechanical",
    thumb:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&auto=format",
    onDevice: true,
    inCloud: false,
    onCamera: true,
  },
  {
    id: "cap-005",
    name: "B1_plantroom_scan.e57",
    kind: "scan",
    sizeMb: 864,
    capturedAt: "16:26",
    detail: "Point cloud · 12.4M pts",
    session: "walk-02",
    location: "Basement B1 — Mechanical",
    thumb:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&auto=format",
    onDevice: true,
    inCloud: false,
    onCamera: false,
  },
  {
    id: "cap-006",
    name: "B1_valve_detail.jpg",
    kind: "photo",
    sizeMb: 8,
    capturedAt: "16:31",
    detail: "4032 × 3024",
    session: "walk-02",
    location: "Basement B1 — Mechanical",
    thumb:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop&auto=format",
    onDevice: true,
    inCloud: true,
    onCamera: false,
  },
  {
    id: "cap-007",
    name: "GridB4_rebar_pano_001.insp",
    kind: "panorama",
    sizeMb: 401,
    capturedAt: "11:02",
    detail: "8K · 360°",
    session: "walk-01",
    location: "Grid B4 — Level 02",
    thumb:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400&fit=crop&auto=format",
    onDevice: true,
    inCloud: true,
    onCamera: false,
  },
  {
    id: "cap-008",
    name: "GridB4_tie_spacing.jpg",
    kind: "photo",
    sizeMb: 6,
    capturedAt: "11:08",
    detail: "4032 × 3024",
    session: "walk-01",
    location: "Grid B4 — Level 02",
    thumb:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop&auto=format",
    onDevice: true,
    inCloud: true,
    onCamera: false,
  },
]

export function formatFileSize(sizeMb: number) {
  return sizeMb >= 1024
    ? `${(sizeMb / 1024).toFixed(1)} GB`
    : `${Math.round(sizeMb)} MB`
}
