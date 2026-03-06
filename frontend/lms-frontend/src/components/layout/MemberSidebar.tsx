import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  Repeat,
  CalendarCheck,
  AlertTriangle,
  LogOut
} from "lucide-react"
import styles from "./Sidebar.module.css"

type Props = {
  collapsed: boolean
  mobileMenuOpen: boolean
  setMobileMenuOpen: (value: boolean) => void
}

export default function MemberSidebar({
  collapsed,
  mobileMenuOpen,
  setMobileMenuOpen
}: Props) {

  const navigate = useNavigate()

  const menu = [
    { name: "Dashboard", path: "/member/dashboard", icon: LayoutDashboard },
    { name: "Browse Books", path: "/member/books", icon: BookOpen },
    { name: "My Loans", path: "/member/loans", icon: Repeat },
    { name: "My Reservations", path: "/member/reservations", icon: CalendarCheck },
    { name: "My Fines", path: "/member/fines", icon: AlertTriangle },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const handleNavClick = () => {
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setMobileMenuOpen(false)
    }
  }

  return (
    <>
      {mobileMenuOpen && (
        <button
          className={styles.overlay}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`${styles.sidebar} ${mobileMenuOpen ? styles.mobileOpen : ""} ${collapsed ? styles.desktopCollapsed : ""}`}
      >

        <div className={styles.logo}>
          <h2 className={styles.logoTitle}>Library Manager</h2>
          <p className={styles.logoSubTitle}>Member Portal</p>
        </div>

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
