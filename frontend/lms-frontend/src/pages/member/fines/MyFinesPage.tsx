import { useEffect, useState } from "react"

import MemberLayout from "../../../components/layout/MemberLayout"
import Table from "../../../components/ui/Table/Table"
import Modal from "../../../components/ui/Modal/Modal"
import { getFines, payFine, type FineDto } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import { formatCurrency, formatDate } from "../../../utils/formatters"
import { getLoggedInUser } from "../../../utils/currentUser"

type FineRow = {
  id: number
  loanId: number
  amount: string
  issued: string
  paid: string
  status: string
}

export default function MyFinesPage() {

  const [openModal, setOpenModal] = useState(false)
  const [selectedFine, setSelectedFine] = useState<FineRow | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [fines, setFines] = useState<FineRow[]>([])
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")

  const loadMyFines = async (knownUserId?: number) => {
    try {
      setLoading(true)
      setError("")

      let userId = knownUserId

      if (!userId) {
        const user = await getLoggedInUser()

        if (!user) {
          setFines([])
          setError("Unable to resolve logged in user")
          return
        }

        userId = user.id
        setCurrentUserId(user.id)
      }

      const response = await getFines()
      const myFines = response.content.filter((fine: FineDto) => fine.userId === userId)

      setFines(
        myFines.map((fine) => ({
          id: fine.id,
          loanId: fine.loanId,
          amount: formatCurrency(fine.amount),
          issued: formatDate(fine.issuedDate),
          paid: formatDate(fine.paidDate),
          status: fine.status
        }))
      )
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to load your fines"))
      setFines([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMyFines()
  }, [])

  const handlePayFine = async () => {
    if (!selectedFine) {
      return
    }

    try {
      setPaying(true)
      await payFine(selectedFine.id)
      await loadMyFines(currentUserId ?? undefined)
      setOpenModal(false)
      setSelectedFine(null)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to pay fine"))
    } finally {
      setPaying(false)
    }
  }

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
        const fine = row as FineRow

        if (fine.status !== "UNPAID") {
          return <span className="text-sm text-gray-400">No action</span>
        }

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
        <h1 className="text-2xl font-semibold">
          My Fines
        </h1>

        <p className="text-gray-500">
          View your overdue fines
        </p>
      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading your fines...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

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
              Confirm payment for this fine.
            </p>

            <p className="text-lg font-semibold mb-6">
              Amount: {selectedFine.amount}
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setOpenModal(false)}
                disabled={paying}
                className="border px-4 py-2 rounded-lg"
              >
                Close
              </button>

              <button
                onClick={() => void handlePayFine()}
                disabled={paying}
                className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-70"
              >
                {paying ? "Paying..." : "Confirm Pay"}
              </button>
            </div>

          </div>

        </Modal>
      )}

    </MemberLayout>
  )
}
