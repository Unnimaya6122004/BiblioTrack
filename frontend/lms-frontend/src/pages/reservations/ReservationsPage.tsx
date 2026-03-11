import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import Modal from "../../components/ui/Modal/Modal"
import ConfirmModal from "../../components/ui/Modal/ConfirmModal"

import AddReservationForm from "./components/AddReservationForm"
import {
  cancelReservation,
  getReservations,
  type ReservationDto
} from "../../api/lmsApi"
import { toErrorMessage } from "../../utils/api"
import { formatDate } from "../../utils/formatters"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [filter, setFilter] = useState<ReservationFilter>("ALL")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError("")

      if (filter !== "ALL") {
        const response = await getReservations({ page: 0, size: 200 })
        const filteredReservations = response.content
          .map((reservation: ReservationDto) => ({
            id: reservation.id,
            user: reservation.userName,
            book: reservation.bookTitle,
            date: formatDate(reservation.reservationDate),
            status: reservation.status
          }))
          .sort((a, b) => a.id - b.id)
          .filter((reservation) => reservation.status === filter)

        const start = page * PAGE_SIZE
        const end = start + PAGE_SIZE

        setReservations(filteredReservations.slice(start, end))
        setTotalPages(Math.ceil(filteredReservations.length / PAGE_SIZE))
        return
      }

      const response = await getReservations({ page, size: PAGE_SIZE })
      const mappedReservations = response.content
        .map((reservation: ReservationDto) => ({
          id: reservation.id,
          user: reservation.userName,
          book: reservation.bookTitle,
          date: formatDate(reservation.reservationDate),
          status: reservation.status
        }))
        .sort((a, b) => a.id - b.id)

      setReservations(mappedReservations)
      setTotalPages(response.totalPages)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to load reservations"))
      setReservations([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReservations()
  }, [page, filter])

  const handleCancel = async (id: number) => {
    try {
      await cancelReservation(id)
      await loadReservations()
      setCancelId(null)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to cancel reservation"))
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
          return <span className="text-sm text-gray-400">No action</span>
        }

        return (
          <button
            type="button"
            onClick={() => setCancelId(reservation.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </button>
        )
      }
    }
  ]

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-semibold">
            Reservations
          </h1>

          <p className="text-gray-500">
            Manage book reservations
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-[#0f1f3d] text-white px-4 py-2 rounded-lg hover:bg-[#162a52]"
        >
          + New Reservation
        </button>

      </div>

      {/* Status Filters */}
      <div className="flex gap-3 mb-6">
        {(["ALL", "ACTIVE", "COMPLETED", "CANCELLED"] as ReservationFilter[]).map((item) => (
          <button
            key={item}
            onClick={() => {
              setPage(0)
              setFilter(item)
            }}
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

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading reservations...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* Table */}
      <Table columns={columns} data={reservations} />

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0}
          className="border px-3 py-2 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setPage(index)}
              className={`px-3 py-1 rounded-lg border ${
                page === index ? "bg-[#0f1f3d] text-white" : "bg-white"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={totalPages === 0 || page >= totalPages - 1}
          className="border px-3 py-2 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Create Reservation Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className="text-lg font-semibold mb-6">
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

    </DashboardLayout>
  )
}
