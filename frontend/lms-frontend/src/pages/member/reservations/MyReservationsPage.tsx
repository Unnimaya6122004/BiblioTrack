import { useEffect, useState } from "react"
import { CalendarCheck, CheckCircle2 } from "lucide-react"

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
import styles from "../MemberPages.module.css"

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
          return <span className={styles.mutedActionText}>No action</span>
        }

        return (
          <button
            type="button"
            onClick={() => setCancelId(reservation.id)}
            className={styles.dangerTextAction}
          >
            Cancel
          </button>
        )
      }
    }
  ]
  const activeCount = reservations.filter((reservation) => reservation.status === "ACTIVE").length

  return (
    <MemberLayout>

      <div className={styles.page}>
        <section className={styles.heroCard}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Member Queue</p>
            <h1 className={styles.heroTitle}>My Reservations</h1>
            <p className={styles.heroDescription}>
              Track reserved books and manage active reservation requests.
            </p>

            <div className={styles.heroMetaRow}>
              <span className={styles.heroMetaPill}>
                <CalendarCheck size={14} />
                Active {activeCount}
              </span>
              <span className={styles.heroMetaPill}>
                <CheckCircle2 size={14} />
                Total {reservations.length}
              </span>
            </div>
          </div>
        </section>

        <div className={styles.toolbarRow}>
          <div />
          <button
            onClick={() => setOpenModal(true)}
            className={styles.primaryButton}
          >
            + New Reservation
          </button>
        </div>

        {loading && (
          <p className={`${styles.stateMessage} ${styles.stateInfo}`}>
            Loading your reservations...
          </p>
        )}

        {error && (
          <p className={`${styles.stateMessage} ${styles.stateError}`}>{error}</p>
        )}

        <section className={styles.tableSection}>
          <Table columns={columns} data={reservations} />
        </section>

        {openModal && (
          <Modal onClose={() => setOpenModal(false)}>

            <h2 className={styles.modalTitle}>
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
      </div>

    </MemberLayout>
  )
}
