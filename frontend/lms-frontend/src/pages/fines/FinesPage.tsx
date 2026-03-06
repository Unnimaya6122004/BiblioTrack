import { Pencil, Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"

type Fine = {
  id: number
  user: string
  loanId: number
  amount: string
  issued: string
  paid: string
  status: string
}

export default function FinesPage() {

  const fines: Fine[] = []

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "User", accessor: "user" },
    { header: "Loan ID", accessor: "loanId" },
    { header: "Amount", accessor: "amount" },
    { header: "Issued", accessor: "issued" },
    { header: "Paid", accessor: "paid" },
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
      <div className="mb-8">

        <h1 className="text-2xl font-serif font-semibold">
          Fines
        </h1>

        <p className="text-gray-500">
          Manage overdue fines
        </p>

      </div>

      {/* Table */}
      <Table columns={columns} data={fines} />

    </DashboardLayout>
  )
}