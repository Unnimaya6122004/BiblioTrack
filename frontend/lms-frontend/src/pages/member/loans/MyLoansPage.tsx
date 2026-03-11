import { useEffect, useState } from "react"
import { BookOpen, CircleAlert, Repeat } from "lucide-react"

import MemberLayout from "../../../components/layout/MemberLayout"
import Table from "../../../components/ui/Table/Table"
import { getLoans, type LoanDto } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import { formatDate } from "../../../utils/formatters"
import { getLoggedInUser } from "../../../utils/currentUser"
import styles from "../MemberPages.module.css"

type LoanRow = {
  id: number
  book: string
  barcode: string
  issued: string
  due: string
  returned: string
  status: string
}

function toLoanStatus(loan: LoanDto): string {
  if (loan.status !== "ISSUED") {
    return loan.status
  }

  const dueDate = new Date(loan.dueDate)
  if (Number.isNaN(dueDate.getTime())) {
    return loan.status
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return dueDate < today ? "OVERDUE" : loan.status
}

export default function MyLoansPage() {

  const [loans, setLoans] = useState<LoanRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadMyLoans = async () => {
      try {
        setLoading(true)
        setError("")

        const user = await getLoggedInUser()

        if (!user) {
          setLoans([])
          setError("Unable to resolve logged in user")
          return
        }

        const response = await getLoans()
        const userLoans = response.content.filter(
          (loan: LoanDto) => loan.userId === user.id
        )

        setLoans(
          userLoans.map((loan) => ({
            id: loan.id,
            book: loan.bookTitle,
            barcode: loan.barcode,
            issued: formatDate(loan.issueDate),
            due: formatDate(loan.dueDate),
            returned: formatDate(loan.returnDate),
            status: toLoanStatus(loan)
          }))
        )
      } catch (requestError) {
        setError(toErrorMessage(requestError, "Failed to load your loans"))
        setLoans([])
      } finally {
        setLoading(false)
      }
    }

    void loadMyLoans()
  }, [])

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Book", accessor: "book" },
    { header: "Barcode", accessor: "barcode" },
    { header: "Issued", accessor: "issued" },
    { header: "Due", accessor: "due" },
    { header: "Returned", accessor: "returned" },
    { header: "Status", accessor: "status" }
  ]
  const activeCount = loans.filter((loan) => loan.status === "ISSUED").length
  const overdueCount = loans.filter((loan) => loan.status === "OVERDUE").length

  return (
    <MemberLayout>

      <div className={styles.page}>
        <section className={styles.heroCard}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Member Circulation</p>
            <h1 className={styles.heroTitle}>My Loans</h1>
            <p className={styles.heroDescription}>
              Monitor due dates and return status for all borrowed books.
            </p>

            <div className={styles.heroMetaRow}>
              <span className={styles.heroMetaPill}>
                <Repeat size={14} />
                Active {activeCount}
              </span>
              <span className={styles.heroMetaPill}>
                <CircleAlert size={14} />
                Overdue {overdueCount}
              </span>
              <span className={styles.heroMetaPill}>
                <BookOpen size={14} />
                Total {loans.length}
              </span>
            </div>
          </div>
        </section>

        {loading && (
          <p className={`${styles.stateMessage} ${styles.stateInfo}`}>Loading your loans...</p>
        )}

        {error && (
          <p className={`${styles.stateMessage} ${styles.stateError}`}>{error}</p>
        )}

        <section className={styles.tableSection}>
          <Table columns={columns} data={loans} />
        </section>
      </div>

    </MemberLayout>
  )
}
