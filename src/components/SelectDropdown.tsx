import { useState, useEffect, useRef, ReactNode } from "react"

const scaleInKeyframes = `
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.97) translateY(-4px); }
  to   { opacity: 1; transform: scale(1)    translateY(0px); }
}
`

if (typeof document !== "undefined") {
  const styleId = "select-dropdown-keyframes"
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = scaleInKeyframes
    document.head.appendChild(style)
  }
}

export interface SelectOption {
  value: string
  label: string
  dot?: string
  badge?: ReactNode
}

export interface SelectDropdownProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  renderTrigger?: (selected: SelectOption | undefined) => ReactNode
}

export function SelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  renderTrigger,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger */}
      {renderTrigger ? (
        <div onClick={() => setOpen((v) => !v)} style={{ cursor: "pointer" }}>
          {renderTrigger(selected)}
        </div>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "white",
            border: "2px solid #e8eeff",
            borderRadius: "1rem",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: selected ? "#1a1f36" : "#94a3b8",
            }}
          >
            {selected ? selected.label : placeholder}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{
              flexShrink: 0,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms",
            }}
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            marginTop: "8px",
            left: 0,
            right: 0,
            background: "white",
            borderRadius: "1rem",
            zIndex: 30,
            overflow: "hidden",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
            animation: "scaleIn 180ms cubic-bezier(0.4,0,0.2,1) forwards",
          }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value
            const isLast = i === options.length - 1
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  borderBottom: isLast ? "none" : "1px solid #f0f4ff",
                  cursor: "pointer",
                  background: "white",
                  transition: "background 100ms",
                }}
                onMouseDown={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.background =
                    "#f8f9ff"
                }}
                onMouseUp={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.background =
                    "white"
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.background =
                    "white"
                }}
              >
                {/* Left indicator */}
                {opt.dot ? (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: opt.dot,
                      flexShrink: 0,
                    }}
                  />
                ) : opt.badge ? (
                  <span style={{ flexShrink: 0 }}>{opt.badge}</span>
                ) : null}

                <span
                  style={{
                    flex: 1,
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1a1f36",
                  }}
                >
                  {opt.label}
                </span>

                {/* Checkmark */}
                {isSelected && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ flexShrink: 0 }}
                  >
                    <path
                      d="M3 8L6.5 11.5L13 5"
                      stroke="#0052ff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SelectDropdown
