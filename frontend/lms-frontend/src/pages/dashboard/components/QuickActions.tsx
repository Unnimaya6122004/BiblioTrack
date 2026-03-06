import { useNavigate } from "react-router-dom"

export default function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    {
      label: "Issue a new book loan",
      path: "/loans",
    },
    {
      label: "Add books to catalog",
      path: "/books",
    },
    {
      label: "Register a new member",
      path: "/users",
    },
    {
      label: "Manage reservations",
      path: "/reservations",
    },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

      <h2 className="text-lg font-semibold mb-4">
        Quick Actions
      </h2>

      <ul className="space-y-3">

        {actions.map((action) => (
          <li key={action.label}>

            <button
              onClick={() => navigate(action.path)}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              • {action.label}
            </button>

          </li>
        ))}

      </ul>

    </div>
  )
}