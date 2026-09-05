import { Chip } from "./Chip"
import { BottomSheet, SheetSection } from "./BottomSheet"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  statusFilter: string
  onStatusChange: (status: string) => void
  priorityFilter: string
  onPriorityChange: (priority: string) => void
  typeFilter: string
  onTypeChange: (type: string) => void
  onReset: () => void
}

export function FilterModal({
  isOpen,
  onClose,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  typeFilter,
  onTypeChange,
  onReset,
}: FilterModalProps) {
  const statuses = [
    { id: "all", label: "All Statuses" },
    { id: "TO DO", label: "To Do" },
    { id: "IN PROGRESS", label: "In Progress" },
    { id: "REVIEW", label: "In Review" },
    { id: "COMPLETED", label: "Completed" },
  ]

  const priorities = [
    { id: "all", label: "All", dot: undefined },
    { id: "HIGH", label: "High", dot: "#EF4444" },
    { id: "MEDIUM", label: "Medium", dot: "#F59E0B" },
    { id: "LOW", label: "Low", dot: "#94A3B8" },
  ]

  const types = [
    { id: "all", label: "All" },
    { id: "task", label: "Tasks" },
    { id: "issue", label: "Issues" },
    { id: "rfi", label: "RFIs" },
    { id: "fieldnote", label: "Field Notes" },
  ]

  const activeCount =
    (statusFilter !== "all" ? 1 : 0) +
    (priorityFilter !== "all" ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0)

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      subtitle={
        activeCount > 0
          ? `${activeCount} filter${activeCount > 1 ? "s" : ""} applied`
          : "Showing everything"
      }
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={activeCount === 0}
            className="ui-text-muted ui-divider h-10 shrink-0 cursor-pointer rounded-full border px-5 text-[12.5px] font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-white/[0.04]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 flex-1 cursor-pointer rounded-full bg-[#0055ff] text-[12.5px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-600 active:scale-[0.98]"
          >
            Apply filters
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <SheetSection label="Item type">
          {types.map((t) => (
            <Chip
              key={t.id}
              size="md"
              selected={typeFilter === t.id}
              onClick={() => onTypeChange(t.id)}
            >
              {t.label}
            </Chip>
          ))}
        </SheetSection>

        <SheetSection label="Status">
          {statuses.map((s) => (
            <Chip
              key={s.id}
              size="md"
              selected={statusFilter === s.id}
              onClick={() => onStatusChange(s.id)}
            >
              {s.label}
            </Chip>
          ))}
        </SheetSection>

        <SheetSection label="Priority">
          {priorities.map((p) => {
            const isActive = priorityFilter === p.id
            return (
              <Chip
                key={p.id}
                size="md"
                selected={isActive}
                onClick={() => onPriorityChange(p.id)}
                dot={p.dot ? (isActive ? "#ffffff" : p.dot) : undefined}
              >
                {p.label}
              </Chip>
            )
          })}
        </SheetSection>
      </div>
    </BottomSheet>
  )
}

export default FilterModal
