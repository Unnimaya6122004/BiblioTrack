import { Menu, User } from "lucide-react"
import { useState } from "react"
import Modal from "../ui/Modal/Modal"

type Props = {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
}

export default function AdminNavbar({ collapsed, setCollapsed }: Props) {

  const [openModal, setOpenModal] = useState(false)

  const token = localStorage.getItem("token")

  let email = ""
  let role = ""

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]))
    email = payload.sub || payload.email
    role = payload.role || payload.authorities?.[0] || "ADMIN"
  }

  return (
    <>
      <div className="h-16 bg-white border-b flex items-center justify-between px-6">

        <div className="flex items-center gap-4">

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Menu size={20} />
          </button>

          <h1 className="font-semibold text-lg">
            Dashboard
          </h1>

        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          <span className="text-sm text-gray-600">
            Welcome, Admin
          </span>

          <button
            onClick={() => setOpenModal(true)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <User size={20} />
          </button>

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