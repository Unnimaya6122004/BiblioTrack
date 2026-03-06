import { useState } from "react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import AddBookCopyForm from "./components/AddBookCopyForm"
import Modal from "../../components/ui/Modal/Modal"

export default function BookCopiesPage() {

  type Copy = {
    id: number
    book: string
    barcode: string
    rackLocation: string
    status: string
  }

  const copies: Copy[] = []

  const [openModal, setOpenModal] = useState(false)

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Book", accessor: "book" },
    { header: "Barcode", accessor: "barcode" },
    { header: "Rack Location", accessor: "rackLocation" },
    { header: "Status", accessor: "status" },
    { header: "Actions", accessor: "actions" }
  ]

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-serif font-semibold">
            Book Copies
          </h1>

          <p className="text-gray-500">
            Manage physical copies
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-[#2f5aa8] text-white px-4 py-2 rounded-lg hover:bg-[#274c90] transition"
        >
          + Add Copy
        </button>

      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          placeholder="Search by barcode..."
          className="border px-4 py-2 rounded-lg w-80 outline-none"
        />
      </div>

      {/* Table */}
      <Table columns={columns} data={copies} />

      {/* Add Copy Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className="text-lg font-semibold mb-6">
            Add Book Copy
          </h2>

          <AddBookCopyForm
            onClose={() => setOpenModal(false)}
          />

        </Modal>
      )}

    </DashboardLayout>
  )
}