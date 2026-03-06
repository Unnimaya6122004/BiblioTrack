type StatCardProps = {
  title: string
  value: number
  description: string
  icon: string
}

export default function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6 flex justify-between items-start">

      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <h3 className="text-2xl font-semibold mt-2">{value}</h3>

        <p className="text-sm text-gray-400">{description}</p>
      </div>

      <div className="bg-gray-100 p-3 rounded-lg">
        {icon}
      </div>

    </div>
  )
}