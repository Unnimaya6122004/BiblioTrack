import { Menu, User } from "lucide-react"
import { useState } from "react"
import Modal from "../ui/Modal/Modal"
import styles from "./DashboardNavbar.module.css"
import responsive from "../../styles/responsive.module.css"
import {
  decodeToken,
  extractEmailFromPayload,
  extractRoleFromPayload,
  getStoredToken
} from "../../state/authState"

type Props = {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (value: boolean) => void
}

export default function MemberNavbar({
  collapsed,
  setCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen
}: Props) {

  const [openModal, setOpenModal] = useState(false)
  const token = getStoredToken()
  const payload = token ? decodeToken(token) : null
  const email = extractEmailFromPayload(payload)
  const role = extractRoleFromPayload(payload) ?? "MEMBER"

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
              Welcome, Member
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
