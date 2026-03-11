import { useEffect, useState } from "react"
import { Download, FileText, Layers3, Plus, Search } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import Modal from "../../components/ui/Modal/Modal"
import ConfirmModal from "../../components/ui/Modal/ConfirmModal"
import { useToast } from "../../components/ui/Toast/ToastProvider"

import IssueLoanForm from "./components/IssueLoanForm"
import { getLoans, returnLoan, type LoanDto } from "../../api/lmsApi"
import { toErrorMessage } from "../../utils/api"
import { formatDate } from "../../utils/formatters"
import { downloadCsv, printTableAsPdf } from "../../utils/exporters"
import useDebouncedValue from "../../hooks/useDebouncedValue"
import pageStyles from "../../styles/adminPage.module.css"

type LoanFilter = "ALL" | "ISSUED" | "RETURNED" | "OVERDUE"

type LoanRow = {
  id: number
  user: string
  book: string
  barcode: string
  issued: string
  due: string
  returned: string
  status: string
  rawStatus: string
}

function isOverdue(loan: LoanDto): boolean {
  if (loan.status !== "ISSUED") {
    return false
  }

  const dueDate = new Date(loan.dueDate)
  if (Number.isNaN(dueDate.getTime())) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return dueDate < today
}

function mapLoanToRow(loan: LoanDto): LoanRow {
  return {
    id: loan.id,
    user: loan.userName,
    book: loan.bookTitle,
    barcode: loan.barcode,
    issued: formatDate(loan.issueDate),
    due: formatDate(loan.dueDate),
    returned: formatDate(loan.returnDate),
    status: isOverdue(loan) ? "OVERDUE" : loan.status,
    rawStatus: loan.status
  }
}

export default function LoansPage() {
  const PAGE_SIZE = 10

  const [openModal, setOpenModal] = useState(false)
  const [filter, setFilter] = useState<LoanFilter>("ALL")
  const [search, setSearch] = useState("")
  const [loans, setLoans] = useState<LoanRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [returnId, setReturnId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const toast = useToast()
  const debouncedSearch = useDebouncedValue(search)

  const resolveStatusQuery = () => (
    filter === "ISSUED" || filter === "RETURNED"
      ? filter
      : filter === "OVERDUE"
        ? "ISSUED"
        : undefined
  )

  const fetchAllRowsForExport = async () => {
    const statusQuery = resolveStatusQuery()
    const allLoans: LoanDto[] = []
    let pageIndex = 0

    while (true) {
      const response = await getLoans({
        status: statusQuery,
        page: pageIndex,
        size: 200
      })

      allLoans.push(...response.content)

      if (response.last) {
        break
      }

      pageIndex += 1
    }

    const mapped = allLoans.map(mapLoanToRow).sort((a, b) => a.id - b.id)
    return filter === "OVERDUE"
      ? mapped.filter((loan) => loan.status === "OVERDUE")
      : mapped
  }

  const filterRowsBySearch = (rows: LoanRow[], normalizedSearch: string) => {
    if (!normalizedSearch) {
      return rows
    }

    return rows.filter((loan) =>
      String(loan.id).includes(normalizedSearch) ||
      loan.user.toLowerCase().includes(normalizedSearch) ||
      loan.book.toLowerCase().includes(normalizedSearch) ||
      loan.barcode.toLowerCase().includes(normalizedSearch) ||
      loan.status.toLowerCase().includes(normalizedSearch) ||
      loan.issued.toLowerCase().includes(normalizedSearch) ||
      loan.due.toLowerCase().includes(normalizedSearch) ||
      loan.returned.toLowerCase().includes(normalizedSearch)
    )
  }

  const loadLoans = async () => {
    try {
      setLoading(true)
      setError("")
      const normalizedSearch = debouncedSearch.trim().toLowerCase()

      if (normalizedSearch) {
        const allRows = await fetchAllRowsForExport()
        const filteredRows = filterRowsBySearch(allRows, normalizedSearch)
        const start = page * PAGE_SIZE
        const end = start + PAGE_SIZE

        setLoans(filteredRows.slice(start, end))
        setTotalPages(Math.ceil(filteredRows.length / PAGE_SIZE))
        return
      }

      const statusQuery = resolveStatusQuery()

      const response = await getLoans({
        status: statusQuery,
        page,
        size: PAGE_SIZE
      })

      const mappedLoans = response.content
        .map(mapLoanToRow)
        .sort((a, b) => a.id - b.id)

      if (filter === "OVERDUE") {
        setLoans(mappedLoans.filter((loan) => loan.status === "OVERDUE"))
      } else {
        setLoans(mappedLoans)
      }

      setTotalPages(response.totalPages)
    } catch (requestError) {
      const message = toErrorMessage(requestError, "Failed to load loans")
      setError(message)
      toast.error(message)
      setLoans([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLoans()
  }, [page, filter, debouncedSearch, toast]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReturn = async (loanId: number) => {
    try {
      await returnLoan(loanId)
      await loadLoans()
      setReturnId(null)
      toast.success("Loan marked as returned.")
    } catch (requestError) {
      const message = toErrorMessage(requestError, "Failed to return loan")
      setError(message)
      toast.error(message)
    }
  }

  const handleExportCsv = async () => {
    try {
      const normalizedSearch = debouncedSearch.trim().toLowerCase()
      const rows = filterRowsBySearch(await fetchAllRowsForExport(), normalizedSearch)
      downloadCsv(
        `loans-${filter.toLowerCase()}.csv`,
        ["ID", "User", "Book", "Barcode", "Issued", "Due", "Returned", "Status"],
        rows.map((loan) => [
          loan.id,
          loan.user,
          loan.book,
          loan.barcode,
          loan.issued,
          loan.due,
          loan.returned,
          loan.status
        ])
      )
      toast.success("Loans exported to CSV.")
    } catch (requestError) {
      toast.error(toErrorMessage(requestError, "Failed to export loans CSV"))
    }
  }

  const handleExportPdf = async () => {
    try {
      const normalizedSearch = debouncedSearch.trim().toLowerCase()
      const rows = filterRowsBySearch(await fetchAllRowsForExport(), normalizedSearch)
      printTableAsPdf({
        title: `Loans Report (${filter})`,
        headers: ["ID", "User", "Book", "Barcode", "Issued", "Due", "Returned", "Status"],
        rows: rows.map((loan) => [
          loan.id,
          loan.user,
          loan.book,
          loan.barcode,
          loan.issued,
          loan.due,
          loan.returned,
          loan.status
        ])
      })
      toast.info("Print dialog opened. Save as PDF to download.")
    } catch (requestError) {
      toast.error(toErrorMessage(requestError, "Failed to export loans PDF"))
    }
  }

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
      render: (row: unknown) => {
        const loan = row as LoanRow

        if (loan.rawStatus !== "ISSUED") {
          return <span className="text-xs text-slate-400">No action</span>
        }

        return (
          <button
            type="button"
            onClick={() => setReturnId(loan.id)}
            className={pageStyles.actionLink}
          >
            Return Book
          </button>
        )
      }
    }
  ]

  const issuedCount = loans.filter((loan) => loan.status === "ISSUED").length
  const overdueCount = loans.filter((loan) => loan.status === "OVERDUE").length
  const returnedCount = loans.filter((loan) => loan.status === "RETURNED").length

  return (
    <DashboardLayout>
      <div className={pageStyles.page}>

        <section className={pageStyles.hero}>
          <div className={pageStyles.heroContent}>
            <p className={pageStyles.heroEyebrow}>Circulation Desk</p>
            <h1 className={pageStyles.heroTitle}>Loans</h1>
            <p className={pageStyles.heroSubtitle}>
              Monitor active borrowing, overdue risk, and return activity in one workflow.
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
            <button
              onClick={() => setOpenModal(true)}
              className={pageStyles.primaryButton}
            >
              <Plus size={16} />
              Issue Book
            </button>
          </div>
        </section>

        <section className={pageStyles.controlsCard}>
          <div className={pageStyles.controlsTopRow}>
            <div className={pageStyles.searchWrap}>
              <Search size={16} className={pageStyles.searchIcon} />
              <input
                value={search}
                onChange={(event) => {
                  setPage(0)
                  setSearch(event.target.value)
                }}
                placeholder="Search by user, book, barcode, status..."
                className={pageStyles.searchInput}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={pageStyles.metaChip}>
                <Layers3 size={13} />
                Showing {loans.length}
              </span>
              <span className={pageStyles.metaChip}>Issued {issuedCount}</span>
              <span className={pageStyles.metaChip}>Overdue {overdueCount}</span>
              <span className={pageStyles.metaChip}>Returned {returnedCount}</span>
            </div>
          </div>

          <div className={pageStyles.chipRow}>
            {(["ALL", "ISSUED", "RETURNED", "OVERDUE"] as LoanFilter[]).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setPage(0)
                  setFilter(item)
                }}
                className={`${pageStyles.chipButton} ${filter === item ? pageStyles.chipButtonActive : ""}`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <p className={pageStyles.infoText}>Loading loans...</p>
        )}

        {error && (
          <p className={pageStyles.errorText}>{error}</p>
        )}

        <div className={pageStyles.tableSurface}>
          <Table columns={columns} data={loans} />
        </div>

        <div className={pageStyles.pagination}>
          <button
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
            className={pageStyles.pageNavButton}
          >
            Previous
          </button>

          <div className={pageStyles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setPage(index)}
                className={`${pageStyles.pageNumber} ${page === index ? pageStyles.pageNumberActive : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={totalPages === 0 || page >= totalPages - 1}
            className={pageStyles.pageNavButton}
          >
            Next
          </button>
        </div>

        {openModal && (
          <Modal onClose={() => setOpenModal(false)}>
            <h2 className={pageStyles.modalTitle}>
              Issue Book
            </h2>

            <IssueLoanForm
              onClose={() => setOpenModal(false)}
              onCreated={loadLoans}
            />
          </Modal>
        )}

        {returnId !== null && (
          <ConfirmModal
            title="Return Book"
            message="Are you sure you want to mark this loan as returned?"
            confirmText="Return"
            cancelText="Cancel"
            onCancel={() => setReturnId(null)}
            onConfirm={() => {
              void handleReturn(returnId)
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
