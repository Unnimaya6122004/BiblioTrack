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
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center shadow-sm hover:shadow-md transition">

      <div>
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <p className="text-2xl font-semibold mt-1 text-gray-900">
          {value}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {description}
        </p>
      </div>

      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600">
        {icon}
      </div>

    </div>
  )
}