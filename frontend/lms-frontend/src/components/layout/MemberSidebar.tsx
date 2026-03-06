import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  Repeat,
  CalendarCheck,
  AlertTriangle,
  LogOut
} from "lucide-react"

export default function MemberSidebar() {

  const navigate = useNavigate()

  const menu = [
    { name: "Dashboard", path: "/member/dashboard", icon: LayoutDashboard },
    { name: "Browse Books", path: "/member/books", icon: BookOpen },
    { name: "My Loans", path: "/member/loans", icon: Repeat },
    { name: "My Reservations", path: "/member/reservations", icon: CalendarCheck },
    { name: "My Fines", path: "/member/fines", icon: AlertTriangle },
  ]

  const handleLogout = () => {
    navigate("/login")
  }

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">

      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Library Manager</h2>
        <p className="text-xs text-gray-400">Member Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">

        {menu.map((item) => {

          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-md text-sm ${
                  isActive ? "bg-gray-800" : "hover:bg-gray-800"
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          )
        })}

      </nav>

      <div className="p-4 border-t border-gray-700">

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-sm hover:text-red-400"
        >
          <LogOut size={18} />
          Sign Out
        </button>

      </div>

    </div>
  )
}