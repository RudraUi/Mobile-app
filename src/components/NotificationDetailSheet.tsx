import type {
  AppNotification,
  NotificationType,
} from "../data/notificationsData"
import type { Item } from "../data/mockData"
import { StatusBadge, SeverityBadge } from "./StatusBadge"

interface NotificationDetailSheetProps {
  notification: AppNotification | null
  isOpen: boolean
  onClose: () => void
  onToggleRead?: (id: string) => void
  onDelete?: (id: string) => void
  onOpenItem?: (item: Item) => void
  linkedItem?: Item | null
}

export function NotificationDetailSheet({
  notification,
  isOpen,
  onClose,
  onToggleRead,
  onDelete,
  onOpenItem,
  linkedItem,
}: NotificationDetailSheetProps) {
  if (!isOpen || !notification) return null

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case "issue":
        return {
          bg: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
          icon: (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
          label: "Issue Alert",
        }
      case "task":
        return {
          bg: "bg-blue-50 text-[#0055ff] dark:bg-blue-500/15 dark:text-blue-400",
          icon: (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ),
          label: "Task Update",
        }
      case "rfi":
        return {
          bg: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
          icon: (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
          label: "RFI Assigned",
        }
      case "drawing":
        return {
          bg: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
          icon: (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="14 2 18 6 7 17 3 17 3 13 14 2" />
              <line x1="3" y1="22" x2="21" y2="22" />
            </svg>
          ),
          label: "Drawing Revision",
        }
      case "fieldnote":
        return {
          bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
          icon: (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          ),
          label: "Reality Capture",
        }
      case "system":
      default:
        return {
          bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
          icon: (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          ),
          label: "System Notice",
        }
    }
  }

  const badge = getTypeBadge(notification.type)

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 flex flex-col justify-end bg-slate-950/50 backdrop-blur-xs select-none animate-fade-in"
    >
      <section
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mx-auto flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#121524] shadow-[0_-12px_40px_rgba(0,0,0,0.3)] animate-slide-up max-h-[88vh]"
      >
        {/* Grab Handle */}
        <div className="shrink-0 pt-2.5 pb-1">
          <div
            className="mx-auto h-1 w-9 rounded-full bg-slate-300 dark:bg-white/20"
            aria-hidden="true"
          />
        </div>

        {/* Header Bar */}
        <header className="shrink-0 px-4.5 pt-1.5 pb-3 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.bg}`}
            >
              {badge.icon}
              {badge.label}
            </span>

            {notification.priority === "high" && (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider">
                High Priority
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Read/Unread Status Indicator */}
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                notification.read
                  ? "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                  : "bg-blue-50 dark:bg-blue-500/15 text-[#0055ff] dark:text-blue-400 font-bold"
              }`}
            >
              {!notification.read && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0055ff]" />
              )}
              {notification.read ? "Read" : "Unread"}
            </span>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors active:scale-95 cursor-pointer"
              aria-label="Close details"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-4.5 py-4 space-y-4 no-scrollbar">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
              {notification.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 text-[11.5px] font-medium text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {notification.projectName}
              </span>
              <span>·</span>
              <span>{notification.timestamp}</span>
            </div>
          </div>

          {/* Full Message Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181d33] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              Details
            </span>
            <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>

          {/* Author Card (if available) */}
          {notification.author && (
            <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#15192c] border border-slate-100 dark:border-white/[0.05] flex items-center gap-3">
              {notification.author.avatar ? (
                <img
                  src={notification.author.avatar}
                  alt={notification.author.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white dark:ring-white/10"
                />
              ) : (
                <span className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-[12px] font-bold flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                  {notification.author.initials}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Logged By
                </span>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                  {notification.author.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  {notification.author.role}
                </p>
              </div>
            </div>
          )}

          {/* Linked Work Item Card (if present) */}
          {notification.itemId && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-0.5">
                Related Work Item
              </span>

              {linkedItem ? (
                <div
                  onClick={() => {
                    onClose()
                    onOpenItem?.(linkedItem)
                  }}
                  className="p-3 rounded-2xl border border-blue-200/80 dark:border-blue-500/25 bg-blue-50/40 dark:bg-blue-500/[0.08] hover:bg-blue-50/70 dark:hover:bg-blue-500/[0.12] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[12px] font-bold text-[#0055ff] dark:text-blue-400 font-mono">
                      {linkedItem.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <SeverityBadge severity={linkedItem.severity} />
                      <StatusBadge status={linkedItem.status} />
                    </div>
                  </div>

                  <h5 className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-[#0055ff] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-1">
                    {linkedItem.title}
                  </h5>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100 dark:border-white/[0.06] text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span>Due: {linkedItem.dueDate}</span>
                    <span className="text-[#0055ff] dark:text-blue-400 font-bold flex items-center gap-0.5">
                      View item details ›
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-[#181d33] flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#0055ff] font-mono">
                    {notification.itemId}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Linked to field coordination
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <footer className="shrink-0 p-3.5 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#0e111d] flex items-center gap-2">
          {/* Toggle Read/Unread */}
          <button
            type="button"
            onClick={() => {
              onToggleRead?.(notification.id)
            }}
            className="px-3 py-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#181c2f] hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-[12px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {notification.read ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <polyline points="20 6 9 17 4 12" />
              )}
            </svg>
            <span>{notification.read ? "Mark Unread" : "Mark Read"}</span>
          </button>

          {/* Primary View Action Button */}
          {linkedItem ? (
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenItem?.(linkedItem)
              }}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#0055ff] hover:bg-blue-600 text-white text-[12.5px] font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Open Work Item</span>
              <span className="text-[14px] leading-none">›</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#0055ff] hover:bg-blue-600 text-white text-[12.5px] font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
            >
              Done
            </button>
          )}

          {/* Delete Action */}
          <button
            type="button"
            onClick={() => {
              onDelete?.(notification.id)
              onClose()
            }}
            className="w-9 h-9 rounded-full border border-rose-200/80 dark:border-rose-500/25 bg-rose-50/60 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 flex items-center justify-center transition-colors active:scale-95 cursor-pointer shrink-0"
            title="Delete notification"
            aria-label="Delete notification"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </footer>
      </section>
    </div>
  )
}

export default NotificationDetailSheet
