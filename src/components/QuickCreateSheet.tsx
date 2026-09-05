import { useState } from "react"
import useOverlayPresence from "../hooks/useOverlayPresence"
import type { ItemType } from "../data/mockData"

interface QuickCreateSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelectCreateType: (type: ItemType) => void
  onSiteCapture?: () => void
}

interface CreateActionOption {
  id: string
  title: string
  subtitle: string
  iconBg: string
  iconColor: string
  badge?: string
  badgeColor?: string
  actionType: "type" | "capture"
  type?: ItemType
  icon: () => React.ReactNode
}

export function QuickCreateSheet({
  isOpen,
  onClose,
  onSelectCreateType,
  onSiteCapture,
}: QuickCreateSheetProps) {
  const [showCaptureToast, setShowCaptureToast] = useState(false)

  const isPresent = useOverlayPresence(isOpen)
  if (!isPresent) return null

  const handleCaptureClick = () => {
    if (onSiteCapture) {
      onSiteCapture()
    } else {
      setShowCaptureToast(true)
      setTimeout(() => {
        setShowCaptureToast(false)
        onClose()
      }, 1800)
    }
  }

  const options: CreateActionOption[] = [
    {
      id: "site-capture",
      title: "Site Capture",
      subtitle: "Photo, 360° panorama & point scan",
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      badge: "360°",
      badgeColor: "bg-cyan-100 text-cyan-700",
      actionType: "capture",
      icon: () => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
    },
    {
      id: "create-task",
      title: "Create Task",
      subtitle: "Assign actions, track progress & deadlines",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      actionType: "type",
      type: "task",
      icon: () => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 11 3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      id: "create-issue",
      title: "Create Issue",
      subtitle: "Report site defect, clash or safety hazard",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      actionType: "type",
      type: "issue",
      icon: () => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      ),
    },
    {
      id: "create-rfi",
      title: "Create RFI",
      subtitle: "Request information or design clarification",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      actionType: "type",
      type: "rfi",
      icon: () => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <circle cx="10" cy="13" r="1" />
          <path d="M12 17h.01" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        </svg>
      ),
    },
    {
      id: "create-fieldnote",
      title: "Create Field Note",
      subtitle: "Quick observations & site journal notes",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      actionType: "type",
      type: "fieldnote",
      icon: () => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14h6" />
          <path d="M9 18h6" />
          <path d="M9 10h6" />
        </svg>
      ),
    },
  ]

  return (
    <div
      data-overlay-state={isOpen ? "open" : "closing"}
      inert={!isOpen}
      onClick={onClose}
      className="absolute inset-0 z-50 flex flex-col justify-end bg-slate-950/45 backdrop-blur-xs select-none animate-fade-in"
    >
      <section
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mx-auto flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] border-t border-slate-200 bg-white shadow-[0_-12px_32px_rgba(15,23,42,0.18)] animate-slide-up"
      >
        {/* Drag Handle & Header */}
        <header className="shrink-0 px-4 pt-2.5 pb-2">
          <div
            className="mx-auto mb-2 h-1 w-9 rounded-full bg-slate-200"
            aria-hidden="true"
          />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                Create new
              </h2>
              <p className="text-[11.5px] text-slate-500">
                Select an item type to create or capture
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 active:scale-95"
              aria-label="Close"
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

        {/* Options List */}
        <div className="px-3 pb-5 pt-1 space-y-1">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (option.actionType === "capture") {
                  handleCaptureClick()
                } else if (option.type) {
                  onSelectCreateType(option.type)
                }
              }}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all hover:bg-slate-50 active:scale-[0.99] active:bg-slate-100"
            >
              {/* Icon Badge */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${option.iconBg} ${option.iconColor}`}
              >
                {option.icon()}
              </div>

              {/* Title & Subtitle */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-bold text-slate-900">
                    {option.title}
                  </span>
                  {option.badge && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wide ${option.badgeColor}`}
                    >
                      {option.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {option.subtitle}
                </p>
              </div>

              {/* Chevron Arrow */}
              <div className="shrink-0 text-slate-300">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Toast for Site Capture (placeholder flow) */}
        {showCaptureToast && (
          <div className="absolute inset-x-4 bottom-4 z-20 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-[12px] font-medium text-white shadow-xl animate-fade-in">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-cyan-400 animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>Site 360° Capture initializing...</span>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
