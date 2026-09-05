/** Content for the help centre, support tickets and the legal documents. */

export type FaqCategory = "getting-started" | "captures" | "drawings" | "account" | "billing"

export interface FaqEntry {
  id: string
  category: FaqCategory
  question: string
  answer: string
}

export const faqCategories: { id: FaqCategory | "all" label: string }[] = [
  { id: "all", label: "All" },
  { id: "getting-started", label: "Getting started" },
  { id: "captures", label: "Captures" },
  { id: "drawings", label: "Drawings" },
  { id: "account", label: "Account" },
  { id: "billing", label: "Billing" },
]

export const faqEntries: FaqEntry[] = [
  {
    id: "faq-1",
    category: "getting-started",
    question: "How do I join a project I've been invited to?",
    answer:
      "Open the invite email on the device you signed up with and tap Accept. The project appears in the project switcher at the top of the home screen within a few seconds. If it does not, pull down to refresh — invites sync on the next poll.",
  },
  {
    id: "faq-2",
    category: "getting-started",
    question: "What is the difference between an Issue, an RFI and a Task?",
    answer:
      "An Issue records something wrong on site and needs a fix. An RFI asks the design team a question and blocks work until answered. A Task is planned work assigned to someone. All three share the same detail screen, so you can convert between them from the ⋯ menu.",
  },
  {
    id: "faq-3",
    category: "captures",
    question: "My 360 camera won't connect. What should I check?",
    answer:
      "Confirm the camera is in Wi-Fi mode and that your phone is joined to the camera's own network, not the site Wi-Fi. Then reopen the capture screen. If the strip still shows Disconnected, power-cycle the camera and wait for the status light to turn solid before retrying.",
  },
  {
    id: "faq-4",
    category: "captures",
    question: "Can I record a walkthrough without signal?",
    answer:
      "Yes. Captures record to the device and queue for upload. The captures screen shows a Pending badge for anything still waiting. Uploads resume automatically once you are back on Wi-Fi, and you can force a sync from the cloud icon.",
  },
  {
    id: "faq-5",
    category: "captures",
    question: "How much storage does a walkthrough use?",
    answer:
      "Roughly 40–70 MB per hundred metres at standard quality. Keep at least 2 GB free before a long walk. Synced captures can be cleared from the device in Captures without removing them from the project.",
  },
  {
    id: "faq-6",
    category: "drawings",
    question: "Why is my drawing pin on the wrong level?",
    answer:
      "Pins inherit the level selected when they were placed. Open the item, tap the location row, and pick the correct level — the pin moves without losing its photos or comments.",
  },
  {
    id: "faq-7",
    category: "drawings",
    question: "Can I compare two drawing revisions?",
    answer:
      "Open split view from the header, set one panel to Drawing and the other to Drone or a second sheet, then drag the divider. The wipe presets under the divider jump to return-only, split or snap-only.",
  },
  {
    id: "faq-8",
    category: "account",
    question: "How do I change the app font or switch to dark mode?",
    answer:
      "Both live in Profile under Theme Settings. Font and theme are stored per device, so changing them here does not affect your teammates.",
  },
  {
    id: "faq-9",
    category: "account",
    question: "I've left the company. How do I remove my access?",
    answer:
      "Ask a project administrator to revoke your seat, then sign out from Profile. Your captures and comments stay with the project — they are owned by the organisation, not by your account.",
  },
  {
    id: "faq-10",
    category: "billing",
    question: "Who can see my seat usage?",
    answer:
      "Only organisation administrators. Individual field users cannot see billing information, and support agents only see it when you attach it to a ticket.",
  },
  {
    id: "faq-11",
    category: "billing",
    question: "What happens to my data if the subscription lapses?",
    answer:
      "Projects become read-only for 90 days — you can view and export everything but not create new items or captures. Nothing is deleted during that window.",
  },
]

export type TicketStatus = "open" | "pending" | "resolved"
export type TicketPriority = "low" | "normal" | "high" | "urgent"

export interface TicketMessage {
  id: string
  author: "you" | "agent"
  authorName: string
  body: string
  sentAt: string
  /** Present on the first message of a ticket raised from the app. */
  systemNote?: string
}

export interface SupportTicket {
  id: string
  subject: string
  category: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  updatedAt: string
  messages: TicketMessage[]
}

export const ticketCategories = [
  "Captures & camera",
  "Drawings & BIM",
  "Sync & offline",
  "Account & access",
  "Billing",
  "Something else",
]

export const ticketStatusMeta: Record<TicketStatus, {
  label: string
  color: string
}> = {
  open: { label: "Open", color: "#0055ff" },
  pending: { label: "Awaiting you", color: "#d97706" },
  resolved: { label: "Resolved", color: "#059669" },
}

export const ticketPriorityMeta: Record<TicketPriority, {
  label: string
  color: string
}> = {
  low: { label: "Low", color: "#64748b" },
  normal: { label: "Normal", color: "#0055ff" },
  high: { label: "High", color: "#d97706" },
  urgent: { label: "Urgent", color: "#dc2626" },
}

export const mockTickets: SupportTicket[] = [
  {
    id: "SUP-2041",
    subject: "360 camera drops Wi-Fi mid-walkthrough",
    category: "Captures & camera",
    status: "pending",
    priority: "high",
    createdAt: "2026-08-28",
    updatedAt: "2026-09-03",
    messages: [
      {
        id: "m1",
        author: "you",
        authorName: "You",
        body: "The camera disconnects about ten minutes into a walk on Level 3. It reconnects if I stop and restart, but the capture splits into two files.",
        sentAt: "28 Aug, 09:14",
        systemNote: "App 4.2.1 · iPhone 15 Pro · Riverside Tower",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "Nadia (Support)",
        body: "Thanks for the detail — a ten-minute drop usually points at the camera's power-saving timer rather than the app. Could you check Settings › Power on the camera and tell me what the auto-sleep interval is set to?",
        sentAt: "28 Aug, 11:02",
      },
      {
        id: "m3",
        author: "you",
        authorName: "You",
        body: "It was set to 10 minutes. I've moved it to Never and will run another walk tomorrow morning.",
        sentAt: "29 Aug, 07:40",
      },
      {
        id: "m4",
        author: "agent",
        authorName: "Nadia (Support)",
        body: "That should do it. I'll leave this open until you've had a clean run — just reply here with how it goes and I'll close it out.",
        sentAt: "3 Sep, 08:20",
      },
    ],
  },
  {
    id: "SUP-1987",
    subject: "Cannot see the Riverside drawings after re-invite",
    category: "Account & access",
    status: "resolved",
    priority: "urgent",
    createdAt: "2026-08-11",
    updatedAt: "2026-08-12",
    messages: [
      {
        id: "m1",
        author: "you",
        authorName: "You",
        body: "I was re-added to Riverside Tower but the Drawings tab is empty for me.",
        sentAt: "11 Aug, 16:22",
        systemNote: "App 4.2.0 · iPhone 15 Pro · Riverside Tower",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "Tom (Support)",
        body: "Your new seat was created without the drawings role. I've corrected it — sign out and back in and the sheets will appear.",
        sentAt: "12 Aug, 09:05",
      },
      {
        id: "m3",
        author: "you",
        authorName: "You",
        body: "Confirmed, all twelve sheets are there. Thanks for the quick turnaround.",
        sentAt: "12 Aug, 10:31",
      },
    ],
  },
]

export interface LegalSection {
  id: string
  heading: string
  paragraphs: string[]
}

export interface LegalDocument {
  title: string
  summary: string
  updated: string
  sections: LegalSection[]
}

export const legalDocuments: Record<"terms" | "privacy", LegalDocument> = {
  terms: {
    title: "Terms & Conditions",
    summary:
      "The agreement between your organisation and us covering how this app may be used on your projects.",
    updated: "1 July 2026",
    sections: [
      {
        id: "acceptance",
        heading: "1. Accepting these terms",
        paragraphs: [
          "By signing in you agree to these terms on behalf of yourself and the organisation that issued your seat. If you do not have authority to accept them for your organisation, do not sign in.",
          "We may update these terms as the product changes. Material changes are announced in-app at least 30 days before they take effect, and continuing to use the app after that date means you accept the revised terms.",
        ],
      },
      {
        id: "seats",
        heading: "2. Seats and access",
        paragraphs: [
          "A seat is personal. Do not share your credentials or let another person record captures under your account — attribution on site records has to stay accurate.",
          "Your administrator can add, move or revoke seats at any time. Revoking a seat removes your access but does not remove the work you contributed, which stays with the project.",
        ],
      },
      {
        id: "content",
        heading: "3. Your project content",
        paragraphs: [
          "Captures, drawings, photographs, comments and any other material you upload remain the property of your organisation. We claim no ownership over them.",
          "You grant us the limited licence needed to host, process, back up and display that content so the service can function — for example generating thumbnails, aligning walkthroughs to a drawing, or streaming a capture back to you.",
          "You are responsible for having the right to upload what you upload, including consent where a capture records identifiable people.",
        ],
      },
      {
        id: "acceptable-use",
        heading: "4. Acceptable use",
        paragraphs: [
          "Do not use the app to store material unrelated to your projects, to attempt to access another organisation's data, or to probe, scan or test the security of the service without our written permission.",
          "Do not upload malware, or content that is unlawful or infringes someone else's rights. We may suspend access where we reasonably believe this clause has been breached.",
        ],
      },
      {
        id: "availability",
        heading: "5. Availability and offline use",
        paragraphs: [
          "The app is designed to keep working on site without signal. Work created offline is held on your device and uploaded when a connection returns. Until a capture shows as synced it exists only on that device — we cannot recover it if the device is lost.",
          "We aim for high availability but do not guarantee uninterrupted service. Planned maintenance is announced in advance where practical.",
        ],
      },
      {
        id: "liability",
        heading: "6. Liability",
        paragraphs: [
          "The app records and organises site information. It does not replace professional judgement, and nothing it produces is a certification of compliance, safety or structural adequacy.",
          "To the extent permitted by law, our liability under these terms is limited to the fees paid for the affected seat in the twelve months before the claim arose. Nothing here limits liability for death or personal injury caused by negligence, or for fraud.",
        ],
      },
      {
        id: "termination",
        heading: "7. Ending the agreement",
        paragraphs: [
          "Your organisation may end the agreement at any time from the billing portal. On termination, projects become read-only for 90 days so you can export what you need, after which the data is deleted.",
          "We may terminate for material breach that is not corrected within 30 days of written notice.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    summary:
      "What personal data the app collects, why it is collected, and the choices you have over it.",
    updated: "1 July 2026",
    sections: [
      {
        id: "collect",
        heading: "1. What we collect",
        paragraphs: [
          "Account data: your name, work email, phone number, job role, trade and the organisation that issued your seat.",
          "Usage data: which screens you open, which features you use and diagnostic information such as app version, device model and crash reports. This is tied to your account so support can reproduce a problem you report.",
          "Content data: the captures, photographs, comments and items you create. These frequently contain location information, and may incidentally record people who are on site.",
        ],
      },
      {
        id: "location",
        heading: "2. Location and site data",
        paragraphs: [
          "Location is used to place pins on a drawing, to track progress along a planned capture route, and to tag where a photograph was taken. It is collected while a capture or navigation session is active, not continuously in the background.",
          "You can decline location access. Capture routing and automatic pin placement will not work, but the rest of the app continues to function.",
        ],
      },
      {
        id: "why",
        heading: "3. Why we use it",
        paragraphs: [
          "To provide the service — syncing your work across devices and showing it to the right people on your project.",
          "To support you — a support agent can see your account details, app version and the tickets you have raised. They cannot browse your project content unless you attach it to a ticket.",
          "To improve the product — aggregated, de-identified usage patterns tell us which workflows are slow or abandoned.",
          "We do not sell personal data, and we do not use your project content to train models for other customers.",
        ],
      },
      {
        id: "sharing",
        heading: "4. Who it is shared with",
        paragraphs: [
          "People on your projects, according to the permissions your administrator sets. Your administrator can also see seat usage and audit records.",
          "Processors acting for us — cloud hosting, error monitoring and email delivery — under contracts that restrict them to our instructions.",
          "Authorities, where we are legally required to disclose. Where the law allows it, we will tell you first.",
        ],
      },
      {
        id: "retention",
        heading: "5. How long it is kept",
        paragraphs: [
          "Project content is kept for as long as your organisation's subscription is active, then for 90 days after it ends before deletion.",
          "Diagnostic and crash data is kept for 90 days. Support tickets are kept for two years so we have the history behind a recurring problem.",
        ],
      },
      {
        id: "rights",
        heading: "6. Your rights",
        paragraphs: [
          "You can ask for a copy of your personal data, ask us to correct it, or ask us to delete it. Some project records cannot be deleted on request because your organisation needs them as a construction record — in that case we will tell you which and why.",
          "You can turn off notifications and offline caching from Profile at any time. To exercise any other right, raise a ticket from the Help Centre and we will respond within 30 days.",
        ],
      },
      {
        id: "security",
        heading: "7. Keeping it safe",
        paragraphs: [
          "Data is encrypted in transit and at rest. Access by our staff is role-limited and logged, and production access requires an approved reason.",
          "If a breach affects your data we will notify your administrator without undue delay and, where required, the relevant regulator.",
        ],
      },
    ],
  },
}
