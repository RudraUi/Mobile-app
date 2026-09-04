export type NotificationType = "issue" | "task" | "rfi" | "drawing" | "fieldnote" | "system"

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  dateGroup: "Today" | "Yesterday" | "Earlier"
  read: boolean
  projectName: string
  itemId?: string
  priority?: "high" | "medium" | "low"
  author?: {
    name: string
    avatar?: string
    initials: string
    role: string
  }
}

export const initialNotifications: AppNotification[] = [
  {
    id: "notif-1",
    type: "issue",
    title: "Critical Clash Detected",
    message:
      "HVAC primary supply duct intersects 400mm structural beam Grid C4 on Level 03.",
    timestamp: "12m ago",
    dateGroup: "Today",
    read: false,
    projectName: "Skyline Tower B",
    itemId: "ISS-104",
    priority: "high",
    author: {
      name: "Sarah Jenkins",
      initials: "SJ",
      role: "Structural Lead",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
    },
  },
  {
    id: "notif-2",
    type: "rfi",
    title: "RFI #108 Assigned to You",
    message:
      "David Zhang requested clarification on fire damper clearance for Core 2 riser.",
    timestamp: "45m ago",
    dateGroup: "Today",
    read: false,
    projectName: "Skyline Tower B",
    itemId: "RFI-042",
    priority: "high",
    author: {
      name: "David Zhang",
      initials: "DZ",
      role: "MEP Engineer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    },
  },
  {
    id: "notif-3",
    type: "drawing",
    title: "Drawing Revision Sheet A-204 Rev 3",
    message:
      "Approved revised architectural layout for Core 1 elevators is now ready for download.",
    timestamp: "2h ago",
    dateGroup: "Today",
    read: false,
    projectName: "Skyline Tower B",
    priority: "medium",
    author: {
      name: "Marcus Vance",
      initials: "MV",
      role: "Lead Architect",
    },
  },
  {
    id: "notif-4",
    type: "task",
    title: "Rebar Inspection Approved",
    message:
      "Pour 4B foundation rebar inspection passed quality inspection without deviations.",
    timestamp: "Yesterday, 4:15 PM",
    dateGroup: "Yesterday",
    read: true,
    projectName: "Skyline Tower B",
    itemId: "TSK-082",
    priority: "medium",
    author: {
      name: "Priya Patel",
      initials: "PP",
      role: "Site QA Inspector",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    },
  },
  {
    id: "notif-5",
    type: "fieldnote",
    title: "360° Reality Capture Synced",
    message:
      "Level 02 slab scanning has been matched to BIM 3D coordinates. 8 scans processed.",
    timestamp: "Yesterday, 11:30 AM",
    dateGroup: "Yesterday",
    read: true,
    projectName: "Skyline Tower B",
    priority: "low",
  },
  {
    id: "notif-6",
    type: "system",
    title: "Offline Storage Cache Updated",
    message:
      "All 2D drawings and active models for Skyline Tower B are cached for offline field use.",
    timestamp: "2 days ago",
    dateGroup: "Earlier",
    read: true,
    projectName: "Skyline Tower B",
    priority: "low",
  },
]
