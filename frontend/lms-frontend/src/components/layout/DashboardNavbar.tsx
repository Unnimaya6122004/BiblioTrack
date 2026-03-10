import { Menu, User } from "lucide-react"
import { useEffect, useState } from "react"
import Modal from "../ui/Modal/Modal"
import styles from "./DashboardNavbar.module.css"
import responsive from "../../styles/responsive.module.css"
import {
  findUserByEmail,
  getUserById,
  mapRoleForUi,
  type UserDto
} from "../../api/lmsApi"
import { toErrorMessage } from "../../utils/api"
import {
  decodeToken,
  extractEmailFromPayload,
  extractRoleFromPayload,
  getStoredUserId,
  getStoredToken,
  setStoredUserId
} from "../../state/authState"

type Props = {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (value: boolean) => void
}

export default function AdminNavbar({
  mobileMenuOpen,
  setMobileMenuOpen
}: Props) {

  const [openModal, setOpenModal] = useState(false)
  const [profile, setProfile] = useState<UserDto | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const token = getStoredToken()
  const payload = token ? decodeToken(token) : null
  const email = extractEmailFromPayload(payload)
  const role = extractRoleFromPayload(payload) ?? "ADMIN"
  const storedUserId = getStoredUserId()

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
  

  const roleLabel = profile?.role ? mapRoleForUi(profile.role) : role
  const createdAtLabel = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : "-"

  const handleMenuClick = () => {
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

          </div>

          {/* Right Side */}
          <div className={styles.rightSection}>

            <span className={styles.welcomeText}>
  Welcome, {profile?.fullName ?? "Admin"}
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

          {profileLoading ? (
            <p className="text-sm text-gray-500">Loading profile...</p>
          ) : profileError ? (
            <p className="text-sm text-red-600">{profileError}</p>
          ) : (
            <div className="space-y-3 text-sm">

              <div>
                <span className="text-gray-500">Full Name:</span>
                <p className="font-medium">{profile?.fullName ?? "-"}</p>
              </div>

              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{profile?.email ?? email}</p>
              </div>

              <div>
                <span className="text-gray-500">Role:</span>
                <p className="font-medium">{roleLabel}</p>
              </div>

              <div>
                <span className="text-gray-500">Phone:</span>
                <p className="font-medium">{profile?.phone ?? "-"}</p>
              </div>

              <div>
                <span className="text-gray-500">Status:</span>
                <p className="font-medium">{profile?.status ?? "-"}</p>
              </div>

              <div>
                <span className="text-gray-500">Created At:</span>
                <p className="font-medium">{createdAtLabel}</p>
              </div>

            </div>
          )}

        </Modal>
      )}

    </>
  )
}
