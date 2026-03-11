import { useEffect, useState } from "react"
import { Download, FileText, Layers3, Plus, Search, Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import Modal from "../../components/ui/Modal/Modal"
import ConfirmModal from "../../components/ui/Modal/ConfirmModal"
import { useToast } from "../../components/ui/Toast/ToastProvider"

import AddReservationForm from "./components/AddReservationForm"
import {
  cancelReservation,
  getReservations,
  type ReservationDto
} from "../../api/lmsApi"
import { toErrorMessage } from "../../utils/api"
import { formatDate } from "../../utils/formatters"
import { downloadCsv, printTableAsPdf } from "../../utils/exporters"
import useDebouncedValue from "../../hooks/useDebouncedValue"
import pageStyles from "../../styles/adminPage.module.css"

type ReservationRow = {
  id: number
  user: string
  book: string
  date: string
  status: string
}

type ReservationFilter = "ALL" | "ACTIVE" | "COMPLETED" | "CANCELLED"

export default function ReservationsPage() {
  const PAGE_SIZE = 10

  const [openModal, setOpenModal] = useState(false)
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [filter, setFilter] = useState<ReservationFilter>("ALL")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const toast = useToast()
  const debouncedSearch = useDebouncedValue(search)

  const fetchAllReservations = async () => {
    const allReservations: ReservationDto[] = []
    let pageIndex = 0

    while (true) {
      const response = await getReservations({ page: pageIndex, size: 200 })
      allReservations.push(...response.content)

      if (response.last) {
        break
      }

      pageIndex += 1
    }

    return allReservations
  }

  const mapReservationToRow = (reservation: ReservationDto): ReservationRow => ({
    id: reservation.id,
    user: reservation.userName,
    book: reservation.bookTitle,
    date: formatDate(reservation.reservationDate),
    status: reservation.status
  })

  const filterRowsBySearch = (rows: ReservationRow[], normalizedSearch: string) => {
    if (!normalizedSearch) {
      return rows
    }

    return rows.filter((reservation) =>
      String(reservation.id).includes(normalizedSearch) ||
      reservation.user.toLowerCase().includes(normalizedSearch) ||
      reservation.book.toLowerCase().includes(normalizedSearch) ||
      reservation.date.toLowerCase().includes(normalizedSearch) ||
      reservation.status.toLowerCase().includes(normalizedSearch)
    )
  }

  const fetchAllRowsForExport = async () => {
    const allReservations = await fetchAllReservations()
    let mapped = allReservations
      .map(mapReservationToRow)
      .sort((a, b) => a.id - b.id)

    if (filter !== "ALL") {
      mapped = mapped.filter((reservation) => reservation.status === filter)
    }

    return filterRowsBySearch(mapped, debouncedSearch.trim().toLowerCase())
  }

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError("")
      const normalizedSearch = debouncedSearch.trim().toLowerCase()

      if (filter !== "ALL" || normalizedSearch) {
        const allReservations = await fetchAllReservations()
        let filteredReservations = allReservations
          .map(mapReservationToRow)
          .sort((a, b) => a.id - b.id)

        if (filter !== "ALL") {
          filteredReservations = filteredReservations
            .filter((reservation) => reservation.status === filter)
        }

        filteredReservations = filterRowsBySearch(filteredReservations, normalizedSearch)

        const start = page * PAGE_SIZE
        const end = start + PAGE_SIZE

        setReservations(filteredReservations.slice(start, end))
        setTotalPages(Math.ceil(filteredReservations.length / PAGE_SIZE))
        return
      }

      const response = await getReservations({ page, size: PAGE_SIZE })
      const mappedReservations = response.content
        .map(mapReservationToRow)
        .sort((a, b) => a.id - b.id)

      setReservations(mappedReservations)
      setTotalPages(response.totalPages)
    } catch (requestError) {
      const message = toErrorMessage(requestError, "Failed to load reservations")
      setError(message)
      toast.error(message)
      setReservations([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReservations()
  }, [page, filter, debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async (id: number) => {
    try {
      await cancelReservation(id)
      await loadReservations()
      setCancelId(null)
      toast.success("Reservation cancelled.")
    } catch (requestError) {
      const message = toErrorMessage(requestError, "Failed to cancel reservation")
      setError(message)
      toast.error(message)
    }
  }

  const handleExportCsv = async () => {
    try {
      const rows = await fetchAllRowsForExport()
      downloadCsv(
        `reservations-${filter.toLowerCase()}.csv`,
        ["ID", "User", "Book", "Date", "Status"],
        rows.map((reservation) => [
          reservation.id,
          reservation.user,
          reservation.book,
          reservation.date,
          reservation.status
        ])
      )
      toast.success("Reservations exported to CSV.")
    } catch (requestError) {
      toast.error(toErrorMessage(requestError, "Failed to export reservations CSV"))
    }
  }

  const handleExportPdf = async () => {
    try {
      const rows = await fetchAllRowsForExport()
      printTableAsPdf({
        title: `Reservations Report (${filter})`,
        headers: ["ID", "User", "Book", "Date", "Status"],
        rows: rows.map((reservation) => [
          reservation.id,
          reservation.user,
          reservation.book,
          reservation.date,
          reservation.status
        ])
      })
      toast.info("Print dialog opened. Save as PDF to download.")
    } catch (requestError) {
      toast.error(toErrorMessage(requestError, "Failed to export reservations PDF"))
    }
  }

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "User", accessor: "user" },
    { header: "Book", accessor: "book" },
    { header: "Date", accessor: "date" },
    { header: "Status", accessor: "status" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: unknown) => {
        const reservation = row as ReservationRow

        if (reservation.status !== "ACTIVE") {
          return <span className="text-xs text-slate-400">No action</span>
        }

        return (
          <button
            type="button"
            onClick={() => setCancelId(reservation.id)}
            className={`${pageStyles.iconButton} ${pageStyles.dangerIconButton}`}
          >
            <Trash2 size={14} />
          </button>
        )
      }
    }
  ]

  const activeCount = reservations.filter((reservation) => reservation.status === "ACTIVE").length
  const completedCount = reservations.filter((reservation) => reservation.status === "COMPLETED").length

  return (
    <DashboardLayout>
      <div className={pageStyles.page}>

        <section className={pageStyles.hero}>
          <div className={pageStyles.heroContent}>
            <p className={pageStyles.heroEyebrow}>Reservation Desk</p>
            <h1 className={pageStyles.heroTitle}>Reservations</h1>
            <p className={pageStyles.heroSubtitle}>
              Manage active requests, lifecycle status, and reservation completion flow.
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
              New Reservation
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
                placeholder="Search by user, book, status..."
                className={pageStyles.searchInput}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={pageStyles.metaChip}>
                <Layers3 size={13} />
                Showing {reservations.length}
              </span>
              <span className={pageStyles.metaChip}>Active {activeCount}</span>
              <span className={pageStyles.metaChip}>Completed {completedCount}</span>
            </div>
          </div>

          <div className={pageStyles.chipRow}>
            {(["ALL", "ACTIVE", "COMPLETED", "CANCELLED"] as ReservationFilter[]).map((item) => (
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
          <p className={pageStyles.infoText}>Loading reservations...</p>
        )}

        {error && (
          <p className={pageStyles.errorText}>{error}</p>
        )}

        <div className={pageStyles.tableSurface}>
          <Table columns={columns} data={reservations} />
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
              Create Reservation
            </h2>

            <AddReservationForm
              onClose={() => setOpenModal(false)}
              onCreated={loadReservations}
            />
          </Modal>
        )}

        {cancelId !== null && (
          <ConfirmModal
            title="Cancel Reservation"
            message="Are you sure you want to cancel this reservation?"
            confirmText="Cancel Reservation"
            cancelText="Keep"
            onCancel={() => setCancelId(null)}
            onConfirm={() => {
              void handleCancel(cancelId)
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
