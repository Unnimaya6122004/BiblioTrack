import { useEffect, useState } from "react"
import { Download, FileText, Layers3, Search } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import ConfirmModal from "../../components/ui/Modal/ConfirmModal"
import { useToast } from "../../components/ui/Toast/ToastProvider"
import { getFines, payFine, type FineDto } from "../../api/lmsApi"
import { toErrorMessage } from "../../api/client"
import { formatCurrency, formatDate } from "../../utils/formatters"
import { downloadCsv, printTableAsPdf } from "../../utils/exporters"
import useDebouncedValue from "../../hooks/useDebouncedValue"
import pageStyles from "../../styles/adminPage.module.css"

type FineRow = {
  id: number
  user: string
  loanId: number
  amount: string
  amountRaw: number
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
    amountRaw: Number(fine.amount),
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
  }, [filter, debouncedSearch, toast]) // eslint-disable-line react-hooks/exhaustive-deps

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
          return <span className="text-xs text-slate-400">No action</span>
        }

        return (
          <button
            type="button"
            onClick={() => setPayId(fine.id)}
            className={pageStyles.actionLink}
          >
            Mark Paid
          </button>
        )
      }
    }
  ]

  const unpaidCount = fines.filter((fine) => fine.status === "UNPAID").length
  const paidCount = fines.filter((fine) => fine.status === "PAID").length
  const totalExposure = fines
    .filter((fine) => fine.status === "UNPAID")
    .reduce((sum, fine) => sum + fine.amountRaw, 0)

  return (
    <DashboardLayout>
      <div className={pageStyles.page}>

        <section className={pageStyles.hero}>
          <div className={pageStyles.heroContent}>
            <p className={pageStyles.heroEyebrow}>Financial Oversight</p>
            <h1 className={pageStyles.heroTitle}>Fines</h1>
            <p className={pageStyles.heroSubtitle}>
              Track unpaid liabilities, settlement flow, and issue-level fine records.
            </p>
          </div>

          <div className={pageStyles.heroActions}>
            <button
              type="button"
              onClick={() => {
                void handleExportCsv()
              }}
              className={pageStyles.primaryButton}
            >
              <Download size={15} />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => {
                void handleExportPdf()
              }}
              className={pageStyles.primaryButton}
            >
              <FileText size={15} />
              Export PDF
            </button>
          </div>
        </section>

        <section className={pageStyles.controlsCard}>
          <div className={pageStyles.controlsTopRow}>
            <div className={pageStyles.searchWrap}>
              <Search size={16} className={pageStyles.searchIcon} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by user, loan id, amount, status..."
                className={pageStyles.searchInput}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={pageStyles.metaChip}>
                <Layers3 size={13} />
                Showing {fines.length}
              </span>
              <span className={pageStyles.metaChip}>Unpaid {unpaidCount}</span>
              <span className={pageStyles.metaChip}>Paid {paidCount}</span>
              <span className={pageStyles.metaChip}>Exposure {formatCurrency(totalExposure)}</span>
            </div>
          </div>

          <div className={pageStyles.chipRow}>
            {(["ALL", "UNPAID", "PAID"] as FineFilter[]).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`${pageStyles.chipButton} ${filter === item ? pageStyles.chipButtonActive : ""}`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <p className={pageStyles.infoText}>Loading fines...</p>
        )}

        {error && (
          <p className={pageStyles.errorText}>{error}</p>
        )}

        <div className={pageStyles.tableSurface}>
          <Table columns={columns} data={fines} />
        </div>

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
      </div>
    </DashboardLayout>
  )
}
