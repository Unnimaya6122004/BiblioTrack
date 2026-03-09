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
    return "bg-green-100 text-green-700"
  }

  if (["ISSUED", "PENDING"].includes(normalized)) {
    return "bg-blue-100 text-blue-700"
  }

  if (["OVERDUE", "UNPAID", "BLOCKED", "CANCELLED", "WARNING"].includes(normalized)) {
    return "bg-red-100 text-red-700"
  }

  if (normalized === "INACTIVE") {
    return "bg-gray-200 text-gray-700"
  }

  return "bg-gray-100 text-gray-700"
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
