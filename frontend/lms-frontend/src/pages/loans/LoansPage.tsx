import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import Modal from "../../components/ui/Modal/Modal"

import IssueLoanForm from "./components/IssueLoanForm"

type Loan = {
  id: number
  user: string
  book: string
  barcode: string
  issued: string
  due: string
  returned: string
  status: string
}

export default function LoansPage() {

  const [openModal, setOpenModal] = useState(false)
  const [filter, setFilter] = useState("ALL")

  const loans: Loan[] = []

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "User", accessor: "user" },
    { header: "Book", accessor: "book" },
    { header: "Barcode", accessor: "barcode" },
    { header: "Issued", accessor: "issued" },
    { header: "Due", accessor: "due" },
    { header: "Returned", accessor: "returned" },
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
            Loans
          </h1>

          <p className="text-gray-500">
            Manage book loans
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-[#2f5aa8] text-white px-4 py-2 rounded-lg hover:bg-[#274c90]"
        >
          + Issue Book
        </button>

      </div>

      {/* Status Filters */}
      <div className="flex gap-3 mb-6">

        {["ALL", "ACTIVE", "RETURNED", "OVERDUE"].map((item) => (

          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-2 rounded-lg text-sm border
              ${filter === item
                ? "bg-[#2f5aa8] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
          >
            {item}
          </button>

        ))}

      </div>

      {/* Table */}
      <Table columns={columns} data={loans} />

      {/* Issue Loan Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className="text-lg font-semibold mb-6">
            Issue Book
          </h2>

          <IssueLoanForm
            onClose={() => setOpenModal(false)}
          />

        </Modal>
      )}

    </DashboardLayout>
  )
}