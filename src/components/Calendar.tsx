import { useMemo, useState } from "react"

export type CalendarMode = "day" | "week" | "month"

export interface CalendarSelection {
  mode: CalendarMode
  /** ISO yyyy-mm-dd. Day: the date. Week: Monday. Month: the 1st. */
  start: string
  /** ISO yyyy-mm-dd. Day: same as start. Week: Sunday. Month: last day. */
  end: string
  /** Human-readable summary, ready to render. */
  label: string
}

interface CalendarProps {
  /** Selected ISO date. Anchors whichever mode is active. */
  value?: string
  onChange: (selection: CalendarSelection) => void
  /** Which modes to offer. Omit for all three. A single mode hides the switch. */
  modes?: CalendarMode[]
  mode?: CalendarMode
  onModeChange?: (mode: CalendarMode) => void
  /** Nothing before this ISO date can be picked. */
  minDate?: string
  accent?: string
  showQuickChips?: boolean
  /** Renders the resolved selection under the grid. */
  showFooter?: boolean
  /** Option to hide the inline mode switch when controlled externally */
  hideModeSwitch?: boolean
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"]
const MONTHS_LONG = [
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
const MONTHS_SHORT = MONTHS_LONG.map((m) => m.slice(0, 3))
const MODE_LABEL: Record<CalendarMode, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
}

const pad = (n: number) => String(n).padStart(2, "0")
const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function fromISO(iso?: string): Date | null {
  if (!iso) return null
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

/** Weeks run Monday to Sunday throughout. */
function startOfWeek(date: Date) {
  const out = new Date(date)
  out.setDate(out.getDate() - ((out.getDay() + 6) % 7))
  out.setHours(0, 0, 0, 0)
  return out
}

function endOfWeek(date: Date) {
  const out = startOfWeek(date)
  out.setDate(out.getDate() + 6)
  return out
}

function isoWeekNumber(date: Date) {
  const target = startOfWeek(date)
  target.setDate(target.getDate() + 3)
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  firstThursday.setDate(
    firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3,
  )
  return (
    1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000)
  )
}

function buildSelection(mode: CalendarMode, date: Date): CalendarSelection {
  if (mode === "week") {
    const start = startOfWeek(date)
    const end = endOfWeek(date)
    const sameMonth = start.getMonth() === end.getMonth()
    return {
      mode,
      start: toISO(start),
      end: toISO(end),
      label: `Week ${isoWeekNumber(date)} · ${start.getDate()} ${
        sameMonth ? "" : `${MONTHS_SHORT[start.getMonth()]} `
      }– ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]}`.replace("  ", " "),
    }
  }
  if (mode === "month") {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return {
      mode,
      start: toISO(start),
      end: toISO(end),
      label: `${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`,
    }
  }
  return {
    mode,
    start: toISO(date),
    end: toISO(date),
    label: date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  )
}

export function Calendar({
  value,
  onChange,
  modes = ["day", "week", "month"],
  mode: controlledMode,
  onModeChange,
  minDate,
  accent = "#0055ff",
  showQuickChips = true,
  showFooter = true,
  hideModeSwitch = false,
}: CalendarProps) {
  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  const selectedDate = fromISO(value)
  const floor = fromISO(minDate)

  const [uncontrolledMode, setUncontrolledMode] = useState<CalendarMode>(
    modes[0] ?? "day",
  )
  const mode = controlledMode ?? uncontrolledMode
  const setMode = (next: CalendarMode) => {
    if (onModeChange) onModeChange(next)
    else setUncontrolledMode(next)
  }

  const [cursor, setCursor] = useState(
    () => selectedDate ?? new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [slide, setSlide] = useState<"next" | "prev" | null>(null)
  const [isYearOpen, setIsYearOpen] = useState(false)

  const shift = (delta: number) => {
    setSlide(delta > 0 ? "next" : "prev")
    setCursor(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + (mode === "month" ? delta * 12 : delta),
          1,
        ),
    )
  }

  const commit = (date: Date) => onChange(buildSelection(mode, date))

  const isBlocked = (date: Date) => Boolean(floor && date < floor)

  /* A stable 6x7 grid, so the sheet never jumps height between months. */
  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const gridStart = startOfWeek(first)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      return d
    })
  }, [cursor])

  const weeks = useMemo(
    () => Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7)),
    [cells],
  )

  const selectedWeekStart = selectedDate ? +startOfWeek(selectedDate) : null
  const slideClass =
    slide === "next"
      ? "animate-cal-next"
      : slide === "prev"
        ? "animate-cal-prev"
        : ""

  const quickChips: { label: string offset: number }[] = [
    { label: "Today", offset: 0 },
    { label: "Tomorrow", offset: 1 },
    { label: "Next week", offset: 7 },
  ]

  return (
    <div className="select-none">
      {/* Mode switch */}
      {!hideModeSwitch && modes.length > 1 && (
        <div className="flex rounded-lg bg-slate-100/80 p-0.5">
          {modes.map((m) => {
            const isActive = mode === m
            return (
              <button
                type="button"
                key={m}
                onClick={() => {
                  setMode(m)
                  if (selectedDate) onChange(buildSelection(m, selectedDate))
                }}
                className={`h-6.5 flex-1 cursor-pointer rounded-[7px] text-[11px] font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {MODE_LABEL[m]}
              </button>
            )
          })}
        </div>
      )}

      {/* Quick chips */}
      {showQuickChips && mode === "day" && (
        <div className="mt-2.5 flex justify-center gap-1.5">
          {quickChips.map((chip) => {
            const target = new Date(today)
            target.setDate(target.getDate() + chip.offset)
            const isActive = selectedDate
              ? sameDay(selectedDate, target)
              : false
            return (
              <button
                type="button"
                key={chip.label}
                onClick={() => {
                  setCursor(
                    new Date(target.getFullYear(), target.getMonth(), 1),
                  )
                  commit(target)
                }}
                className={`h-6 cursor-pointer rounded-full px-2.5 text-[10.5px] font-semibold transition-all active:scale-95 ${
                  isActive
                    ? "text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={isActive ? { backgroundColor: accent } : undefined}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Month / year navigator */}
      <div className="mt-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-90"
          aria-label={mode === "month" ? "Previous year" : "Previous month"}
        >
          <Chevron dir="left" />
        </button>

        <button
          type="button"
          onClick={() => setIsYearOpen(!isYearOpen)}
          className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-0.5 transition-colors hover:bg-slate-100"
        >
          <span className="text-[12.5px] font-bold text-slate-900">
            {mode === "month"
              ? cursor.getFullYear()
              : `${MONTHS_LONG[cursor.getMonth()]} ${cursor.getFullYear()}`}
          </span>
          <span
            className={`text-slate-400 transition-transform duration-200 ${
              isYearOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>

        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-90"
          aria-label={mode === "month" ? "Next year" : "Next month"}
        >
          <Chevron dir="right" />
        </button>
      </div>

      {/* Year jump list, revealed from the header */}
      {isYearOpen && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar animate-cal-pop">
          {Array.from(
            { length: 9 },
            (_, i) => cursor.getFullYear() - 4 + i,
          ).map((year) => {
            const isActive = year === cursor.getFullYear()
            return (
              <button
                type="button"
                key={year}
                onClick={() => {
                  setSlide(year > cursor.getFullYear() ? "next" : "prev")
                  setCursor(new Date(year, cursor.getMonth(), 1))
                  setIsYearOpen(false)
                }}
                className={`h-6 shrink-0 cursor-pointer rounded-full px-2.5 text-[10.5px] font-semibold tabular-nums transition-all active:scale-95 ${
                  isActive
                    ? "text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={isActive ? { backgroundColor: accent } : undefined}
              >
                {year}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Month mode: a grid of months ─────────────────────────────── */}
      {mode === "month" ? (
        <div
          key={cursor.getFullYear()}
          className={`mt-2.5 grid grid-cols-3 gap-1.5 ${slideClass}`}
        >
          {MONTHS_SHORT.map((label, index) => {
            const monthDate = new Date(cursor.getFullYear(), index, 1)
            const isSelected =
              selectedDate &&
              selectedDate.getFullYear() === cursor.getFullYear() &&
              selectedDate.getMonth() === index
            const isThisMonth =
              today.getFullYear() === cursor.getFullYear() &&
              today.getMonth() === index
            const blocked = isBlocked(
              new Date(cursor.getFullYear(), index + 1, 0),
            )
            return (
              <button
                type="button"
                key={label}
                disabled={blocked}
                onClick={() => commit(monthDate)}
                className={`relative h-8 cursor-pointer rounded-full text-[11px] font-semibold transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${
                  isSelected
                    ? "text-white shadow-2xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
                style={isSelected ? { backgroundColor: accent } : undefined}
              >
                {label}
                {isThisMonth && !isSelected && (
                  <span
                    className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <>
          {/* Weekday header */}
          <div className="mt-2.5 grid grid-cols-7">
            {WEEKDAYS.map((day, i) => (
              <span
                key={`${day}-${i}`}
                className="text-center text-[9.5px] font-bold uppercase tracking-wide text-slate-400"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div
            key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
            className={`mt-1 ${slideClass}`}
          >
            {weeks.map((week, weekIndex) => {
              const weekStart = +startOfWeek(week[0])
              const isWeekSelected =
                mode === "week" && selectedWeekStart === weekStart
              const weekBlocked =
                mode === "week" && week.every((d) => isBlocked(d))

              return (
                <div
                  key={weekIndex}
                  className={`relative grid grid-cols-7 ${
                    mode === "week" ? "cursor-pointer" : ""
                  }`}
                  onClick={
                    mode === "week" && !weekBlocked
                      ? () => commit(week[0])
                      : undefined
                  }
                >
                  {/* One connected pill behind the whole row in week mode */}
                  {isWeekSelected && (
                    <span
                      className="pointer-events-none absolute inset-y-0.5 left-0 right-0 rounded-full animate-cal-row"
                      style={{ backgroundColor: accent }}
                    />
                  )}

                  {week.map((date) => {
                    const isOutside = date.getMonth() !== cursor.getMonth()
                    const isToday = sameDay(date, today)
                    const isSelected =
                      mode === "day" &&
                      selectedDate !== null &&
                      sameDay(date, selectedDate)
                    const blocked = isBlocked(date)

                    return (
                      <button
                        type="button"
                        key={toISO(date)}
                        disabled={blocked || (mode === "week" && weekBlocked)}
                        onClick={
                          mode === "day" ? () => commit(date) : undefined
                        }
                        tabIndex={mode === "week" ? -1 : 0}
                        className={`relative z-10 flex h-8 items-center justify-center text-[11.5px] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-25 ${
                          mode === "day"
                            ? "cursor-pointer active:scale-90"
                            : "pointer-events-none"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 ${
                            isSelected
                              ? "font-bold text-white shadow-2xs animate-cal-pop"
                              : isWeekSelected
                                ? `font-semibold text-white ${
                                    isOutside ? "opacity-60" : ""
                                  }`
                                : isOutside
                                  ? "font-medium text-slate-300"
                                  : `font-medium text-slate-700 ${
                                      mode === "day" ? "hover:bg-slate-100" : ""
                                    }`
                          }`}
                          style={
                            isSelected ? { backgroundColor: accent } : undefined
                          }
                        >
                          {date.getDate()}
                        </span>

                        {/* Today marker — a ring when idle, a dot when covered */}
                        {isToday && !isSelected && !isWeekSelected && (
                          <span
                            className="pointer-events-none absolute inset-x-0 bottom-0.5 mx-auto h-1 w-1 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                        )}
                        {isToday && isWeekSelected && (
                          <span className="pointer-events-none absolute inset-x-0 bottom-0.5 mx-auto h-1 w-1 rounded-full bg-white/80" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Resolved selection */}
      {showFooter && selectedDate && (
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-100 pt-2.5">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: accent }}
          />
          <span className="min-w-0 truncate text-[11px] font-medium text-slate-700">
            {buildSelection(mode, selectedDate).label}
          </span>
        </div>
      )}
    </div>
  )
}

export default Calendar
