import { statusColors, severityColors } from "../data/mockData"
import { CHIP_SIZES } from "./Chip"

/**
 * Status and severity read-only chips. They share the Chip geometry so a badge
 * sitting next to a filter chip is the same height and radius; only the tint
 * comes from the data, which carries its own paired background and text colour.
 */

export function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] ?? { bg: "#f3f4f6", text: "#6b7280" }
  return (
    <span
      data-status={status}
      className={`status-badge inline-flex shrink-0 items-center justify-center rounded-full font-bold whitespace-nowrap ${CHIP_SIZES.sm}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        letterSpacing: "0.02em",
      }}
    >
      {status}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: string }) {
  const colors = severityColors[severity] ?? {
    bg: "#f3f4f6",
    text: "#6b7280",
    dot: "#9ca3af",
  }
  return (
    <span
      data-severity={severity}
      className={`severity-badge inline-flex shrink-0 items-center justify-center rounded-full font-bold whitespace-nowrap ${CHIP_SIZES.sm}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        letterSpacing: "0.02em",
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: colors.dot }}
      />
      {severity}
    </span>
  )
}
