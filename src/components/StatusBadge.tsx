import { statusColors, severityColors } from "../data/mockData";

export function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] ?? { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
      style={{ backgroundColor: colors.bg, color: colors.text, letterSpacing: "0.02em" }}
    >
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const colors = severityColors[severity] ?? { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
      style={{ backgroundColor: colors.bg, color: colors.text, letterSpacing: "0.02em" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.dot }} />
      {severity}
    </span>
  );
}
