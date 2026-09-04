import { useState, useRef } from "react"
import type { KeyboardEvent, ChangeEvent } from "react"
import { CustomKeyboard } from "./CustomKeyboard"

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [emailInput, setEmailInput] = useState("")
  const [emailsList, setEmailsList] = useState<string[]>([])
  const [isSuccess, setIsSuccess] = useState(false)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  // Process text input into email tags on space, comma, or enter
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.includes(" ") || val.includes(",")) {
      const parts = val.split(/[\s,]+/).filter(Boolean)
      const valid = parts.filter((p) => p.includes("@"))
      const remaining = parts.filter((p) => !p.includes("@")).join(" ")

      if (valid.length > 0) {
        setEmailsList((prev) => Array.from(new Set([...prev, ...valid])))
      }
      setEmailInput(remaining)
    } else {
      setEmailInput(val)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      const val = emailInput.trim()
      if (val && val.includes("@")) {
        setEmailsList((prev) => Array.from(new Set([...prev, val])))
        setEmailInput("")
      }
    } else if (e.key === "Backspace" && !emailInput && emailsList.length > 0) {
      setEmailsList((prev) => prev.slice(0, -1))
    }
  }

  const removeEmail = (emailToRemove: string) => {
    setEmailsList((prev) => prev.filter((em) => em !== emailToRemove))
  }

  const handleCommitCurrentInput = () => {
    const val = emailInput.trim()
    if (val && val.includes("@")) {
      setEmailsList((prev) => Array.from(new Set([...prev, val])))
      setEmailInput("")
    }
  }

  const handleSend = () => {
    let finalEmails = [...emailsList]
    if (emailInput.trim() && emailInput.includes("@")) {
      finalEmails = Array.from(new Set([...finalEmails, emailInput.trim()]))
    }

    if (finalEmails.length === 0) return

    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setEmailsList([])
      setEmailInput("")
      setIsKeyboardOpen(false)
      onClose()
    }, 1200)
  }

  const totalInvites =
    emailsList.length + (emailInput.trim().includes("@") ? 1 : 0)

  return (
    <div
      onClick={() => {
        setIsKeyboardOpen(false)
        onClose()
      }}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/45 backdrop-blur-xs select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mx-auto flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#121524] shadow-[0_-12px_40px_rgba(0,0,0,0.25)] animate-slide-up max-h-[92vh]"
      >
        {/* Grab Handle */}
        <div className="shrink-0 pt-2.5 pb-1">
          <div
            className="mx-auto h-1 w-9 rounded-full bg-slate-300 dark:bg-white/20"
            aria-hidden="true"
          />
        </div>

        {/* Header with proper padding */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/15 text-[#0055ff] dark:text-blue-400 flex items-center justify-center shadow-2xs shrink-0">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <div>
              <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight">
                Invite Collaborators
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Stalwart Workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsKeyboardOpen(false)
              onClose()
            }}
            className="w-7 h-7 rounded-full bg-slate-100/90 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close invite modal"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sheet Body with balanced padding */}
        <div className="px-5 py-4 space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar">
          {/* Multiple Email Input Container */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Email Addresses
              </label>
              <span className="text-[9.5px] text-slate-400 font-medium">
                Space to separate
              </span>
            </div>

            <div
              onClick={() => {
                inputRef.current?.focus()
                setIsKeyboardOpen(true)
              }}
              className="min-h-[86px] max-h-[140px] overflow-y-auto p-2.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 focus-within:border-[#0055ff] focus-within:bg-white dark:focus-within:bg-[#161a2b] transition-all flex flex-wrap gap-1.5 items-start cursor-text"
            >
              {/* Email Chips */}
              {emailsList.map((em) => (
                <span
                  key={em}
                  className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-500/15 text-[#0055ff] dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold animate-scale-in"
                >
                  <span className="truncate max-w-[150px]">{em}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeEmail(em)
                    }}
                    className="hover:text-red-500 text-[11px] font-bold cursor-pointer leading-none ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={emailInput}
                onFocus={() => setIsKeyboardOpen(true)}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  emailsList.length === 0
                    ? "alex@site.com john@eng.com"
                    : "Add more..."
                }
                className="flex-1 min-w-[130px] bg-transparent text-[11.5px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none py-1 px-1 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Compact Modern Footer */}
        <div className={`px-5 pt-3 ${isKeyboardOpen ? "pb-2" : "pb-6"} border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#161a2b]/50 flex items-center justify-between gap-3`}>
          <button
            type="button"
            onClick={() => {
              setIsKeyboardOpen(false)
              onClose()
            }}
            className="px-3.5 py-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={totalInvites === 0}
            className={`flex-1 h-8 px-4 rounded-full text-[11.5px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isSuccess
                ? "bg-emerald-600 text-white"
                : totalInvites > 0
                  ? "bg-[#0055ff] hover:bg-blue-600 active:scale-95 text-white shadow-xs shadow-blue-500/25 cursor-pointer"
                  : "bg-slate-200/80 dark:bg-white/10 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSuccess ? (
              <span>Invited Successfully! ✓</span>
            ) : (
              <span>
                {totalInvites > 1
                  ? `Send ${totalInvites} Invites`
                  : "Send Invitation"}
              </span>
            )}
          </button>
        </div>

        {/* Simulated iOS Keyboard from bottom when typing */}
        {isKeyboardOpen && (
          <div
            className="w-full shrink-0 border-t border-slate-200/80 dark:border-white/10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <CustomKeyboard
              type="alpha"
              actionLabel="Add"
              onKeyPress={(char) => {
                setEmailInput((prev) => {
                  const updated = prev + char
                  if (char === " ") {
                    const trimmed = prev.trim()
                    if (trimmed && trimmed.includes("@")) {
                      setEmailsList((list) => Array.from(new Set([...list, trimmed])))
                      return ""
                    }
                  }
                  return updated
                })
              }}
              onBackspace={() => {
                setEmailInput((prev) => {
                  if (prev.length > 0) return prev.slice(0, -1)
                  if (emailsList.length > 0) {
                    setEmailsList((list) => list.slice(0, -1))
                  }
                  return ""
                })
              }}
              onSubmit={() => {
                handleCommitCurrentInput()
                setIsKeyboardOpen(false)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
