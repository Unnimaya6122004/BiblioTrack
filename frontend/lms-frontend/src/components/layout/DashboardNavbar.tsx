import { Menu, User } from "lucide-react"
import { useState } from "react"
import { jwtDecode } from "jwt-decode"
import Modal from "../ui/Modal/Modal"
import styles from "./DashboardNavbar.module.css"
import responsive from "../../styles/responsive.module.css"

type Props = {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (value: boolean) => void
}

interface JwtPayload {
  sub?: string
  email?: string
  role?: string
  authorities?: unknown
}

function getRoleFromToken(payload: JwtPayload): string {
  const authority = Array.isArray(payload.authorities) ? payload.authorities[0] : ""
  const rawRole = payload.role || String(authority || "")
  const normalized = rawRole.replace(/^ROLE_/, "").toUpperCase()

  if (normalized === "USER") {
    return "MEMBER"
  }

  return normalized || "ADMIN"
}

export default function AdminNavbar({
  collapsed,
  setCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen
}: Props) {

  const [openModal, setOpenModal] = useState(false)

  const token = localStorage.getItem("token")

  let email = ""
  let role = ""

  if (token) {
    try {
      const payload = jwtDecode<JwtPayload>(token)
      email = payload.sub || payload.email || ""
      role = getRoleFromToken(payload)
    } catch {
      email = ""
      role = "ADMIN"
    }
  }

  const handleMenuClick = () => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches
    if (isDesktop) {
      setCollapsed(!collapsed)
      return
    }
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      <div className={styles.navbar}>
        <div className={`${styles.inner} ${responsive.container}`}>

          <div className={styles.leftSection}>

            <button
              onClick={handleMenuClick}
              className={styles.menuButton}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>

            <h1 className={styles.title}>
              Dashboard
            </h1>

          </div>

          {/* Right Side */}
          <div className={styles.rightSection}>

            <span className={styles.welcomeText}>
              Welcome, Admin
            </span>

            <button
              onClick={() => setOpenModal(true)}
              className={styles.profileButton}
            >
              <User size={20} />
            </button>

          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className="text-lg font-semibold mb-6">
            Profile
          </h2>

          <div className="space-y-3 text-sm">

            <div>
              <span className="text-gray-500">Email:</span>
              <p className="font-medium">{email}</p>
            </div>

            <div>
              <span className="text-gray-500">Role:</span>
              <p className="font-medium">{role}</p>
            </div>

          </div>

        </Modal>
      )}

    </>
  )
}
