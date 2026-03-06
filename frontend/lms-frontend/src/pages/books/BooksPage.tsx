import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import Modal from "../../components/ui/Modal/Modal"

import AddBookForm from "./components/AddBookForm"

type Book = {
  id: number
  title: string
  isbn: string
  createdAt: string
}

export default function BooksPage() {

  const [openModal, setOpenModal] = useState(false)

  const books: Book[] = []

  const columns = [
    { header: "ID", accessor: "id" },

    { header: "Title", accessor: "title" },

    { header: "ISBN", accessor: "isbn" },

    { header: "Created", accessor: "createdAt" },

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
            Books
          </h1>

          <p className="text-gray-500">
            Manage library books
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-[#2f5aa8] text-white px-4 py-2 rounded-lg hover:bg-[#274c90] transition"
        >
          + Add Book
        </button>

      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          placeholder="Search by title..."
          className="border px-4 py-2 rounded-lg w-80 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <Table columns={columns} data={books} />

      {/* Add Book Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className="text-lg font-semibold mb-6">
            Add New Book
          </h2>

          <AddBookForm
            onClose={() => setOpenModal(false)}
          />

        </Modal>
      )}

    </DashboardLayout>
  )
}