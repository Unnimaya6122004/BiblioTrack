import { useEffect, useState } from "react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import StatCard from "../../components/ui/StatCard/StatCard"
import QuickActions from "./components/QuickActions"
import SystemStatus from "./components/SystemStatus"
import { useToast } from "../../components/ui/Toast/ToastProvider"
import styles from "./DashboardPage.module.css"

import {
  BookOpen,
  Users,
  Repeat,
  CalendarCheck,
  AlertTriangle
} from "lucide-react"
import {
  getAdminAnalytics,
  getBooks,
  getFines,
  getLoans,
  getReservations,
  getUsers,
  type AdminAnalyticsDto
} from "../../api/lmsApi"
import { toErrorMessage } from "../../api/client"
import { formatCurrency } from "../../utils/formatters"

type DashboardStats = {
  totalBooks: number
  totalUsers: number
  activeLoans: number
  reservations: number
  unpaidFines: number
}

type KpiItem = {
  label: string
  value: string
  percent: number
}

const initialStats: DashboardStats = {
  totalBooks: 0,
  totalUsers: 0,
  activeLoans: 0,
  reservations: 0,
  unpaidFines: 0
}

const calculatePercent = (value: number, total: number) => {
  if (total <= 0) {
    return 0
  }

  return Math.min(100, Math.round((value / total) * 100))
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [analytics, setAnalytics] = useState<AdminAnalyticsDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const toast = useToast()
  const fineTrendMax = analytics && analytics.fineTrends.length > 0
    ? Math.max(
      ...analytics.fineTrends.map((item) =>
        Math.max(Number(item.raisedAmount), Number(item.paidAmount))
      ),
      1
    )
    : 1
  const topBorrowedMax = analytics && analytics.topBooks.length > 0
    ? Math.max(...analytics.topBooks.map((item) => item.loanCount), 1)
    : 1
  const defaulterMax = analytics && analytics.defaulters.length > 0
    ? Math.max(...analytics.defaulters.map((item) => Number(item.unpaidFineTotal)), 1)
    : 1
  const totalRaised = analytics
    ? analytics.fineTrends.reduce((sum, point) => sum + Number(point.raisedAmount), 0)
    : 0
  const totalPaid = analytics
    ? analytics.fineTrends.reduce((sum, point) => sum + Number(point.paidAmount), 0)
    : 0
  const circulationLoad = calculatePercent(stats.activeLoans, stats.totalBooks)
  const reservationLoad = calculatePercent(stats.reservations, stats.totalUsers)
  const paymentRecovery = totalRaised > 0
    ? Math.round((totalPaid / totalRaised) * 100)
    : 100
  const kpiItems: KpiItem[] = [
    {
      label: "Circulation Load",
      value: `${circulationLoad}%`,
      percent: circulationLoad
    },
    {
      label: "Reservation Pressure",
      value: `${reservationLoad}%`,
      percent: reservationLoad
    },
    {
      label: "Fine Recovery",
      value: `${paymentRecovery}%`,
      percent: paymentRecovery
    }
  ]

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError("")

        const [books, users, loans, reservations, fines] = await Promise.all([
          getBooks(),
          getUsers(),
          getLoans(),
          getReservations(),
          getFines()
        ])

        setStats({
          totalBooks: books.totalElements,
          totalUsers: users.totalElements,
          activeLoans: loans.content.filter((loan) => loan.status === "ISSUED").length,
          reservations: reservations.content.filter(
            (reservation) => reservation.status === "ACTIVE"
          ).length,
          unpaidFines: fines.content.filter((fine) => fine.status === "UNPAID").length
        })

        // Analytics is optional for compatibility while backend endpoint is rolling out.
        try {
          const analyticsResponse = await getAdminAnalytics()
          setAnalytics(analyticsResponse)
        } catch {
          setAnalytics(null)
        }
      } catch (requestError) {
        const message = toErrorMessage(requestError, "Failed to load dashboard stats")
        setError(message)
        setStats(initialStats)
        setAnalytics(null)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    void loadStats()
  }, [toast])

  return (
    <DashboardLayout>
      <div className={styles.page}>

        <section className={styles.heroCard}>
          <div>
            <p className={styles.heroEyebrow}>Library Intelligence</p>
            <h1 className={styles.heroTitle}>Dashboard Overview</h1>
            <p className={styles.heroDescription}>
              Operational trends, circulation load, and fine recovery metrics in one view.
            </p>
          </div>

          <div className={styles.heroKpiGrid}>
            {kpiItems.map((item) => (
              <div key={item.label} className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <span className={styles.kpiLabel}>{item.label}</span>
                  <span className={styles.kpiValue}>{item.value}</span>
                </div>
                <div className={styles.kpiTrack}>
                  <span style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {loading && (
          <p className={styles.infoMessage}>Loading dashboard...</p>
        )}

        {error && (
          <p className={styles.errorMessage}>{error}</p>
        )}

        <div className={styles.statsGrid}>

          <StatCard
            title="Total Books"
            value={stats.totalBooks}
            description="In catalog"
            icon={<BookOpen size={20} />}
          />

          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            description="Registered members"
            icon={<Users size={20} />}
          />

          <StatCard
            title="Active Loans"
            value={stats.activeLoans}
            description="Currently issued"
            icon={<Repeat size={20} />}
          />

          <StatCard
            title="Reservations"
            value={stats.reservations}
            description="Pending requests"
            icon={<CalendarCheck size={20} />}
          />

          <StatCard
            title="Unpaid Fines"
            value={stats.unpaidFines}
            description="Awaiting payment"
            icon={<AlertTriangle size={20} />}
          />

        </div>

        <div className={styles.secondaryGrid}>
          <QuickActions />
          <SystemStatus />
        </div>

        <div className={styles.analyticsGrid}>

          <section className={styles.analyticsCard}>
            <h2 className={styles.analyticsTitle}>
              Top Borrowed Books
            </h2>
            <p className={styles.analyticsSubtitle}>Most active circulation titles</p>

            {!analytics || analytics.topBooks.length === 0 ? (
              <p className={styles.emptyState}>No analytics data yet.</p>
            ) : (
              <div className={styles.analyticsList}>
                {analytics.topBooks.map((book, index) => {
                  const share = (book.loanCount / topBorrowedMax) * 100

                  return (
                    <div key={book.bookId} className={styles.analyticsItem}>
                      <div className={styles.analyticsItemHeader}>
                        <p className={styles.analyticsLabel}>
                          {index + 1}. {book.bookTitle}
                        </p>
                        <span className={styles.analyticsValue}>{book.loanCount} loans</span>
                      </div>
                      <div className={styles.progressTrack}>
                        <span
                          className={styles.booksProgress}
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className={styles.analyticsCard}>
            <h2 className={styles.analyticsTitle}>
              Top Defaulters
            </h2>
            <p className={styles.analyticsSubtitle}>Members with highest pending liabilities</p>

            {!analytics || analytics.defaulters.length === 0 ? (
              <p className={styles.emptyState}>No defaulter data yet.</p>
            ) : (
              <div className={styles.analyticsList}>
                {analytics.defaulters.map((user) => {
                  const exposure = (Number(user.unpaidFineTotal) / defaulterMax) * 100

                  return (
                    <div key={user.userId} className={styles.analyticsItem}>
                      <div className={styles.analyticsItemHeader}>
                        <div>
                          <p className={styles.analyticsLabel}>{user.userName}</p>
                          <p className={styles.analyticsMeta}>
                            {user.overdueLoanCount} overdue loan(s)
                          </p>
                        </div>
                        <span className={styles.analyticsValue}>
                          {formatCurrency(user.unpaidFineTotal)}
                        </span>
                      </div>
                      <div className={styles.progressTrack}>
                        <span
                          className={styles.defaulterProgress}
                          style={{ width: `${exposure}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className={styles.analyticsCard}>
            <h2 className={styles.analyticsTitle}>
              Fine Trends (6 Months)
            </h2>
            <p className={styles.analyticsSubtitle}>Raised vs recovered fines month by month</p>

            {!analytics || analytics.fineTrends.length === 0 ? (
              <p className={styles.emptyState}>No trend data yet.</p>
            ) : (
              <>
                <div className={styles.trendList}>
                  {analytics.fineTrends.map((point) => {
                    const raisedPercent = (Number(point.raisedAmount) / fineTrendMax) * 100
                    const paidPercent = (Number(point.paidAmount) / fineTrendMax) * 100

                    return (
                      <div key={point.month} className={styles.trendItem}>
                        <div className={styles.trendHeader}>
                          <p className={styles.trendMonth}>{point.month}</p>
                          <p className={styles.trendValues}>
                            {formatCurrency(point.paidAmount)} / {formatCurrency(point.raisedAmount)}
                          </p>
                        </div>
                        <div className={styles.trendBarWrap}>
                          <div className={styles.trendTrack}>
                            <div
                              className={`${styles.trendBar} ${styles.raisedBar}`}
                              style={{ width: `${raisedPercent}%` }}
                              title={`Raised: ${formatCurrency(point.raisedAmount)}`}
                            />
                          </div>
                          <div className={styles.trendTrack}>
                            <div
                              className={`${styles.trendBar} ${styles.paidBar}`}
                              style={{ width: `${paidPercent}%` }}
                              title={`Paid: ${formatCurrency(point.paidAmount)}`}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className={styles.trendLegend}>
                  <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.raisedBar}`} />
                    Raised ({formatCurrency(totalRaised)})
                  </span>
                  <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.paidBar}`} />
                    Paid ({formatCurrency(totalPaid)})
                  </span>
                </div>
              </>
            )}
          </section>

        </div>
      </div>
    </DashboardLayout>
  )
}
