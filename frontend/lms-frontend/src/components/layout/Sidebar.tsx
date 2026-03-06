import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  BookCopy,
  Users,
  Repeat,
  CalendarCheck,
  AlertTriangle,
  LogOut
} from "lucide-react"

type Props = {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
}

export default function Sidebar({ collapsed }: Props) {

  const navigate = useNavigate()

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Books", path: "/books", icon: BookOpen },
    { name: "Book Copies", path: "/book-copies", icon: BookCopy },
    { name: "Users", path: "/users", icon: Users },
    { name: "Loans", path: "/loans", icon: Repeat },
    { name: "Reservations", path: "/reservations", icon: CalendarCheck },
    { name: "Fines", path: "/fines", icon: AlertTriangle },
  ]

  const handleLogout = () => {
    navigate("/login")
  }

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } min-h-screen bg-gray-900 text-white flex flex-col transition-all duration-300`}
    >

      {/* Logo */}
      <div className="p-6 border-b border-gray-700">

        {!collapsed && (
          <>
            <h2 className="text-lg font-semibold">
              Library Manager
            </h2>

            <p className="text-xs text-gray-400">
              Admin Portal
            </p>
          </>
        )}

      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">

        {menu.map((item) => {

          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-md text-sm transition ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >

              <Icon size={18} />

              {!collapsed && item.name}

            </NavLink>
          )
        })}

      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-sm text-gray-300 hover:text-red-400 transition"
        >

          <LogOut size={18} />

          {!collapsed && "Sign Out"}

        </button>

      </div>

    </div>
  )
}