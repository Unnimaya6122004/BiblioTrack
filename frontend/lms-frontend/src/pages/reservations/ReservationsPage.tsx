import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import Modal from "../../components/ui/Modal/Modal"

import AddReservationForm from "./components/AddReservationForm"

type Reservation = {
  id: number
  user: string
  book: string
  date: string
  status: string
}

export default function ReservationsPage() {

  const [openModal, setOpenModal] = useState(false)

  const reservations: Reservation[] = []

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "User", accessor: "user" },
    { header: "Book", accessor: "book" },
    { header: "Date", accessor: "date" },
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
            Reservations
          </h1>

          <p className="text-gray-500">
            Manage book reservations
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-[#2f5aa8] text-white px-4 py-2 rounded-lg hover:bg-[#274c90]"
        >
          + New Reservation
        </button>

      </div>

      {/* Table */}
      <Table columns={columns} data={reservations} />

      {/* Create Reservation Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className="text-lg font-semibold mb-6">
            Create Reservation
          </h2>

          <AddReservationForm
            onClose={() => setOpenModal(false)}
          />

        </Modal>
      )}

    </DashboardLayout>
  )
}