import { useEffect, useState } from "react"

import MemberLayout from "../../../components/layout/MemberLayout"
import Table from "../../../components/ui/Table/Table"
import Modal from "../../../components/ui/Modal/Modal"
import ConfirmModal from "../../../components/ui/Modal/ConfirmModal"

import AddReservationForm from "../../reservations/components/AddReservationForm"
import {
  cancelReservation,
  getReservations,
  type ReservationDto
} from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import { formatDate } from "../../../utils/formatters"
import { getLoggedInUser } from "../../../utils/currentUser"

type ReservationRow = {
  id: number
  book: string
  date: string
  status: string
}

export default function MyReservationsPage() {

  const [openModal, setOpenModal] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cancelId, setCancelId] = useState<number | null>(null)

  const loadMyReservations = async (knownUserId?: number) => {
    try {
      setLoading(true)
      setError("")

      let userId = knownUserId

      if (!userId) {
        const user = await getLoggedInUser()

        if (!user) {
          setReservations([])
          setError("Unable to resolve logged in user")
          return
        }

        userId = user.id
        setCurrentUserId(user.id)
      }

      const response = await getReservations()
      const myReservations = response.content.filter(
        (reservation: ReservationDto) => reservation.userId === userId
      )

      setReservations(
        myReservations.map((reservation) => ({
          id: reservation.id,
          book: reservation.bookTitle,
          date: formatDate(reservation.reservationDate),
          status: reservation.status
        }))
      )
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to load your reservations"))
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMyReservations()
  }, [])

  const handleCancel = async (id: number) => {
    try {
      await cancelReservation(id)
      await loadMyReservations(currentUserId ?? undefined)
      setCancelId(null)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to cancel reservation"))
    }
  }

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Book", accessor: "book" },
    { header: "Reservation Date", accessor: "date" },
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
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Cancel
          </button>
        )
      }
    }
  ]

  return (
    <MemberLayout>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-semibold">
            My Reservations
          </h1>

          <p className="text-gray-500">
            View books you have reserved
          </p>
        </div>

        {/* New Reservation Button */}
        <button
          onClick={() => setOpenModal(true)}
          className="bg-[#0f1f3d] text-white px-4 py-2 rounded-lg hover:bg-[#162a52]"
        >
          + New Reservation
        </button>

      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading your reservations...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* Table */}
      <Table columns={columns} data={reservations} />

      {/* Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className="text-lg font-semibold mb-6">
            New Reservation
          </h2>

          <AddReservationForm
            onClose={() => setOpenModal(false)}
            defaultUserId={currentUserId}
            onCreated={() => loadMyReservations(currentUserId ?? undefined)}
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

    </MemberLayout>
  )
}
