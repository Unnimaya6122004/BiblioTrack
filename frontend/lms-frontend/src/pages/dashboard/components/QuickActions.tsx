import type { LucideIcon } from "lucide-react"
import { ArrowRight, BookPlus, CalendarClock, LibraryBig, UserRoundPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"

type ActionItem = {
  label: string
  hint: string
  path: string
  icon: LucideIcon
}

export default function QuickActions() {
  const navigate = useNavigate()

  const actions: ActionItem[] = [
    {
      label: "Issue a new book loan",
      hint: "Create and confirm borrowing",
      path: "/loans",
      icon: LibraryBig
    },
    {
      label: "Add books to catalog",
      hint: "Create records with copy details",
      path: "/books",
      icon: BookPlus
    },
    {
      label: "Register a new member",
      hint: "Onboard a library user",
      path: "/users",
      icon: UserRoundPlus
    },
    {
      label: "Manage reservations",
      hint: "Track and resolve pending requests",
      path: "/reservations",
      icon: CalendarClock
    },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.8)]">

      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-blue-100/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-12 left-0 h-20 w-20 rounded-full bg-slate-100/70 blur-xl" />

      <h2 className="mb-1 text-lg font-bold text-slate-900">
        Quick Actions
      </h2>
      <p className="mb-4 text-xs text-slate-500">
        Common tasks for daily operations
      </p>

      <ul className="space-y-2.5">

        {actions.map((action) => (
          <li key={action.label}>

            <button
              onClick={() => navigate(action.path)}
              className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-left transition hover:border-blue-200 hover:bg-blue-50/70"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <action.icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {action.label}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {action.hint}
                  </span>
                </span>
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
              />
            </button>

          </li>
        ))}

      </ul>

    </div>
  )
}
