import { useState, useMemo } from "react"
import { BackButton } from "../components/BackButton"
import { NotificationDetailSheet } from "../components/NotificationDetailSheet"
import type {
  AppNotification,
  NotificationType,
} from "../data/notificationsData"
import type { Item } from "../data/mockData"

interface NotificationsScreenProps {
  notifications: AppNotification[]
  onBack: () => void
  onItemClick?: (item: Item) => void
  items?: Item[]
  onMarkAllRead?: () => void
  onToggleRead?: (id: string) => void
  onDeleteNotification?: (id: string) => void
}

type NotificationFilterTab = "all" | "unread" | "issue" | "rfi_task"

interface TypeStyle {
  label: string
  /* icon tile */
  tile: string
  /* left accent rail on unread cards */
  rail: string
  /* soft dot used in the meta line */
  dot: string
  icon: React.ReactNode
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

const TYPE_STYLES: Record<NotificationType, TypeStyle> = {
  issue: {
    label: "Issue",
    tile: "bg-red-50 text-red-600 ring-red-100 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/20",
    rail: "bg-red-500",
    dot: "bg-red-500",
    icon: (
      <svg width="13" height="13" strokeWidth="2.4" {...iconProps}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  task: {
    label: "Task",
    tile: "bg-blue-50 text-[#0055ff] ring-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-500/20",
    rail: "bg-[#0055ff]",
    dot: "bg-[#0055ff]",
    icon: (
      <svg width="13" height="13" strokeWidth="2.6" {...iconProps}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  rfi: {
    label: "RFI",
    tile: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/20",
    rail: "bg-amber-500",
    dot: "bg-amber-500",
    icon: (
      <svg width="13" height="13" strokeWidth="2.5" {...iconProps}>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  drawing: {
    label: "Drawing",
    tile: "bg-purple-50 text-purple-600 ring-purple-100 dark:bg-purple-500/15 dark:text-purple-400 dark:ring-purple-500/20",
    rail: "bg-purple-500",
    dot: "bg-purple-500",
    icon: (
      <svg width="13" height="13" strokeWidth="2.2" {...iconProps}>
        <polygon points="14 2 18 6 7 17 3 17 3 13 14 2" />
        <line x1="3" y1="22" x2="21" y2="22" />
      </svg>
    ),
  },
  fieldnote: {
    label: "Capture",
    tile: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/20",
    rail: "bg-emerald-500",
    dot: "bg-emerald-500",
    icon: (
      <svg width="13" height="13" strokeWidth="2.2" {...iconProps}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  system: {
    label: "System",
    tile: "bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-white/[0.08] dark:text-slate-300 dark:ring-white/10",
    rail: "bg-slate-400",
    dot: "bg-slate-400",
    icon: (
      <svg width="13" height="13" strokeWidth="2.2" {...iconProps}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
}

const GROUPS: Array<"Today" | "Yesterday" | "Earlier"> = [
  "Today",
  "Yesterday",
  "Earlier",
]

export function NotificationsScreen({
  notifications: initialList,
  onBack,
  onItemClick,
  items = [],
  onMarkAllRead,
  onToggleRead,
  onDeleteNotification,
}: NotificationsScreenProps) {
  const [list, setList] = useState<AppNotification[]>(initialList)
  const [activeTab, setActiveTab] = useState<NotificationFilterTab>("all")
  const [activeNotification, setActiveNotification] =
    useState<AppNotification | null>(null)

  const unreadCount = useMemo(() => list.filter((n) => !n.read).length, [list])
  const issueCount = useMemo(
    () => list.filter((n) => n.type === "issue").length,
    [list],
  )
  const rfiTaskCount = useMemo(
    () => list.filter((n) => n.type === "rfi" || n.type === "task").length,
    [list],
  )

  const filteredList = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return list.filter((n) => !n.read)
      case "issue":
        return list.filter((n) => n.type === "issue")
      case "rfi_task":
        return list.filter((n) => n.type === "rfi" || n.type === "task")
      case "all":
      default:
        return list
    }
  }, [list, activeTab])

  const handleMarkAll = () => {
    setList((prev) => prev.map((n) => ({ ...n, read: true })))
    onMarkAllRead?.()
  }

  const handleItemToggle = (notif: AppNotification) => {
    setList((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
    )
    onToggleRead?.(notif.id)
    setActiveNotification({ ...notif, read: true })
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setList((prev) => prev.filter((n) => n.id !== id))
    onDeleteNotification?.(id)
  }

  const linkedItem = useMemo(() => {
    if (!activeNotification?.itemId) return null
    return items.find((i) => i.id === activeNotification.itemId) || null
  }, [activeNotification, items])

  const tabs: Array<{
    key: NotificationFilterTab
    label: string
    count: number
  }> = [
    { key: "all", label: "All", count: list.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "issue", label: "Issues", count: issueCount },
    { key: "rfi_task", label: "RFIs & Tasks", count: rfiTaskCount },
  ]

  return (
    <div className="relative flex flex-col h-full bg-[#f4f6fb] dark:bg-[#080a12] text-slate-900 dark:text-slate-100 select-none overflow-hidden transition-colors duration-200">
      {/* Ambient brand glow behind the header */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[320px] h-[220px] rounded-full bg-[#0055ff]/12 dark:bg-[#0055ff]/20 blur-3xl"
      />

      {/* Top Navigation Header */}
      <header className="relative shrink-0 backdrop-blur-xl bg-white/85 dark:bg-[#0e111d]/85 border-b border-slate-200/70 dark:border-white/[0.07] px-3.5 pt-2.5 pb-2 z-20 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <BackButton onClick={onBack} />
            <div className="min-w-0">
              <h1 className="text-[16px] font-extrabold tracking-[-0.01em] text-slate-900 dark:text-white leading-tight">
                Notifications
              </h1>
              <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 leading-none mt-1">
                {unreadCount > 0 ? (
                  <>
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inline-flex w-full h-full rounded-full bg-[#0055ff] opacity-60 animate-ping" />
                      <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#0055ff]" />
                    </span>
                    <span className="text-[#0055ff] dark:text-blue-400">
                      {unreadCount} unread
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                  </>
                ) : null}
                <span>{list.length} total</span>
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-[#0055ff] hover:bg-[#0047d6] text-white text-[10.5px] font-bold shadow-sm shadow-[#0055ff]/25 cursor-pointer active:scale-95 transition-all"
            >
              <svg width="11" height="11" strokeWidth="3" {...iconProps}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Mark all read
            </button>
          )}
        </div>

        {/* Segmented filter chips */}
        <nav
          className="flex items-center gap-1.5 mt-2.5 -mx-0.5 px-0.5 overflow-x-auto no-scrollbar"
          aria-label="Notification filters"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                aria-pressed={isActive}
                className={`h-7.5 px-3 rounded-full text-[11.5px] font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all duration-200 ${
                  isActive
                    ? "bg-[#0055ff] text-white font-bold shadow-sm shadow-[#0055ff]/30"
                    : "bg-white dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 ring-1 ring-slate-200/80 dark:ring-white/[0.07] hover:ring-slate-300 dark:hover:bg-white/10"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`min-w-[15px] text-[9.5px] leading-none px-1 py-[3px] rounded-full font-bold text-center ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </header>

      {/* Main Notifications Feed */}
      <main className="relative flex-1 overflow-y-auto px-3.5 pt-1 pb-6 no-scrollbar">
        {filteredList.length === 0 ? (
          <div className="h-[55vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
            <div className="relative mb-4">
              <span className="absolute inset-0 -m-3 rounded-full bg-[#0055ff]/5 dark:bg-[#0055ff]/10" />
              <span className="absolute inset-0 -m-6 rounded-full bg-[#0055ff]/[0.04] dark:bg-[#0055ff]/5" />
              <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-[#141827] ring-1 ring-slate-200/80 dark:ring-white/10 text-[#0055ff] dark:text-blue-400 flex items-center justify-center shadow-sm">
                <svg width="24" height="24" strokeWidth="2" {...iconProps}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  <path d="m9 8 2 2 4-4" />
                </svg>
              </div>
            </div>
            <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white">
              All caught up
            </h3>
            <p className="text-[11.5px] text-slate-400 dark:text-slate-500 max-w-[210px] mt-1 leading-relaxed">
              Nothing here right now. New field alerts will land in this feed.
            </p>
            {activeTab !== "all" && (
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="mt-3.5 h-7 px-3 rounded-full bg-white dark:bg-white/[0.06] ring-1 ring-slate-200 dark:ring-white/10 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95 transition-all"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          GROUPS.map((group) => {
            const groupItems = filteredList.filter((n) => n.dateGroup === group)
            if (groupItems.length === 0) return null

            return (
              <section key={group} className="mb-1.5">
                {/* Sticky section heading */}
                <div className="sticky top-0 z-10 -mx-3.5 px-3.5 py-2 bg-[#f4f6fb]/90 dark:bg-[#080a12]/90 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.09em] text-slate-400 dark:text-slate-500">
                      {group}
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10" />
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-white/[0.06] ring-1 ring-slate-200/80 dark:ring-white/10 text-slate-500 dark:text-slate-400 leading-none">
                      {groupItems.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pb-1">
                  {groupItems.map((notif, index) => {
                    const style = TYPE_STYLES[notif.type] ?? TYPE_STYLES.system
                    const isUnread = !notif.read

                    return (
                      <article
                        key={notif.id}
                        onClick={() => handleItemToggle(notif)}
                        style={{ animationDelay: `${Math.min(index, 6) * 35}ms` }}
                        className={`group relative overflow-hidden rounded-2xl cursor-pointer animate-slide-up transition-all duration-200 active:scale-[0.985] ${
                          isUnread
                            ? "bg-white dark:bg-[#12162a] ring-1 ring-slate-200/80 dark:ring-white/[0.09] shadow-[0_1px_2px_rgba(15,23,42,0.05),0_6px_16px_-8px_rgba(15,23,42,0.12)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_10px_24px_-10px_rgba(15,23,42,0.18)]"
                            : "bg-white/70 dark:bg-white/[0.03] ring-1 ring-slate-200/60 dark:ring-white/[0.05] hover:bg-white dark:hover:bg-white/[0.05]"
                        }`}
                      >
                        {/* Type accent rail */}
                        <span
                          aria-hidden="true"
                          className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full transition-opacity ${style.rail} ${
                            isUnread
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-40"
                          }`}
                        />

                        <div className="flex items-start gap-2.5 p-3 pl-3.5">
                          {/* Type icon tile */}
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ring-1 ${style.tile} ${
                              isUnread ? "" : "opacity-70"
                            }`}
                          >
                            {style.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Meta line */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1.5 min-w-0 text-[9.5px] font-extrabold uppercase tracking-[0.07em] text-slate-400 dark:text-slate-500">
                                <span className={`w-1 h-1 rounded-full shrink-0 ${style.dot}`} />
                                <span className="truncate">
                                  {style.label} · {notif.projectName}
                                </span>
                              </span>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {notif.priority === "high" && (
                                  <span className="px-1.5 py-[2px] rounded-md bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 text-[8.5px] font-extrabold uppercase tracking-wide leading-none">
                                    High
                                  </span>
                                )}
                                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                  {notif.timestamp}
                                </span>
                                {isUnread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0055ff] shadow-[0_0_6px_rgba(0,85,255,0.75)] shrink-0" />
                                )}
                              </div>
                            </div>

                            {/* Title */}
                            <h4
                              className={`text-[13.5px] leading-snug mt-1 truncate ${
                                isUnread
                                  ? "font-bold text-slate-900 dark:text-white"
                                  : "font-semibold text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {notif.title}
                            </h4>

                            {/* Message */}
                            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-[1.45] line-clamp-2 mt-0.5">
                              {notif.message}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-dashed border-slate-200/80 dark:border-white/[0.06]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {notif.author ? (
                                  <>
                                    {notif.author.avatar ? (
                                      <img
                                        src={notif.author.avatar}
                                        alt={notif.author.name}
                                        className="w-[18px] h-[18px] rounded-full object-cover shrink-0 ring-1 ring-white dark:ring-white/10 shadow-2xs"
                                      />
                                    ) : (
                                      <span className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 text-[8px] font-extrabold flex items-center justify-center text-slate-700 dark:text-slate-100 shrink-0">
                                        {notif.author.initials}
                                      </span>
                                    )}
                                    <span className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[110px]">
                                      {notif.author.name}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 truncate">
                                    Automated update
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {notif.itemId && (
                                  <span className="inline-flex items-center gap-0.5 pl-1.5 pr-1 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/15 text-[#0055ff] dark:text-blue-400 text-[9.5px] font-mono font-bold group-hover:bg-blue-100 dark:group-hover:bg-blue-500/25 transition-colors">
                                    {notif.itemId}
                                    <svg
                                      width="10"
                                      height="10"
                                      strokeWidth="3"
                                      {...iconProps}
                                    >
                                      <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(e, notif.id)}
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                                  title="Dismiss notification"
                                  aria-label="Dismiss notification"
                                >
                                  <svg
                                    width="11"
                                    height="11"
                                    strokeWidth="2.6"
                                    {...iconProps}
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })
        )}
      </main>

      {/* Notification Details Bottom Drawer */}
      <NotificationDetailSheet
        notification={activeNotification}
        isOpen={activeNotification !== null}
        onClose={() => setActiveNotification(null)}
        linkedItem={linkedItem}
        onOpenItem={(item) => {
          setActiveNotification(null)
          onItemClick?.(item)
        }}
        onToggleRead={(id) => {
          setList((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
          )
          setActiveNotification((prev) =>
            prev && prev.id === id ? { ...prev, read: !prev.read } : prev,
          )
          onToggleRead?.(id)
        }}
        onDelete={(id) => {
          setList((prev) => prev.filter((n) => n.id !== id))
          setActiveNotification(null)
          onDeleteNotification?.(id)
        }}
      />
    </div>
  )
}

export default NotificationsScreen
