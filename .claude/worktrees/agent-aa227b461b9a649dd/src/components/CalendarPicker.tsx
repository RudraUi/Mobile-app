import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface CalendarPickerProps {
  value: string
  onChange: (value: string) => void
  color?: string
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function formatDisplay(dateStr: string): string {
  if (!dateStr) return ""
  const [y, m, d] = dateStr.split("-").map(Number)
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

export function CalendarPicker({
  value,
  onChange,
  color = "#0052ff",
}: CalendarPickerProps) {
  const [open, setOpen] = useState(false)

  const initMonth = () => {
    if (value) {
      const [y, m] = value.split("-").map(Number)
      return new Date(y, m - 1, 1)
    }
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  }

  const [displayMonth, setDisplayMonth] = useState<Date>(initMonth)

  // Re-sync display month when value changes externally
  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number)
      setDisplayMonth(new Date(y, m - 1, 1))
    }
  }, [value])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const year = displayMonth.getFullYear()
  const month = displayMonth.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const modal = open
    ? createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            animation: "calBgIn 200ms ease forwards",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <style>{`
        @keyframes calBgIn {
          from { background: rgba(15,20,40,0); }
          to   { background: rgba(15,20,40,0.48); }
        }
        @keyframes calSheetIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

          {/* Sheet */}
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "white",
              borderRadius: "24px 24px 0 0",
              paddingBottom: "env(safe-area-inset-bottom, 16px)",
              animation:
                "calSheetIn 240ms cubic-bezier(0.34,1.1,0.64,1) forwards",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.16)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "12px",
                paddingBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "4px",
                  borderRadius: "99px",
                  background: "#e0e7f0",
                }}
              />
            </div>

            {/* Header */}
            <div
              style={{
                padding: "12px 20px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                  }}
                >
                  Due Date
                </p>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#1a1f36",
                    lineHeight: 1.2,
                  }}
                >
                  {value ? formatDisplay(value) : "Select a date"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  background: "#f4f7ff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Month nav */}
            <div
              style={{
                padding: "16px 20px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={() => setDisplayMonth(new Date(year, month - 1, 1))}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  background: "#f4f7ff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 4L6 8L10 12"
                    stroke="#1a1f36"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#1a1f36",
                  }}
                >
                  {MONTHS[month]}
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#94a3b8",
                    marginLeft: "6px",
                  }}
                >
                  {year}
                </span>
              </div>

              <button
                onClick={() => setDisplayMonth(new Date(year, month + 1, 1))}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  background: "#f4f7ff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="#1a1f36"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Day labels */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                padding: "0 16px",
                marginBottom: "4px",
              }}
            >
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: i === 0 || i === 6 ? "#e2a0a0" : "#94a3b8",
                    textAlign: "center",
                    padding: "4px 0",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                padding: "0 16px 8px",
                gap: "2px 0",
              }}
            >
              {cells.map((day, idx) => {
                if (day === null) return <div key={`e-${idx}`} />

                const cellStr = toDateStr(year, month, day)
                const isSelected = cellStr === value
                const isToday = cellStr === todayStr

                const cellDate = new Date(year, month, day)
                cellDate.setHours(0, 0, 0, 0)
                const isPast = cellDate < today
                const isWeekend =
                  new Date(year, month, day).getDay() === 0 ||
                  new Date(year, month, day).getDay() === 6

                let bg = "transparent"
                let txtColor = isPast
                  ? "#c8d1e0"
                  : isWeekend
                    ? "#e2a0a0"
                    : "#1a1f36"
                let borderStyle = "none"
                let shadow = "none"
                let fontWeight = 500

                if (isSelected) {
                  bg = color
                  txtColor = "white"
                  shadow = `0 4px 14px ${color}50`
                  fontWeight = 700
                } else if (isToday) {
                  borderStyle = `2px solid ${color}60`
                  txtColor = color
                  fontWeight = 700
                }

                return (
                  <button
                    key={cellStr}
                    onClick={() => {
                      onChange(cellStr)
                      setOpen(false)
                    }}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight,
                      background: bg,
                      color: txtColor,
                      border: borderStyle,
                      boxShadow: shadow,
                      cursor: "pointer",
                      transition: "all 120ms",
                      opacity: isPast && !isSelected ? 0.5 : 1,
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Confirm row */}
            <div
              style={{ padding: "8px 20px 16px", display: "flex", gap: "10px" }}
            >
              <button
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
                style={{
                  flex: 1,
                  height: "48px",
                  borderRadius: "14px",
                  border: "2px solid #e8eeff",
                  background: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 2,
                  height: "48px",
                  borderRadius: "14px",
                  border: "none",
                  background: value ? color : "#e8eeff",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: value ? "white" : "#94a3b8",
                  cursor: "pointer",
                  boxShadow: value ? `0 4px 14px ${color}40` : "none",
                  transition: "all 200ms",
                }}
              >
                {value ? `Confirm ${formatDisplay(value)}` : "Select a date"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 16px",
          background: "white",
          border: `2px solid ${value ? color + "60" : "#e8eeff"}`,
          borderRadius: "1rem",
          cursor: "pointer",
          textAlign: "left",
          transition: "border-color 200ms",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <rect
            x="1"
            y="3"
            width="14"
            height="12"
            rx="2"
            stroke={value ? color : "#94a3b8"}
            strokeWidth="1.5"
          />
          <path
            d="M5 1v4M11 1v4"
            stroke={value ? color : "#94a3b8"}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M1 7h14"
            stroke={value ? color : "#94a3b8"}
            strokeWidth="1.5"
          />
        </svg>
        <span
          style={{
            flex: 1,
            fontSize: "14px",
            fontWeight: 600,
            color: value ? "#1a1f36" : "#94a3b8",
          }}
        >
          {value ? formatDisplay(value) : "Select due date"}
        </span>
        {value && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: color,
              background: `${color}12`,
              borderRadius: "6px",
              padding: "2px 8px",
            }}
          >
            SET
          </span>
        )}
      </button>

      {modal}
    </>
  )
}

export default CalendarPicker
