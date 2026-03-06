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
import styles from "./Sidebar.module.css"
import { clearStoredToken } from "../../state/authState"

type Props = {
  collapsed: boolean
  mobileMenuOpen: boolean
  setMobileMenuOpen: (value: boolean) => void
}

export default function Sidebar({
  collapsed,
  mobileMenuOpen,
  setMobileMenuOpen
}: Props) {

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
    clearStoredToken()
    navigate("/login")
  }

  const handleNavClick = () => {
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setMobileMenuOpen(false)
    }
  }

  const sidebarClassName = [
    styles.sidebar,
    mobileMenuOpen ? styles.mobileOpen : "",
    collapsed ? styles.desktopCollapsed : ""
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <>
      {mobileMenuOpen && (
        <button
          className={styles.overlay}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside className={sidebarClassName}>

        {/* Logo */}
        <div className={styles.logo}>

          <h2 className={styles.logoTitle}>
            Library Manager
          </h2>

          <p className={styles.logoSubTitle}>
            Admin Portal
          </p>

        </div>

        {/* Navigation */}
        <nav className={styles.nav}>

          {menu.map((item) => {

            const Icon = item.icon

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.activeLink : ""}`
                }
              >

                <Icon size={18} />

                <span className={styles.linkText}>
                  {item.name}
                </span>

              </NavLink>
            )
          })}

        </nav>

        {/* Logout */}
        <div className={styles.logoutContainer}>

          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >

            <LogOut size={18} />

            <span className={styles.logoutText}>
              Sign Out
            </span>

          </button>

        </div>

      </aside>
    </>

  )
}
