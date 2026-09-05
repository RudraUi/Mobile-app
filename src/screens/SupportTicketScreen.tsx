import { useEffect, useRef, useState } from "react"
import { BackButton } from "../components/BackButton"
import { Chip } from "../components/Chip"
import { FloatingMenu, MenuCaption, MenuItem } from "../components/FloatingMenu"
import {
  ticketCategories,
  ticketPriorityMeta,
  ticketStatusMeta,
  type SupportTicket,
  type TicketMessage,
  type TicketPriority,
} from "../data/supportData"

interface SupportTicketScreenProps {
  /** Omit to open the compose form for a brand new ticket. */
  ticket?: SupportTicket
  /** Stamped onto a new ticket so support knows the context. */
  contextNote: string
  onBack: () => void
  onCreate: (ticket: SupportTicket) => void
  onReply: (ticketId: string, message: TicketMessage) => void
}

function Icon({ name, size = 14 }: { name: string size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (name) {
    case "send":
      return (
        <svg {...common}>
          <path d="m4 12 16-8-6 16-2.5-6.5Z" />
        </svg>
      )
    case "paperclip":
      return (
        <svg {...common}>
          <path d="M20 11.5 12 19.5a4.5 4.5 0 0 1-6.4-6.4l8.2-8.2a3 3 0 0 1 4.3 4.3l-8.2 8.2a1.5 1.5 0 0 1-2.1-2.1l7.4-7.4" />
        </svg>
      )
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      )
    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="16.5" />
          <line x1="12" y1="7.8" x2="12" y2="7.8" />
        </svg>
      )
    case "check":
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    default:
      return null
  }
}

const PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"]

function timestamp() {
  return new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function SupportTicketScreen({
  ticket,
  contextNote,
  onBack,
  onCreate,
  onReply,
}: SupportTicketScreenProps) {
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState(ticketCategories[0])
  const [priority, setPriority] = useState<TicketPriority>("normal")
  const [description, setDescription] = useState("")
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])

  const [reply, setReply] = useState("")
  const threadEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isCompose = !ticket

  useEffect(() => {
    if (!isCompose) {
      threadEndRef.current?.scrollIntoView({ block: "end" })
    }
  }, [isCompose, ticket?.messages.length])

  const canSubmit = subject.trim().length > 2 && description.trim().length > 9

  const handleSubmit = () => {
    if (!canSubmit) return
    const now = new Date()
    const iso = now.toISOString().slice(0, 10)
    onCreate({
      id: `SUP-${2100 + Math.floor(Math.random() * 800)}`,
      subject: subject.trim(),
      category,
      status: "open",
      priority,
      createdAt: iso,
      updatedAt: iso,
      messages: [
        {
          id: `m-${now.getTime()}`,
          author: "you",
          authorName: "You",
          body: description.trim(),
          sentAt: timestamp(),
          systemNote:
            attachments.length > 0
              ? `${contextNote} · ${attachments.length} attachment${
                  attachments.length > 1 ? "s" : ""
                }`
              : contextNote,
        },
      ],
    })
  }

  const handleSendReply = () => {
    if (!ticket || !reply.trim()) return
    onReply(ticket.id, {
      id: `m-${Date.now()}`,
      author: "you",
      authorName: "You",
      body: reply.trim(),
      sentAt: timestamp(),
    })
    setReply("")
  }

  /* ── Compose: raise a new ticket ────────────────────────────── */
  if (isCompose) {
    return (
      <div className="ui-screen relative flex h-full flex-col overflow-hidden select-none">
        <header className="ui-divider shrink-0 border-b px-4 py-3">
          <div className="flex items-center gap-2.5">
            <BackButton onClick={onBack} />
            <div className="min-w-0">
              <h1 className="ui-text text-[16px] font-bold leading-tight tracking-tight">
                New ticket
              </h1>
              <p className="ui-text-dim text-[11px] font-medium leading-tight">
                Tell us what happened and we&rsquo;ll pick it up
              </p>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3.5 space-y-4">
          {/* Subject */}
          <div>
            <label className="ui-text-dim mb-1.5 block px-0.5 text-[9.5px] font-bold uppercase tracking-wider">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Camera drops Wi-Fi mid-walkthrough"
              className="ui-surface-sunken ui-text h-9 w-full rounded-xl border px-3 text-[12.5px] font-medium outline-none transition-colors focus:border-[#0055ff] placeholder:text-slate-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="ui-text-dim mb-1.5 block px-0.5 text-[9.5px] font-bold uppercase tracking-wider">
              Category
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isCategoryOpen}
                className="ui-surface-sunken ui-text flex h-9 w-full cursor-pointer items-center justify-between rounded-xl border px-3 text-left text-[12.5px] font-medium transition-colors hover:border-[#0055ff]"
              >
                <span>{category}</span>
                <span
                  className={`ui-text-dim shrink-0 transition-transform duration-200 ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                >
                  <Icon name="chevron-down" size={12} />
                </span>
              </button>

              {isCategoryOpen && (
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsCategoryOpen(false)}
                />
              )}
              <FloatingMenu
                open={isCategoryOpen}
                widthClassName="w-full"
                maxHeightClassName="max-h-[196px]"
              >
                <MenuCaption>Pick a category</MenuCaption>
                {ticketCategories.map((option) => (
                  <MenuItem
                    key={option}
                    selected={category === option}
                    onClick={() => {
                      setCategory(option)
                      setIsCategoryOpen(false)
                    }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </FloatingMenu>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="ui-text-dim mb-1.5 block px-0.5 text-[9.5px] font-bold uppercase tracking-wider">
              How urgent is it?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((level) => {
                const meta = ticketPriorityMeta[level]
                const isActive = priority === level
                return (
                  <Chip
                    key={level}
                    size="md"
                    selected={isActive}
                    onClick={() => setPriority(level)}
                    dot={isActive ? "#ffffff" : meta.color}
                  >
                    {meta.label}
                  </Chip>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="ui-text-dim mb-1.5 block px-0.5 text-[9.5px] font-bold uppercase tracking-wider">
              What happened?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="What you were doing, what you expected, and what happened instead. Steps that reproduce it help most."
              className="ui-surface-sunken ui-text w-full resize-none rounded-xl border p-3 text-[12.5px] font-medium leading-[18px] outline-none transition-colors focus:border-[#0055ff] placeholder:text-slate-400"
            />
            <div className="mt-1 flex items-center justify-between px-0.5">
              <span className="ui-text-dim text-[10px]">
                {description.trim().length < 10
                  ? "A sentence or two, minimum"
                  : "Looks good"}
              </span>
              <span className="ui-text-dim text-[10px] tabular-nums">
                {description.length}
              </span>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="ui-text-dim mb-1.5 block px-0.5 text-[9.5px] font-bold uppercase tracking-wider">
              Attachments
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const names = Array.from(e.target.files ?? []).map(
                  (f) => f.name,
                )
                if (names.length) setAttachments((prev) => [...prev, ...names])
              }}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {attachments.map((name) => (
                <Chip
                  key={name}
                  size="md"
                  onRemove={() =>
                    setAttachments((prev) => prev.filter((n) => n !== name))
                  }
                  removeLabel={`Remove ${name}`}
                  className="max-w-[170px]"
                >
                  {name}
                </Chip>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="ui-text-muted ui-divider flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-dashed px-3 text-[11px] font-semibold transition-colors hover:border-[#0055ff] hover:text-[#0055ff] active:scale-95"
              >
                <Icon name="paperclip" size={11} />
                Add a file
              </button>
            </div>
          </div>

          {/* What gets sent with it */}
          <div className="ui-surface-sunken flex items-start gap-2.5 rounded-xl border p-3">
            <span className="ui-text-dim mt-px shrink-0">
              <Icon name="info" size={13} />
            </span>
            <p className="ui-text-dim text-[11px] leading-[16px]">
              We attach{" "}
              <span className="ui-text-muted font-semibold">{contextNote}</span>{" "}
              so an agent can reproduce the problem. No project content is
              shared unless you attach it above.
            </p>
          </div>
        </div>

        <div className="ui-divider ui-screen shrink-0 border-t px-4 pb-6 pt-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0055ff] text-[12.5px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-white/10 dark:disabled:text-slate-500"
          >
            <Icon name="send" size={13} />
            Submit ticket
          </button>
        </div>
      </div>
    )
  }

  /* ── Thread: an existing ticket ─────────────────────────────── */
  const status = ticketStatusMeta[ticket.status]
  const priorityMeta = ticketPriorityMeta[ticket.priority]

  return (
    <div className="ui-screen relative flex h-full flex-col overflow-hidden select-none">
      <header className="ui-divider shrink-0 border-b px-4 py-3">
        <div className="flex items-start gap-2.5">
          <BackButton onClick={onBack} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] font-bold tabular-nums text-[#0055ff]">
                {ticket.id}
              </span>
              <Chip size="xs" color={status.color}>
                {status.label}
              </Chip>
              <Chip size="xs" color={priorityMeta.color}>
                {priorityMeta.label}
              </Chip>
            </div>
            <h1 className="ui-text mt-1 text-[13.5px] font-bold leading-snug">
              {ticket.subject}
            </h1>
            <p className="ui-text-dim mt-0.5 text-[10.5px] font-medium leading-tight">
              {ticket.category} · opened {ticket.createdAt}
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {ticket.messages.map((message) => {
          const isYou = message.author === "you"
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isYou ? "items-end" : "items-start"}`}
            >
              <div className="mb-1 flex items-center gap-1.5 px-1">
                {!isYou && (
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#0055ff] text-[8px] font-bold text-white">
                    {message.authorName.charAt(0)}
                  </span>
                )}
                <span className="ui-text-dim text-[10px] font-semibold">
                  {message.authorName}
                </span>
                <span className="ui-text-dim text-[10px]">
                  {message.sentAt}
                </span>
              </div>

              <div
                className={`max-w-[86%] rounded-2xl px-3 py-2 text-[12px] leading-[17.5px] ${
                  isYou
                    ? "bg-[#0055ff] text-white"
                    : "ui-surface-sunken ui-text-muted border"
                }`}
              >
                {message.body}
              </div>

              {message.systemNote && (
                <span className="ui-text-dim mt-1 px-1 text-[9.5px] font-medium">
                  {message.systemNote}
                </span>
              )}
            </div>
          )
        })}

        {ticket.status === "resolved" && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <span className="text-emerald-600">
              <Icon name="check" size={12} />
            </span>
            <span className="ui-text-dim text-[10.5px] font-semibold">
              Resolved on {ticket.updatedAt} · reply to reopen
            </span>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      <div className="ui-divider ui-screen shrink-0 border-t px-3 pb-6 pt-2.5">
        <div className="ui-surface-sunken flex items-end gap-1.5 rounded-2xl border p-1.5">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendReply()
              }
            }}
            rows={1}
            placeholder="Reply to support…"
            className="ui-text max-h-24 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-[12.5px] font-medium leading-[17px] outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={handleSendReply}
            disabled={!reply.trim()}
            aria-label="Send reply"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#0055ff] text-white transition-colors hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white/10"
          >
            <Icon name="send" size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SupportTicketScreen
