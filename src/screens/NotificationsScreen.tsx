import { useState, useMemo, useRef, useEffect } from "react"
import { BackButton } from "../components/BackButton"
import { NotificationDetailSheet } from "../components/NotificationDetailSheet"
import { FloatingMenu, MenuCaption, MenuItem } from "../components/FloatingMenu"
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
    tile: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
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
    tile: "bg-blue-50 text-[#0055ff] dark:bg-blue-500/15 dark:text-blue-400",
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
    tile: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
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
    tile: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
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
    tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
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
    tile: "bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300",
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
  const [showMenu, setShowMenu] = useState(false)

  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false)
      }
    }
    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFilterDropdown])

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

  const activeTabInfo = tabs.find((t) => t.key === activeTab) || tabs[0]

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-[#0e111d] text-slate-900 dark:text-slate-100 select-none overflow-hidden transition-colors duration-200">
      {/* Top Navigation Header */}
      <header className="relative shrink-0 bg-white dark:bg-[#0e111d] border-b border-slate-100 dark:border-white/[0.05] px-4 py-3 z-30 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <BackButton onClick={onBack} />
            <h1 className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Notifications
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Filter Dropdown on Right Side - Tiny & Optimized */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setShowFilterDropdown((prev) => !prev)}
                className={`h-7 px-2.5 rounded-full text-[11px] font-medium shrink-0 flex items-center gap-1 cursor-pointer active:scale-95 transition-all border ${
                  activeTab !== "all"
                    ? "bg-blue-50 dark:bg-blue-500/15 text-[#0055ff] dark:text-blue-400 border-blue-200 dark:border-blue-500/30 font-semibold"
                    : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200/80 dark:hover:bg-white/15"
                }`}
                aria-expanded={showFilterDropdown}
                aria-label="Filter notifications"
              >
                <span>{activeTabInfo.label}</span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 text-slate-400 ${
                    showFilterDropdown ? "rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* Compact filter menu */}
              <FloatingMenu
                open={showFilterDropdown}
                align="right"
                widthClassName="w-36"
              >
                <MenuCaption>Filter</MenuCaption>
                {tabs.map((tab) => {
                  const isSelected = activeTab === tab.key
                  return (
                    <MenuItem
                      key={tab.key}
                      selected={isSelected}
                      onClick={() => {
                        setActiveTab(tab.key)
                        setShowFilterDropdown(false)
                      }}
                      hint={tab.count}
                    >
                      {tab.label}
                    </MenuItem>
                  )
                })}
              </FloatingMenu>
            </div>

            <button
              type="button"
              onClick={() => setShowMenu(true)}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-white/15 active:scale-95"
              aria-label="More options"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Notifications Feed */}
      <main className="relative flex-1 overflow-y-auto pb-8 no-scrollbar">
        {filteredList.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center px-6 animate-fade-in">
            {/* Bell icon illustration with red 0 badge */}
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-400 dark:text-slate-500">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                0
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Notification to show
            </h3>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 max-w-[240px] mt-1.5 leading-relaxed">
              You currently have no notifications. We will notify you when
              something new happens!
            </p>

            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className="mt-5 h-8 px-5 rounded-full bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-xs shadow-[#0055ff]/25"
            >
              Explore
            </button>
          </div>
        ) : (
          GROUPS.map((group) => {
            const groupItems = filteredList.filter((n) => n.dateGroup === group)
            if (groupItems.length === 0) return null

            return (
              <section key={group} className="mb-1">
                {/* Clean section header - uniform typography */}
                <div className="px-4 pt-4 pb-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {group}
                  </span>
                </div>

                <div className="divide-y divide-slate-100/80 dark:divide-white/[0.04]">
                  {groupItems.map((notif) => {
                    const style = TYPE_STYLES[notif.type] ?? TYPE_STYLES.system
                    const isUnread = !notif.read

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleItemToggle(notif)}
                        className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          isUnread
                            ? "bg-blue-50/20 dark:bg-blue-500/[0.03] hover:bg-blue-50/40"
                            : "hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                        }`}
                      >
                        {/* Circular Avatar / Icon (w-9 h-9, identical to header buttons) */}
                        <div className="relative shrink-0 mt-0.5">
                          {notif.author?.avatar ? (
                            <img
                              src={notif.author.avatar}
                              alt={notif.author.name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center ${style.tile}`}
                            >
                              {style.icon}
                            </div>
                          )}
                          {isUnread && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#0055ff] ring-2 ring-white dark:ring-[#0e111d]" />
                          )}
                        </div>

                        {/* Content: only heading, one line body text, and date or time */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                              {notif.title}
                            </h4>
                            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                              {notif.timestamp}
                            </span>
                          </div>

                          <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })
        )}
      </main>

      {/* Options Action Sheet matching reference Phone 3 */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-fade-in p-3 select-none"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="w-full max-w-[400px] mx-auto flex flex-col gap-2 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-[#161a2b] rounded-2xl overflow-hidden shadow-xl divide-y divide-slate-100 dark:divide-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setList([])
                  setShowMenu(false)
                }}
                className="w-full py-3.5 text-center text-[14px] font-semibold text-red-600 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => {
                  handleMarkAll()
                  setShowMenu(false)
                }}
                className="w-full py-3.5 text-center text-[14px] font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Mark all as read
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMenu(false)}
              className="w-full py-3.5 bg-white dark:bg-[#161a2b] rounded-2xl text-center text-[14px] font-semibold text-slate-800 dark:text-slate-100 shadow-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
