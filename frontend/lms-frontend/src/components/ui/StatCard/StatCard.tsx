import type { ReactNode } from "react"

type StatCardProps = {
  title: string
  value: number | string
  description: string
  icon: ReactNode
}

export default function StatCard({
  title,
  value,
  description,
  icon
}: StatCardProps) {
  const accentClassName = title === "Unpaid Fines"
    ? "from-rose-500 to-orange-500"
    : title === "Active Loans"
      ? "from-sky-500 to-cyan-500"
      : title === "Reservations"
        ? "from-violet-500 to-indigo-500"
        : "from-emerald-500 to-teal-500"

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.7)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-24px_rgba(15,23,42,0.8)]">

      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${accentClassName}`} />
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-slate-100/80 blur-2xl" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.7rem] uppercase tracking-[0.14em] text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-3xl font-bold leading-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
          {icon}
        </div>
      </div>

    </div>
  )
}
