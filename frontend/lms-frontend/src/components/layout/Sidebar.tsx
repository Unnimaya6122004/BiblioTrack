import {
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent
} from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  BookCopy,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Repeat,
  CalendarCheck,
  AlertTriangle,
  Bell,
  LogOut
} from "lucide-react"
import styles from "./Sidebar.module.css"
import { clearStoredToken } from "../../state/authState"
import { API_BASE_URL } from "../../utils/api"

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)"
const MIN_SIDEBAR_WIDTH = 220
const MAX_SIDEBAR_WIDTH = 420
const COLLAPSED_SIDEBAR_WIDTH = 72

const clampSidebarWidth = (value: number) =>
  Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, value))

type Props = {
  sidebarWidth: number
  setSidebarWidth: (value: number) => void
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (value: boolean) => void
}

export default function Sidebar({
  sidebarWidth,
  setSidebarWidth,
  collapsed,
  setCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen
}: Props) {

  const navigate = useNavigate()
  const [isResizing, setIsResizing] = useState(false)

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Books", path: "/books", icon: BookOpen },
    { name: "Book Copies", path: "/book-copies", icon: BookCopy },
    { name: "Users", path: "/users", icon: Users },
    { name: "Loans", path: "/loans", icon: Repeat },
    { name: "Reservations", path: "/reservations", icon: CalendarCheck },
    { name: "Fines", path: "/fines", icon: AlertTriangle },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ]

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include"
      })
    } catch {
      // continue with local cleanup
    }

    clearStoredToken()
    navigate("/login")
  }

  const handleNavClick = () => {
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setMobileMenuOpen(false)
    }
  }

  useEffect(() => {
    if (!isResizing || collapsed) {
      return
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (!window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
        return
      }

      setSidebarWidth(clampSidebarWidth(event.clientX))
    }

    const handlePointerUp = () => {
      setIsResizing(false)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [collapsed, isResizing, setSidebarWidth])

  const handleResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
      return
    }

    if (collapsed) {
      return
    }

    setIsResizing(true)
  }

  const handleCollapseToggle = () => {
    if (!window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
      return
    }

    setCollapsed(!collapsed)
  }

  const sidebarClassName = [
    styles.sidebar,
    mobileMenuOpen ? styles.mobileOpen : "",
    collapsed ? styles.desktopCollapsed : ""
  ]
    .filter(Boolean)
    .join(" ")

  const activeWidth = collapsed
    ? COLLAPSED_SIDEBAR_WIDTH
    : clampSidebarWidth(sidebarWidth)

  const sidebarStyle = {
    "--sidebar-width": `${activeWidth}px`
  } as CSSProperties

  return (
    <>
      {mobileMenuOpen && (
        <button
          className={styles.overlay}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside className={sidebarClassName} style={sidebarStyle}>

        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoHeader}>
            <div className={styles.logoTextGroup}>
              <h2 className={styles.logoTitle}>
                Library Manager
              </h2>

              <p className={styles.logoSubTitle}>
                Admin Portal
              </p>
            </div>

            <button
              type="button"
              className={styles.collapseButton}
              onClick={handleCollapseToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

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

        <button
          type="button"
          className={styles.resizeHandle}
          onPointerDown={handleResizeStart}
          aria-label="Resize sidebar"
        />

      </aside>
    </>

  )
}
