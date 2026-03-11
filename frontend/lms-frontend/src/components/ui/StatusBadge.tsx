type Props = {
  status: string
}

function formatStatusLabel(status: string): string {
  return status
    .trim()
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getStatusClasses(status: string): string {
  const normalized = status.trim().toUpperCase()

  if (["ACTIVE", "AVAILABLE", "COMPLETED", "RETURNED", "PAID"].includes(normalized)) {
    return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
  }

  if (["ISSUED", "PENDING"].includes(normalized)) {
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
  }

  if (["OVERDUE", "UNPAID", "BLOCKED", "CANCELLED", "WARNING"].includes(normalized)) {
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
  }

  if (normalized === "INACTIVE") {
    return "bg-slate-200 text-slate-700 ring-1 ring-slate-300"
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
}

export default function StatusBadge({ status }: Props) {
  const safeStatus = status?.trim() || "Unknown"

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(safeStatus)}`}
    >
      {formatStatusLabel(safeStatus)}
    </span>
  )
}
