import { useEffect, useState } from "react"
import { AlertTriangle, Wallet } from "lucide-react"

import MemberLayout from "../../../components/layout/MemberLayout"
import Table from "../../../components/ui/Table/Table"
import Modal from "../../../components/ui/Modal/Modal"
import { getFines, payFine, type FineDto } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import { formatCurrency, formatDate } from "../../../utils/formatters"
import { getLoggedInUser } from "../../../utils/currentUser"
import styles from "../MemberPages.module.css"

type FineRow = {
  id: number
  loanId: number
  amountValue: number
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
        myFines.map((fine) => {
          const parsedAmount = Number(fine.amount)

          return {
            id: fine.id,
            loanId: fine.loanId,
            amountValue: Number.isFinite(parsedAmount) ? parsedAmount : 0,
            amount: formatCurrency(fine.amount),
            issued: formatDate(fine.issuedDate),
            paid: formatDate(fine.paidDate),
            status: fine.status
          }
        })
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
          return <span className={styles.mutedActionText}>No action</span>
        }

        return (
          <button
            onClick={() => {
              setSelectedFine(fine)
              setOpenModal(true)
            }}
            className={styles.primaryButton}
          >
            Pay Fine
          </button>
        )
      }
    }
  ]
  const unpaidFines = fines.filter((fine) => fine.status === "UNPAID")
  const unpaidTotal = unpaidFines.reduce((total, fine) => total + fine.amountValue, 0)

  return (
    <MemberLayout>

      <div className={styles.page}>
        <section className={styles.heroCard}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Member Billing</p>
            <h1 className={styles.heroTitle}>My Fines</h1>
            <p className={styles.heroDescription}>
              Review unpaid fines and settle pending amounts quickly.
            </p>

            <div className={styles.heroMetaRow}>
              <span className={styles.heroMetaPill}>
                <AlertTriangle size={14} />
                Unpaid {unpaidFines.length}
              </span>
              <span className={styles.heroMetaPill}>
                <Wallet size={14} />
                {formatCurrency(unpaidTotal)}
              </span>
            </div>
          </div>
        </section>

        {loading && (
          <p className={`${styles.stateMessage} ${styles.stateInfo}`}>Loading your fines...</p>
        )}

        {error && (
          <p className={`${styles.stateMessage} ${styles.stateError}`}>{error}</p>
        )}

        <section className={styles.tableSection}>
          <Table columns={columns} data={fines} />
        </section>

        {openModal && selectedFine && (
          <Modal onClose={() => setOpenModal(false)}>

            <div className="text-center">

              <h2 className={styles.modalTitle}>
                Pay Fine
              </h2>

              <p className={styles.modalDescription}>
                Confirm payment for this fine.
              </p>

              <p className={styles.modalAmount}>
                Amount: {selectedFine.amount}
              </p>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setOpenModal(false)}
                  disabled={paying}
                  className={styles.modalSecondaryButton}
                >
                  Close
                </button>

                <button
                  onClick={() => void handlePayFine()}
                  disabled={paying}
                  className={styles.modalPrimaryButton}
                >
                  {paying ? "Paying..." : "Confirm Pay"}
                </button>
              </div>

            </div>

          </Modal>
        )}
      </div>

    </MemberLayout>
  )
}
