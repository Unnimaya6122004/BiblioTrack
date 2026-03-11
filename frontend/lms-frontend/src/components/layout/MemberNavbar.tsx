import { Bell, CalendarDays, Mail, Menu, Phone, Shield, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Modal from "../ui/Modal/Modal"
import styles from "./DashboardNavbar.module.css"
import {
  findUserByEmail,
  getUnreadNotificationCount,
  getUserById,
  mapRoleForUi,
  type UserDto
} from "../../api/lmsApi"
import { toErrorMessage } from "../../utils/api"
import {
  decodeToken,
  extractEmailFromPayload,
  extractRoleFromPayload,
  getStoredEmail,
  getStoredRole,
  getStoredUserId,
  getStoredToken,
  setStoredUserId
} from "../../state/authState"
import { subscribeNotificationsUpdated } from "../../state/notificationsState"

type Props = {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (value: boolean) => void
}

export default function MemberNavbar({
  mobileMenuOpen,
  setMobileMenuOpen
}: Props) {

  const [openModal, setOpenModal] = useState(false)
  const [profile, setProfile] = useState<UserDto | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const token = getStoredToken()
  const payload = token ? decodeToken(token) : null
  const email = getStoredEmail() || extractEmailFromPayload(payload)
  const role = getStoredRole() ?? extractRoleFromPayload(payload) ?? "MEMBER"
  const storedUserId = getStoredUserId()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const loadProfile = async () => {
      if (!openModal) {
        return
      }

      try {
        setProfileLoading(true)
        setProfileError("")
        let userId = storedUserId

        if (!userId) {
          const userByEmail = await findUserByEmail(email)
          if (!userByEmail) {
            setProfile(null)
            setProfileError("Unable to find user id")
            return
          }

          userId = userByEmail.id
          setStoredUserId(userId)
        }

        const user = await getUserById(userId)
        setProfile(user)
      } catch (requestError) {
        setProfile(null)
        setProfileError(toErrorMessage(requestError, "Failed to load profile"))
      } finally {
        setProfileLoading(false)
      }
    }

    void loadProfile()
  }, [email, openModal, storedUserId])
  useEffect(() => {

  const loadNavbarProfile = async () => {
    try {

      let userId = storedUserId

      if (!userId) {
        const userByEmail = await findUserByEmail(email)

        if (!userByEmail) {
          return
        }

        userId = userByEmail.id
        setStoredUserId(userId)
      }

      const user = await getUserById(userId)
      setProfile(user)

    } catch {
      // silent fail
    }

  }

  void loadNavbarProfile()

}, [email, storedUserId])

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount()
        setUnreadCount(count)
      } catch {
        setUnreadCount(0)
      }
    }

    void loadUnreadCount()

    const unsubscribe = subscribeNotificationsUpdated(() => {
      void loadUnreadCount()
    })

    return unsubscribe
  }, [location.pathname])

  const roleLabel = profile?.role ? mapRoleForUi(profile.role) : role
  const createdAtLabel = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : "-"
  const statusLabel = profile?.status ?? "-"
  const initials = (profile?.fullName ?? "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  const statusClassName = statusLabel === "ACTIVE"
    ? styles.statusActive
    : statusLabel === "INACTIVE"
      ? styles.statusInactive
      : statusLabel === "BLOCKED"
        ? styles.statusBlocked
        : styles.statusUnknown

  const handleMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      <div className={styles.navbar}>
        <div className={styles.inner}>

          <div className={styles.leftSection}>

            <button
              onClick={handleMenuClick}
              className={styles.menuButton}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>

          </div>

          {/* Right Side */}
          <div className={styles.rightSection}>

            <div className={styles.iconActions}>
              <button
                onClick={() => navigate("/member/notifications")}
                className={styles.notificationButton}
                aria-label="Open notifications"
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setOpenModal(true)}
                className={styles.profileButton}
                aria-label="Open profile"
              >
                <User size={20} />
              </button>
            </div>

            <span className={styles.welcomeText}>
              Welcome, {profile?.fullName ?? "Member"}
            </span>

          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className={styles.profileModalTitle}>
            Profile
          </h2>

          {profileLoading ? (
            <p className="text-sm text-gray-500">Loading profile...</p>
          ) : profileError ? (
            <p className="text-sm text-red-600">{profileError}</p>
          ) : (
            <div className={styles.profileCard}>
              <div className={styles.profileHero}>
                <div className={styles.profileAvatar}>
                  {initials || "U"}
                </div>

                <div className={styles.profileHeroText}>
                  <p className={styles.profileName}>
                    {profile?.fullName ?? "User"}
                  </p>
                  <p className={styles.profileEmail}>
                    {(profile?.email ?? email) || "-"}
                  </p>
                </div>

                <span className={styles.roleBadge}>
                  <Shield size={14} />
                  {roleLabel}
                </span>
              </div>

              <div className={styles.profileGrid}>
                <div className={styles.infoTile}>
                  <span className={styles.infoLabel}>Email</span>
                  <div className={styles.infoValueRow}>
                    <Mail size={14} />
                    <p className={styles.infoValue}>
                      {(profile?.email ?? email) || "-"}
                    </p>
                  </div>
                </div>

                <div className={styles.infoTile}>
                  <span className={styles.infoLabel}>Phone</span>
                  <div className={styles.infoValueRow}>
                    <Phone size={14} />
                    <p className={styles.infoValue}>{profile?.phone ?? "-"}</p>
                  </div>
                </div>

                <div className={styles.infoTile}>
                  <span className={styles.infoLabel}>Status</span>
                  <div className={styles.infoValueRow}>
                    <span className={`${styles.statusBadge} ${statusClassName}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className={styles.infoTile}>
                  <span className={styles.infoLabel}>Created At</span>
                  <div className={styles.infoValueRow}>
                    <CalendarDays size={14} />
                    <p className={styles.infoValue}>{createdAtLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </Modal>
      )}

    </>
  )
}
