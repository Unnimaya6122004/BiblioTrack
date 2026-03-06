export default function SystemStatus() {

  const status = [
    { name: "Database", value: "Operational" },
    { name: "API Server", value: "Demo Mode" },
    { name: "Authentication", value: "Bypassed" },
    { name: "Search Index", value: "Ready" },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

      <h2 className="text-lg font-semibold mb-4">
        System Status
      </h2>

      <div className="space-y-3">

        {status.map((item) => (
          <div
            key={item.name}
            className="flex justify-between items-center"
          >

            <span className="text-gray-600">
              {item.name}
            </span>

            <span className="text-green-600 font-medium">
              {item.value}
            </span>

          </div>
        ))}

      </div>

    </div>
  )
}