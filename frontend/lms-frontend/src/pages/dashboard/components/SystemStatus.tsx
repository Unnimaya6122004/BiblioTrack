import { CheckCircle2, Circle, Server } from "lucide-react"

type StatusTone = "healthy" | "warning" | "neutral"

type StatusItem = {
  name: string
  value: string
  tone: StatusTone
}

export default function SystemStatus() {

  const status: StatusItem[] = [
    { name: "Database", value: "Operational", tone: "healthy" },
    { name: "API Server", value: "Demo Mode", tone: "warning" },
    { name: "Authentication", value: "Bypassed", tone: "warning" },
    { name: "Search Index", value: "Ready", tone: "healthy" },
  ]
  const healthyCount = status.filter((item) => item.tone === "healthy").length
  const healthPercent = Math.round((healthyCount / status.length) * 100)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.8)]">

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            System Status
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Infrastructure health snapshot
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 size={13} />
          Stable
        </span>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
          <span>Overall readiness</span>
          <span className="font-semibold text-slate-700">{healthPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {status.map((item) => {
          const statusTextClassName = item.tone === "healthy"
            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
            : item.tone === "warning"
              ? "text-amber-700 bg-amber-50 border-amber-200"
              : "text-slate-700 bg-slate-100 border-slate-200"
          const dotClassName = item.tone === "healthy"
            ? "text-emerald-500"
            : item.tone === "warning"
              ? "text-amber-500"
              : "text-slate-400"

          return (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <Server size={14} className="text-slate-400" />
                {item.name}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${statusTextClassName}`}
              >
                <Circle size={8} className={dotClassName} />
                {item.value}
              </span>
            </div>
          )
        })}
      </div>

    </div>
  )
}
