import { useMemo, useState } from "react"
import { BackButton } from "../components/BackButton"
import { SwoopTabs } from "../components/SwoopTabs"
import { Chip } from "../components/Chip"
import {
  faqCategories,
  faqEntries,
  ticketStatusMeta,
  type FaqCategory,
  type SupportTicket,
} from "../data/supportData"

type HelpTab = "faq" | "tickets" | "contact"

interface HelpCenterScreenProps {
  tickets: SupportTicket[]
  onBack: () => void
  onOpenTicket: (ticket: SupportTicket) => void
  onNewTicket: () => void
  onOpenTerms: () => void
  onOpenPrivacy: () => void
  initialTab?: HelpTab
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
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 4" />
          <line x1="12" y1="17.5" x2="12" y2="17.5" />
        </svg>
      )
    case "ticket":
      return (
        <svg {...common}>
          <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
          <path d="M13 6v12" strokeDasharray="2 2.5" />
        </svg>
      )
    case "chat":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.6-.8L3 21l1.9-5A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" />
        </svg>
      )
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <line x1="20" y1="20" x2="16.5" y2="16.5" />
        </svg>
      )
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      )
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m3.5 7 8.5 6 8.5-6" />
        </svg>
      )
    case "phone":
      return (
        <svg {...common}>
          <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 6.2 2 2 0 0 1 6.5 3Z" />
        </svg>
      )
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z" />
          <path d="M8 7.5h7M8 11h7" />
        </svg>
      )
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5.5c0 4.4-2.9 8.3-7 9.5-4.1-1.2-7-5.1-7-9.5V6Z" />
        </svg>
      )
    case "plus":
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    default:
      return null
  }
}

export function HelpCenterScreen({
  tickets,
  onBack,
  onOpenTicket,
  onNewTicket,
  onOpenTerms,
  onOpenPrivacy,
  initialTab = "faq",
}: HelpCenterScreenProps) {
  const [tab, setTab] = useState<HelpTab>(initialTab)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<FaqCategory | "all">("all")
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)

  const visibleFaqs = useMemo(() => {
    const term = query.trim().toLowerCase()
    return faqEntries.filter((entry) => {
      if (category !== "all" && entry.category !== category) return false
      if (!term) return true
      return (
        entry.question.toLowerCase().includes(term) ||
        entry.answer.toLowerCase().includes(term)
      )
    })
  }, [query, category])

  const openTicketCount = tickets.filter((t) => t.status !== "resolved").length

  return (
    <div className="ui-screen relative flex h-full flex-col overflow-hidden select-none">
      <header className="ui-divider shrink-0 border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <BackButton onClick={onBack} />
          <div className="min-w-0">
            <h1 className="ui-text text-[16px] font-bold leading-tight tracking-tight">
              Help Centre
            </h1>
            <p className="ui-text-dim text-[11px] font-medium leading-tight">
              Answers, tickets and how to reach a person
            </p>
          </div>
        </div>
      </header>

      <SwoopTabs
        tabs={[
          { id: "faq", label: "FAQ", icon: <Icon name="help" size={13} /> },
          {
            id: "tickets",
            label: "Tickets",
            icon: <Icon name="ticket" size={13} />,
            count: openTicketCount,
          },
          {
            id: "contact",
            label: "Contact",
            icon: <Icon name="chat" size={13} />,
          },
        ]}
        active={tab}
        onChange={setTab}
        idPrefix="help-tab"
        ariaLabel="Help sections"
      />

      <div
        key={tab}
        className="min-h-0 flex-1 overflow-y-auto animate-task-tab-panel"
      >
        {/* ── FAQ ───────────────────────────────────────────────── */}
        {tab === "faq" && (
          <div className="px-4 pb-10 pt-3">
            <div className="ui-surface-sunken ui-text flex h-9 items-center gap-2 rounded-xl border px-3">
              <span className="ui-text-dim shrink-0">
                <Icon name="search" size={13} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles"
                className="ui-text min-w-0 flex-1 bg-transparent text-[12.5px] font-medium outline-none placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="ui-text-dim shrink-0 cursor-pointer text-[11px] font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {faqCategories.map((cat) => (
                <Chip
                  key={cat.id}
                  selected={category === cat.id}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.label}
                </Chip>
              ))}
            </div>

            {visibleFaqs.length === 0 ? (
              <div className="ui-divider mt-6 flex flex-col items-center rounded-2xl border border-dashed px-6 py-10 text-center">
                <span className="ui-text-dim">
                  <Icon name="search" size={20} />
                </span>
                <p className="ui-text mt-2.5 text-[13px] font-bold">
                  Nothing matches &ldquo;{query}&rdquo;
                </p>
                <p className="ui-text-dim mt-1 max-w-[240px] text-[11.5px] leading-[17px]">
                  Try a shorter search, or raise a ticket and a person will pick
                  it up.
                </p>
                <button
                  type="button"
                  onClick={onNewTicket}
                  className="mt-4 flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#0055ff] px-4 text-[11.5px] font-semibold text-white transition-colors hover:bg-blue-600 active:scale-95"
                >
                  <Icon name="plus" size={12} />
                  Raise a ticket
                </button>
              </div>
            ) : (
              <div className="ui-divider mt-3 divide-y border-y [&>*]:border-inherit">
                {visibleFaqs.map((entry) => {
                  const isOpen = openFaqId === entry.id
                  return (
                    <div key={entry.id} className="ui-divider">
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? null : entry.id)}
                        aria-expanded={isOpen}
                        className="ui-pressable flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-3 text-left transition-colors"
                      >
                        <span className="ui-text min-w-0 flex-1 text-[12.5px] font-semibold leading-snug">
                          {entry.question}
                        </span>
                        <span
                          className={`ui-text-dim mt-0.5 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        >
                          <Icon name="chevron" size={13} />
                        </span>
                      </button>
                      {isOpen && (
                        <p className="ui-text-muted px-1.5 pb-3.5 text-[12px] leading-[18px] animate-slide-up">
                          {entry.answer}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="ui-surface-sunken mt-4 flex items-center gap-3 rounded-2xl border p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0055ff] dark:bg-blue-500/15">
                <Icon name="chat" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="ui-text text-[12.5px] font-bold">Still stuck?</p>
                <p className="ui-text-dim text-[11px] leading-tight">
                  Raise a ticket and we usually reply within a working day.
                </p>
              </div>
              <button
                type="button"
                onClick={onNewTicket}
                className="flex h-7.5 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-[#0055ff] px-3 text-[11px] font-semibold text-white transition-colors hover:bg-blue-600 active:scale-95"
              >
                <Icon name="plus" size={11} />
                New
              </button>
            </div>
          </div>
        )}

        {/* ── Tickets ───────────────────────────────────────────── */}
        {tab === "tickets" && (
          <div className="px-4 pb-10 pt-3">
            <button
              type="button"
              onClick={onNewTicket}
              className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0055ff] text-[12.5px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-600 active:scale-[0.98]"
            >
              <Icon name="plus" size={13} />
              Raise a new ticket
            </button>

            {tickets.length === 0 ? (
              <div className="ui-divider mt-4 flex flex-col items-center rounded-2xl border border-dashed px-6 py-10 text-center">
                <span className="ui-text-dim">
                  <Icon name="ticket" size={20} />
                </span>
                <p className="ui-text mt-2.5 text-[13px] font-bold">
                  No tickets yet
                </p>
                <p className="ui-text-dim mt-1 max-w-[240px] text-[11.5px] leading-[17px]">
                  Anything you raise shows up here with the full conversation.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {tickets.map((ticket) => {
                  const status = ticketStatusMeta[ticket.status]
                  const last = ticket.messages[ticket.messages.length - 1]
                  return (
                    <button
                      type="button"
                      key={ticket.id}
                      onClick={() => onOpenTicket(ticket)}
                      className="ui-surface ui-pressable w-full cursor-pointer rounded-2xl border p-3 text-left transition-colors active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-bold tabular-nums text-[#0055ff]">
                          {ticket.id}
                        </span>
                        <Chip size="xs" color={status.color}>
                          {status.label}
                        </Chip>
                        <span className="ui-text-dim ml-auto shrink-0 text-[10px] font-medium">
                          {ticket.updatedAt}
                        </span>
                      </div>
                      <p className="ui-text mt-1.5 text-[12.5px] font-semibold leading-snug">
                        {ticket.subject}
                      </p>
                      <p className="ui-text-dim mt-1 line-clamp-1 text-[11px] leading-tight">
                        {last.author === "you"
                          ? "You: "
                          : `${last.authorName}: `}
                        {last.body}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Contact ───────────────────────────────────────────── */}
        {tab === "contact" && (
          <div className="px-4 pb-10 pt-3 space-y-2">
            <ContactRow
              icon="chat"
              title="Raise a support ticket"
              detail="Best for anything project-specific · replies in ~1 working day"
              onClick={onNewTicket}
              accent
            />
            <ContactRow
              icon="mail"
              title="support@fieldworks.app"
              detail="Email us directly if you cannot sign in"
            />
            <ContactRow
              icon="phone"
              title="+44 20 7946 0812"
              detail="Urgent site blockers · Mon–Fri, 07:00–19:00 UK"
            />

            <p className="ui-text-dim px-1 pb-1 pt-4 text-[9.5px] font-bold uppercase tracking-wider">
              Legal
            </p>
            <ContactRow
              icon="book"
              title="Terms & Conditions"
              detail="Updated 1 July 2026"
              onClick={onOpenTerms}
            />
            <ContactRow
              icon="shield"
              title="Privacy Policy"
              detail="What we collect and why"
              onClick={onOpenPrivacy}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ContactRow({
  icon,
  title,
  detail,
  onClick,
  accent = false,
}: {
  icon: string
  title: string
  detail: string
  onClick?: () => void
  accent?: boolean
}) {
  const inner = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          accent
            ? "bg-[#0055ff] text-white"
            : "bg-blue-50 text-[#0055ff] dark:bg-blue-500/15"
        }`}
      >
        <Icon name={icon} size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="ui-text block text-[12.5px] font-semibold leading-tight">
          {title}
        </span>
        <span className="ui-text-dim block text-[11px] leading-tight">
          {detail}
        </span>
      </span>
      {onClick && (
        <span className="ui-text-dim shrink-0">
          <Icon name="chevron" size={13} />
        </span>
      )}
    </>
  )

  if (!onClick) {
    return (
      <div className="ui-surface flex items-center gap-3 rounded-2xl border p-3">
        {inner}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="ui-surface ui-pressable flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-colors active:scale-[0.99]"
    >
      {inner}
    </button>
  )
}

export default HelpCenterScreen
