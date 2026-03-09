import { useEffect, useState } from "react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import ConfirmModal from "../../components/ui/Modal/ConfirmModal"
import { getFines, payFine, type FineDto } from "../../api/lmsApi"
import { toErrorMessage } from "../../api/client"
import { formatCurrency, formatDate } from "../../utils/formatters"

type FineRow = {
  id: number
  user: string
  loanId: number
  amount: string
  issued: string
  paid: string
  status: string
}

export default function FinesPage() {

  const [fines, setFines] = useState<FineRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [payId, setPayId] = useState<number | null>(null)

  const loadFines = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await getFines()
      const mappedFines = response.content.map((fine: FineDto) => ({
        id: fine.id,
        user: fine.userName,
        loanId: fine.loanId,
        amount: formatCurrency(fine.amount),
        issued: formatDate(fine.issuedDate),
        paid: formatDate(fine.paidDate),
        status: fine.status
      }))

      setFines(mappedFines)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to load fines"))
      setFines([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFines()
  }, [])

  const handlePay = async (id: number) => {
    try {
      await payFine(id)
      await loadFines()
      setPayId(null)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to mark fine as paid"))
    }
  }

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
      render: (row: unknown) => {
        const fine = row as FineRow

        if (fine.status !== "UNPAID") {
          return <span className="text-sm text-gray-400">No action</span>
        }

        return (
          <button
            type="button"
            onClick={() => setPayId(fine.id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Mark Paid
          </button>
        )
      }
    }
  ]

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-2xl font-semibold">
          Fines
        </h1>

        <p className="text-gray-500">
          Manage overdue fines
        </p>

      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading fines...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* Table */}
      <Table columns={columns} data={fines} />

      {payId !== null && (
        <ConfirmModal
          title="Mark Fine as Paid"
          message="Are you sure you want to mark this fine as paid?"
          confirmText="Mark Paid"
          cancelText="Cancel"
          onCancel={() => setPayId(null)}
          onConfirm={() => {
            void handlePay(payId)
          }}
        />
      )}

    </DashboardLayout>
  )
}
