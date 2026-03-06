import { useState } from "react"

import MemberLayout from "../../../components/layout/MemberLayout"
import Table from "../../../components/ui/Table/Table"
import Modal from "../../../components/ui/Modal/Modal"

import AddReservationForm from "../../reservations/components/AddReservationForm"

type Reservation = {
  id: number
  book: string
  date: string
  status: string
}

export default function MyReservationsPage() {

  const [openModal, setOpenModal] = useState(false)

  const reservations: Reservation[] = []

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Book", accessor: "book" },
    { header: "Reservation Date", accessor: "date" },
    { header: "Status", accessor: "status" },
  ]

  return (
    <MemberLayout>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-serif font-semibold">
            My Reservations
          </h1>

          <p className="text-gray-500">
            View books you have reserved
          </p>
        </div>

        {/* New Reservation Button */}
        <button
          onClick={() => setOpenModal(true)}
          className="bg-[#2f5aa8] text-white px-4 py-2 rounded-lg hover:bg-[#274c90]"
        >
          + New Reservation
        </button>

      </div>

      {/* Table */}
      <Table columns={columns} data={reservations} />

      {/* Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className="text-lg font-semibold mb-6">
            New Reservation
          </h2>

          <AddReservationForm
            onClose={() => setOpenModal(false)}
          />

        </Modal>
      )}

    </MemberLayout>
  )
}