import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import Modal from "../../components/ui/Modal/Modal"

import AddUserForm from "./components/AddUserForm"

type User = {
  id: number
  name: string
  email: string
  role: string
  phone: string
  status: string
}

export default function UsersPage() {

  const [openModal, setOpenModal] = useState(false)

  const users: User[] = []

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
    { header: "Phone", accessor: "phone" },
    { header: "Status", accessor: "status" },
    {
      header: "Actions",
      accessor: "actions",
      render: () => (
        <div className="flex gap-3">
          <button className="text-blue-600 hover:text-blue-800">
            <Pencil size={18} />
          </button>

          <button className="text-red-500 hover:text-red-700">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-serif font-semibold">
            Users
          </h1>

          <p className="text-gray-500">
            Manage library users
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-[#2f5aa8] text-white px-4 py-2 rounded-lg hover:bg-[#274c90] transition"
        >
          + Add User
        </button>

      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          placeholder="Search by name..."
          className="border px-4 py-2 rounded-lg w-80 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <Table columns={columns} data={users} />

      {/* Add User Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className="text-lg font-semibold mb-6">
            Add New User
          </h2>

          <AddUserForm
            onClose={() => setOpenModal(false)}
          />

        </Modal>
      )}

    </DashboardLayout>
  )
}