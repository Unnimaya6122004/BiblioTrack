import { useEffect, useState } from "react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import ConfirmModal from "../../components/ui/Modal/ConfirmModal"
import { useToast } from "../../components/ui/Toast/ToastProvider"
import { getFines, payFine, type FineDto } from "../../api/lmsApi"
import { toErrorMessage } from "../../api/client"
import { formatCurrency, formatDate } from "../../utils/formatters"
import { downloadCsv, printTableAsPdf } from "../../utils/exporters"
import useDebouncedValue from "../../hooks/useDebouncedValue"

type FineRow = {
  id: number
  user: string
  loanId: number
  amount: string
  issued: string
  paid: string
  status: string
}

type FineFilter = "ALL" | "UNPAID" | "PAID"

export default function FinesPage() {

  const [fines, setFines] = useState<FineRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [payId, setPayId] = useState<number | null>(null)
  const [filter, setFilter] = useState<FineFilter>("ALL")
  const toast = useToast()
  const debouncedSearch = useDebouncedValue(search)

  const mapFineToRow = (fine: FineDto): FineRow => ({
    id: fine.id,
    user: fine.userName,
    loanId: fine.loanId,
    amount: formatCurrency(fine.amount),
    issued: formatDate(fine.issuedDate),
    paid: formatDate(fine.paidDate),
    status: fine.status
  })

  const filterRowsBySearch = (rows: FineRow[], normalizedSearch: string) => {
    if (!normalizedSearch) {
      return rows
    }

    return rows.filter((fine) =>
      String(fine.id).includes(normalizedSearch) ||
      String(fine.loanId).includes(normalizedSearch) ||
      fine.user.toLowerCase().includes(normalizedSearch) ||
      fine.amount.toLowerCase().includes(normalizedSearch) ||
      fine.issued.toLowerCase().includes(normalizedSearch) ||
      fine.paid.toLowerCase().includes(normalizedSearch) ||
      fine.status.toLowerCase().includes(normalizedSearch)
    )
  }

  const fetchAllRowsForExport = async () => {
    const allFines: FineDto[] = []
    let page = 0

    while (true) {
      const response = await getFines({ page, size: 200 })
      allFines.push(...response.content)

      if (response.last) {
        break
      }

      page += 1
    }

    const mapped = allFines.map(mapFineToRow).sort((a, b) => a.id - b.id)
    const filteredByStatus = filter === "ALL" ? mapped : mapped.filter((fine) => fine.status === filter)
    return filterRowsBySearch(filteredByStatus, debouncedSearch.trim().toLowerCase())
  }

  const loadFines = async () => {
    try {
      setLoading(true)
      setError("")
      const normalizedSearch = debouncedSearch.trim().toLowerCase()

      const response = await getFines({ page: 0, size: 200 })
      const mappedFines = response.content
        .map(mapFineToRow)
        .sort((a, b) => a.id - b.id)

      const filteredByStatus = filter === "ALL"
        ? mappedFines
        : mappedFines.filter((fine) => fine.status === filter)

      setFines(filterRowsBySearch(filteredByStatus, normalizedSearch))
    } catch (requestError) {
      const message = toErrorMessage(requestError, "Failed to load fines")
      setError(message)
      toast.error(message)
      setFines([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFines()
  }, [filter, debouncedSearch])

  const handlePay = async (id: number) => {
    try {
      await payFine(id)
      await loadFines()
      setPayId(null)
      toast.success("Fine marked as paid.")
    } catch (requestError) {
      const message = toErrorMessage(requestError, "Failed to mark fine as paid")
      setError(message)
      toast.error(message)
    }
  }

  const handleExportCsv = async () => {
    try {
      const rows = await fetchAllRowsForExport()
      downloadCsv(
        `fines-${filter.toLowerCase()}.csv`,
        ["ID", "User", "Loan ID", "Amount", "Issued", "Paid", "Status"],
        rows.map((fine) => [
          fine.id,
          fine.user,
          fine.loanId,
          fine.amount,
          fine.issued,
          fine.paid,
          fine.status
        ])
      )
      toast.success("Fines exported to CSV.")
    } catch (requestError) {
      toast.error(toErrorMessage(requestError, "Failed to export fines CSV"))
    }
  }

  const handleExportPdf = async () => {
    try {
      const rows = await fetchAllRowsForExport()
      printTableAsPdf({
        title: `Fines Report (${filter})`,
        headers: ["ID", "User", "Loan ID", "Amount", "Issued", "Paid", "Status"],
        rows: rows.map((fine) => [
          fine.id,
          fine.user,
          fine.loanId,
          fine.amount,
          fine.issued,
          fine.paid,
          fine.status
        ])
      })
      toast.info("Print dialog opened. Save as PDF to download.")
    } catch (requestError) {
      toast.error(toErrorMessage(requestError, "Failed to export fines PDF"))
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
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">
            Fines
          </h1>

          <p className="text-gray-500">
            Manage overdue fines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void handleExportCsv()
            }}
            className="border border-slate-300 bg-white px-3 py-2 rounded-lg text-sm hover:bg-slate-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => {
              void handleExportPdf()
            }}
            className="border border-slate-300 bg-white px-3 py-2 rounded-lg text-sm hover:bg-slate-50"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-3 mb-6">
        {(["ALL", "UNPAID", "PAID"] as FineFilter[]).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-2 rounded-lg text-sm border
              ${filter === item
                ? "bg-[#0f1f3d] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by user, loan id, amount, status..."
          className="border px-4 py-2 rounded-lg w-80 outline-none focus:ring-2 focus:ring-blue-500"
        />
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
