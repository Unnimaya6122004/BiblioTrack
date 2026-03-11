import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import Modal from "../../components/ui/Modal/Modal"
import ConfirmModal from "../../components/ui/Modal/ConfirmModal"

import AddUserForm from "./components/AddUserForm"
import {
  deleteUser,
  getFines,
  getUnpaidFineTotal,
  getUsers,
  mapRoleForUi,
  type UserDto
} from "../../api/lmsApi"
import { toErrorMessage } from "../../utils/api"
import useDebouncedValue from "../../hooks/useDebouncedValue"
import {
  decodeToken,
  extractUserIdFromPayload,
  extractRoleFromPayload,
  getStoredRole,
  getStoredUserId,
  getStoredToken
} from "../../state/authState"

type UserRow = {
  id: number
  fullName: string
  email: string
  role: "ADMIN" | "MEMBER"
  phone: string
  status: "ACTIVE" | "INACTIVE" | "BLOCKED"
}

export default function UsersPage() {
  const PAGE_SIZE = 10

  const [openModal, setOpenModal] = useState(false)
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const debouncedSearch = useDebouncedValue(search)

  const token = getStoredToken()
  const payload = token ? decodeToken(token) : null
  const role = getStoredRole() ?? extractRoleFromPayload(payload)
  const currentAdminUserId = getStoredUserId() ?? extractUserIdFromPayload(payload)
  const isAdmin = role === "ADMIN"

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError("")

      const normalizedSearch = debouncedSearch.trim().toLowerCase()

      if (normalizedSearch) {
        const response = await getUsers({
          page: 0,
          size: 200
        })

        const filteredUsers = response.content
          .map((user: UserDto) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: mapRoleForUi(user.role),
            phone: user.phone ?? "-",
            status: (user.status ?? "ACTIVE") as "ACTIVE" | "INACTIVE" | "BLOCKED"
          }))
          .sort((a, b) => a.id - b.id)
          .filter((user) => user.fullName.toLowerCase().includes(normalizedSearch))

        const start = page * PAGE_SIZE
        const end = start + PAGE_SIZE

        setUsers(filteredUsers.slice(start, end))
        setTotalPages(Math.ceil(filteredUsers.length / PAGE_SIZE))
        return
      }

      const response = await getUsers({
        page,
        size: PAGE_SIZE
      })
      const mappedUsers = response.content
        .map((user: UserDto) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: mapRoleForUi(user.role),
          phone: user.phone ?? "-",
          status: (user.status ?? "ACTIVE") as "ACTIVE" | "INACTIVE" | "BLOCKED"
        }))
        .sort((a, b) => a.id - b.id)

      setUsers(mappedUsers)
      setTotalPages(response.totalPages)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to load users"))
      setUsers([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [debouncedSearch, page])

  const userHasAnyFine = async (userId: number): Promise<boolean> => {
    let pageIndex = 0

    while (true) {
      const response = await getFines({ page: pageIndex, size: 200 })

      if (response.content.some((fine) => fine.userId === userId)) {
        return true
      }

      if (response.last) {
        return false
      }

      pageIndex += 1
    }
  }

  const handleDelete = async (id: number) => {
    if (!isAdmin) {
      return
    }

    if (currentAdminUserId !== null && id === currentAdminUserId) {
      setDeleteError("You cannot delete your own admin account.")
      return
    }

    try {
      const [unpaidFineTotalRaw, hasAnyFine] = await Promise.all([
        getUnpaidFineTotal(id),
        userHasAnyFine(id)
      ])
      const unpaidFineTotal = Number(unpaidFineTotalRaw)

      if (!Number.isFinite(unpaidFineTotal)) {
        setDeleteError("Unable to verify fines for this user.")
        return
      }

      if (hasAnyFine || unpaidFineTotal > 0) {
        setDeleteError("Cannot delete user with fines.")
        return
      }

      await deleteUser(id)
      await loadUsers()
      setDeleteError("")
      setDeleteId(null)
    } catch (requestError) {
      setDeleteError(toErrorMessage(requestError, "Failed to delete user"))
    }
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setOpenModal(true)
  }

  const openEditModal = (user: UserRow) => {
    if (!isAdmin) {
      return
    }

    setEditingUser(user)
    setOpenModal(true)
  }

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "fullName" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
    { header: "Phone", accessor: "phone" },
    { header: "Status", accessor: "status" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: unknown) => {
        const user = row as UserRow

        if (!isAdmin) {
          return <span className="text-sm text-gray-400">No action</span>
        }

        return (
          <div className="flex gap-3">
            {currentAdminUserId !== null && user.id === currentAdminUserId ? (
              <span className="text-sm text-gray-400">Current admin</span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDeleteError("")
                  setDeleteId(user.id)
                }}
                className="text-red-500 hover:text-red-700"
                aria-label={`Delete user ${user.fullName}`}
              >
                <Trash2 size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={() => openEditModal(user)}
              className="text-blue-600 hover:text-blue-800"
              aria-label={`Edit user ${user.fullName}`}
            >
              <Pencil size={18} />
            </button>
          </div>
        )
      }
    }
  ]

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-semibold">
            Users
          </h1>

          <p className="text-gray-500">
            Manage library users
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="bg-[#0f1f3d] text-white px-4 py-2 rounded-lg hover:bg-[#162a52] transition"
          >
            + Add User
          </button>
        )}

      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setPage(0)
            setSearch(e.target.value)
          }}
          className="border px-4 py-2 rounded-lg w-80 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading users...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* Table */}
      <Table columns={columns} data={users} />

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0}
          className="border px-3 py-2 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setPage(index)}
              className={`px-3 py-1 rounded-lg border ${
                page === index ? "bg-[#0f1f3d] text-white" : "bg-white"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={totalPages === 0 || page >= totalPages - 1}
          className="border px-3 py-2 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Add/Edit User Modal */}
      {openModal && (
        <Modal
          onClose={() => {
            setOpenModal(false)
            setEditingUser(null)
          }}
        >

          <h2 className="text-lg font-semibold mb-6">
            {editingUser ? "Edit User" : "Add New User"}
          </h2>

          <AddUserForm
            editingUser={editingUser}
            onClose={() => {
              setOpenModal(false)
              setEditingUser(null)
            }}
            onCreated={loadUsers}
          />

        </Modal>
      )}

      {deleteId !== null && (
        <ConfirmModal
          title="Delete User"
          message="Are you sure you want to delete this user?"
          errorMessage={deleteError}
          confirmText="Delete"
          cancelText="Cancel"
          onCancel={() => {
            setDeleteError("")
            setDeleteId(null)
          }}
          onConfirm={() => {
            void handleDelete(deleteId)
          }}
        />
      )}

    </DashboardLayout>
  )
}
