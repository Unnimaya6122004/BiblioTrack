import { useState } from "react"

import MemberLayout from "../../../components/layout/MemberLayout"
import Table from "../../../components/ui/Table/Table"
import Modal from "../../../components/ui/Modal/Modal"

type Fine = {
  id: number
  loanId: number
  amount: string
  issued: string
  paid: string
  status: string
}

export default function MyFinesPage() {

  const [openModal, setOpenModal] = useState(false)
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null)

  const fines: Fine[] = []

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Loan ID", accessor: "loanId" },
    { header: "Amount", accessor: "amount" },
    { header: "Issued", accessor: "issued" },
    { header: "Paid", accessor: "paid" },
    { header: "Status", accessor: "status" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: unknown) => {
        const fine = row as Fine

        return (
          <button
            onClick={() => {
              setSelectedFine(fine)
              setOpenModal(true)
            }}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Pay Fine
          </button>
        )
      }
    }
  ]

  return (
    <MemberLayout>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold">
          My Fines
        </h1>

        <p className="text-gray-500">
          View your overdue fines
        </p>
      </div>

      {/* Table */}
      <Table columns={columns} data={fines} />

      {/* Payment Modal */}
      {openModal && selectedFine && (
        <Modal onClose={() => setOpenModal(false)}>

          <div className="text-center">

            <h2 className="text-xl font-semibold mb-4">
              Pay Fine
            </h2>

            <p className="text-gray-500 mb-6">
              Scan the QR code to complete payment
            </p>

            {/* QR Code Placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                QR CODE
              </div>
            </div>

            <p className="text-lg font-semibold mb-6">
              Amount: ₹{selectedFine.amount}
            </p>

            <button
              onClick={() => setOpenModal(false)}
              className="border px-4 py-2 rounded-lg"
            >
              Close
            </button>

          </div>

        </Modal>
      )}

    </MemberLayout>
  )
}