import { BookOpen, Users, Clock, Library } from "lucide-react"

export default function StatsSection() {

  const stats = [
    {
      value: "12,500+",
      label: "Books Cataloged",
      icon: BookOpen
    },
    {
      value: "3,200+",
      label: "Active Members",
      icon: Users
    },
    {
      value: "25+",
      label: "Years of Service",
      icon: Clock
    },
    {
      value: "5",
      label: "Branches",
      icon: Library
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 text-center py-12 border-y gap-10">

      {stats.map((stat) => {

        const Icon = stat.icon

        return (
          <div key={stat.label} className="flex flex-col items-center gap-3">

            {/* Icon */}
            <Icon
              size={28}
              className="text-[#c17a2b]"
            />

            {/* Value */}
            <div className="text-2xl font-semibold">
              {stat.value}
            </div>

            {/* Label */}
            <div className="text-gray-500 text-sm">
              {stat.label}
            </div>

          </div>
        )
      })}

    </div>
  )
}