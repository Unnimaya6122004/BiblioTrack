import { useEffect, useState } from "react"
import { Layers3, Pencil, Plus, Search, Trash2 } from "lucide-react"

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
import pageStyles from "../../styles/adminPage.module.css"

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
  }, [debouncedSearch, page]) // eslint-disable-line react-hooks/exhaustive-deps

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
          return <span className="text-xs text-slate-400">No action</span>
        }

        return (
          <div className="flex gap-2">
            {currentAdminUserId !== null && user.id === currentAdminUserId ? (
              <span className="text-xs text-slate-400">Current admin</span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDeleteError("")
                  setDeleteId(user.id)
                }}
                className={`${pageStyles.iconButton} ${pageStyles.dangerIconButton}`}
                aria-label={`Delete user ${user.fullName}`}
              >
                <Trash2 size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={() => openEditModal(user)}
              className={pageStyles.iconButton}
              aria-label={`Edit user ${user.fullName}`}
            >
              <Pencil size={14} />
            </button>
          </div>
        )
      }
    }
  ]

  const activeCount = users.filter((user) => user.status === "ACTIVE").length
  const blockedCount = users.filter((user) => user.status === "BLOCKED").length

  return (
    <DashboardLayout>
      <div className={pageStyles.page}>

        <section className={pageStyles.hero}>
          <div className={pageStyles.heroContent}>
            <p className={pageStyles.heroEyebrow}>Member Administration</p>
            <h1 className={pageStyles.heroTitle}>Users</h1>
            <p className={pageStyles.heroSubtitle}>
              Manage member access, profile records, and user lifecycle status.
            </p>
          </div>

          {isAdmin && (
            <div className={pageStyles.heroActions}>
              <button
                onClick={openCreateModal}
                className={pageStyles.primaryButton}
              >
                <Plus size={16} />
                Add User
              </button>
            </div>
          )}
        </section>

        <section className={pageStyles.controlsCard}>
          <div className={pageStyles.controlsTopRow}>
            <div className={pageStyles.searchWrap}>
              <Search size={16} className={pageStyles.searchIcon} />
              <input
                placeholder="Search by name..."
                value={search}
                onChange={(event) => {
                  setPage(0)
                  setSearch(event.target.value)
                }}
                className={pageStyles.searchInput}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={pageStyles.metaChip}>
                <Layers3 size={13} />
                Showing {users.length}
              </span>
              <span className={pageStyles.metaChip}>Active {activeCount}</span>
              <span className={pageStyles.metaChip}>Blocked {blockedCount}</span>
            </div>
          </div>
        </section>

        {loading && (
          <p className={pageStyles.infoText}>Loading users...</p>
        )}

        {error && (
          <p className={pageStyles.errorText}>{error}</p>
        )}

        <div className={pageStyles.tableSurface}>
          <Table columns={columns} data={users} />
        </div>

        <div className={pageStyles.pagination}>
          <button
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
            className={pageStyles.pageNavButton}
          >
            Previous
          </button>

          <div className={pageStyles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setPage(index)}
                className={`${pageStyles.pageNumber} ${page === index ? pageStyles.pageNumberActive : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={totalPages === 0 || page >= totalPages - 1}
            className={pageStyles.pageNavButton}
          >
            Next
          </button>
        </div>

        {openModal && (
          <Modal
            onClose={() => {
              setOpenModal(false)
              setEditingUser(null)
            }}
          >
            <h2 className={pageStyles.modalTitle}>
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
      </div>
    </DashboardLayout>
  )
}
