import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CircleAlert,
  Clock3,
  Search,
  Wallet
} from "lucide-react"

import MemberLayout from "../../../components/layout/MemberLayout"
import StatCard from "../../../components/ui/StatCard/StatCard"
import {
  getFines,
  getLoans,
  getNotifications,
  getReservations,
  getUnreadNotificationCount,
  type NotificationDto
} from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import { formatCurrency, formatDate } from "../../../utils/formatters"
import { getLoggedInUser } from "../../../utils/currentUser"
import styles from "./MemberDashboard.module.css"

type MemberStats = {
  activeLoans: number
  reservations: number
  overdueLoans: number
  outstandingFineAmount: number
  unreadNotifications: number
}

const initialStats: MemberStats = {
  activeLoans: 0,
  reservations: 0,
  overdueLoans: 0,
  outstandingFineAmount: 0,
  unreadNotifications: 0
}

type TimelineItem = {
  id: number
  title: string
  dateLabel: string
}

type NotificationItem = {
  id: number
  title: string
  dateLabel: string
  read: boolean
}

type KpiItem = {
  label: string
  value: string
  percent: number
}

const calculatePercent = (value: number, total: number) => {
  if (total <= 0) {
    return 0
  }

  return Math.min(100, Math.round((value / total) * 100))
}

const toStartOfToday = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

const toDateOrNull = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

const toRecentTimestamp = (value?: string | null) => {
  if (!value) {
    return 0
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 0
  }

  return date.getTime()
}

const toLocalDateTime = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

export default function MemberDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<MemberStats>(initialStats)
  const [memberName, setMemberName] = useState("Member")
  const [dueSoonLoans, setDueSoonLoans] = useState<TimelineItem[]>([])
  const [activeReservations, setActiveReservations] = useState<TimelineItem[]>([])
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([])
  const [notificationTotal, setNotificationTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const onTimeLoansPercent = stats.activeLoans > 0
    ? calculatePercent(stats.activeLoans - stats.overdueLoans, stats.activeLoans)
    : 100
  const dueSoonPercent = calculatePercent(dueSoonLoans.length, stats.activeLoans)
  const notificationReadiness = notificationTotal > 0
    ? calculatePercent(notificationTotal - stats.unreadNotifications, notificationTotal)
    : 100
  const overduePressure = calculatePercent(stats.overdueLoans, stats.activeLoans)
  const fineExposure = Math.min(
    100,
    Math.round((stats.outstandingFineAmount / 2000) * 100)
  )
  const alertDensity = calculatePercent(stats.unreadNotifications, Math.max(notificationTotal, 1))
  const kpiItems: KpiItem[] = [
    {
      label: "On-Time Loans",
      value: `${onTimeLoansPercent}%`,
      percent: onTimeLoansPercent
    },
    {
      label: "Due This Week",
      value: String(dueSoonLoans.length),
      percent: dueSoonPercent
    },
    {
      label: "Notification Readiness",
      value: `${notificationReadiness}%`,
      percent: notificationReadiness
    }
  ]

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError("")

        const user = await getLoggedInUser()

        if (!user) {
          setStats(initialStats)
          setError("Unable to resolve logged in user")
          setDueSoonLoans([])
          setActiveReservations([])
          setRecentNotifications([])
          setNotificationTotal(0)
          return
        }
        const firstName = user.fullName.trim().split(/\s+/)[0]
        setMemberName(firstName || "Member")

        const [loans, reservations, fines] = await Promise.all([
          getLoans(),
          getReservations(),
          getFines()
        ])
        const today = toStartOfToday()
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)

        const myActiveLoans = loans.content.filter(
          (loan) => loan.userId === user.id && loan.status === "ISSUED"
        )
        const overdueLoans = myActiveLoans.filter((loan) => {
          const dueDate = toDateOrNull(loan.dueDate)

          if (!dueDate) {
            return false
          }

          return dueDate < today
        })
        const upcomingDueLoans = myActiveLoans
          .filter((loan) => {
            const dueDate = toDateOrNull(loan.dueDate)

            if (!dueDate) {
              return false
            }

            return dueDate >= today && dueDate <= nextWeek
          })
          .sort((loanA, loanB) => {
            const left = toDateOrNull(loanA.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY
            const right = toDateOrNull(loanB.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY
            return left - right
          })
          .slice(0, 4)
          .map((loan) => ({
            id: loan.id,
            title: loan.bookTitle,
            dateLabel: `Due ${formatDate(loan.dueDate)}`
          }))

        const myActiveReservations = reservations.content.filter(
          (reservation) => reservation.userId === user.id && reservation.status === "ACTIVE"
        )
        const reservationPreview = myActiveReservations
          .sort((left, right) => {
            const leftTime = toDateOrNull(left.reservationDate)?.getTime() ?? 0
            const rightTime = toDateOrNull(right.reservationDate)?.getTime() ?? 0
            return rightTime - leftTime
          })
          .slice(0, 4)
          .map((reservation) => ({
            id: reservation.id,
            title: reservation.bookTitle,
            dateLabel: `Reserved ${formatDate(reservation.reservationDate)}`
          }))

        const myOutstandingFineAmount = fines.content
          .filter((fine) => fine.userId === user.id && fine.status === "UNPAID")
          .reduce((total, fine) => total + Number(fine.amount), 0)
        let unreadNotifications = 0
        let notificationsTotal = 0
        let notifications: NotificationDto[] = []

        try {
          const [unreadCount, notificationResponse] = await Promise.all([
            getUnreadNotificationCount(),
            getNotifications({ page: 0, size: 20 })
          ])
          unreadNotifications = unreadCount
          notificationsTotal = notificationResponse.totalElements
          notifications = notificationResponse.content
        } catch {
          unreadNotifications = 0
          notificationsTotal = 0
          notifications = []
        }

        const recentNotificationPreview = [...notifications]
          .sort((left, right) => toRecentTimestamp(right.createdAt) - toRecentTimestamp(left.createdAt))
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            title: item.title,
            dateLabel: toLocalDateTime(item.createdAt),
            read: item.read
          }))

        setStats({
          activeLoans: myActiveLoans.length,
          reservations: myActiveReservations.length,
          overdueLoans: overdueLoans.length,
          outstandingFineAmount: myOutstandingFineAmount,
          unreadNotifications
        })
        setDueSoonLoans(upcomingDueLoans)
        setActiveReservations(reservationPreview)
        setRecentNotifications(recentNotificationPreview)
        setNotificationTotal(notificationsTotal)
      } catch (requestError) {
        setError(toErrorMessage(requestError, "Failed to load dashboard stats"))
        setStats(initialStats)
        setDueSoonLoans([])
        setActiveReservations([])
        setRecentNotifications([])
        setNotificationTotal(0)
      } finally {
        setLoading(false)
      }
    }

    void loadStats()
  }, [])

  return (
    <MemberLayout>

      <div className={styles.page}>

        <section className={styles.heroCard}>
          <div>
            <p className={styles.heroEyebrow}>Member Overview</p>
            <h1 className={styles.heroTitle}>Welcome back, {memberName}</h1>
            <p className={styles.heroDescription}>
              Track due books, pending reservations, and account alerts from one place.
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
            title="Active Loans"
            value={stats.activeLoans}
            description="Books currently borrowed"
            icon={<BookOpen size={20} />}
          />

          <StatCard
            title="Reservations"
            value={stats.reservations}
            description="Active reservation requests"
            icon={<CalendarCheck size={20} />}
          />

          <StatCard
            title="Overdue Loans"
            value={stats.overdueLoans}
            description="Returned late and pending"
            icon={<Clock3 size={20} />}
          />

          <StatCard
            title="Outstanding Fines"
            value={formatCurrency(stats.outstandingFineAmount)}
            description="Unpaid fine amount"
            icon={<Wallet size={20} />}
          />

          <StatCard
            title="Unread Alerts"
            value={stats.unreadNotifications}
            description="Notification items not read"
            icon={<Bell size={20} />}
          />

        </div>

        <div className={styles.secondaryGrid}>
          <section className={styles.panelCard}>
            <h2 className={styles.panelTitle}>Quick Actions</h2>
            <p className={styles.panelSubtitle}>Jump into the tasks you use most</p>

            <div className={styles.actionList}>
              <button
                type="button"
                onClick={() => navigate("/member/books")}
                className={styles.actionButton}
              >
                <Search size={16} />
                Browse books
              </button>
              <button
                type="button"
                onClick={() => navigate("/member/loans")}
                className={styles.actionButton}
              >
                <BookOpen size={16} />
                View my loans
              </button>
              <button
                type="button"
                onClick={() => navigate("/member/reservations")}
                className={styles.actionButton}
              >
                <CalendarCheck size={16} />
                Manage reservations
              </button>
              <button
                type="button"
                onClick={() => navigate("/member/fines")}
                className={styles.actionButton}
              >
                <Wallet size={16} />
                Review fines
              </button>
            </div>
          </section>

          <section className={styles.panelCard}>
            <h2 className={styles.panelTitle}>Account Pulse</h2>
            <p className={styles.panelSubtitle}>A quick health snapshot for your account</p>

            <div className={styles.pulseList}>
              <div className={styles.pulseItem}>
                <div className={styles.pulseHeader}>
                  <span>Overdue pressure</span>
                  <strong>{overduePressure}%</strong>
                </div>
                <div className={styles.progressTrack}>
                  <span className={styles.overdueBar} style={{ width: `${overduePressure}%` }} />
                </div>
              </div>

              <div className={styles.pulseItem}>
                <div className={styles.pulseHeader}>
                  <span>Fine exposure</span>
                  <strong>{formatCurrency(stats.outstandingFineAmount)}</strong>
                </div>
                <div className={styles.progressTrack}>
                  <span className={styles.fineBar} style={{ width: `${fineExposure}%` }} />
                </div>
              </div>

              <div className={styles.pulseItem}>
                <div className={styles.pulseHeader}>
                  <span>Unread alerts</span>
                  <strong>{stats.unreadNotifications}</strong>
                </div>
                <div className={styles.progressTrack}>
                  <span className={styles.alertBar} style={{ width: `${alertDensity}%` }} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.feedGrid}>
          <section className={styles.feedCard}>
            <h2 className={styles.feedTitle}>Due This Week</h2>
            <p className={styles.feedSubtitle}>Books that need attention soon</p>

            {dueSoonLoans.length === 0 ? (
              <p className={styles.emptyState}>No books are due in the next 7 days.</p>
            ) : (
              <ul className={styles.feedList}>
                {dueSoonLoans.map((loan) => (
                  <li key={loan.id} className={styles.feedItem}>
                    <p className={styles.feedItemTitle}>{loan.title}</p>
                    <p className={styles.feedItemMeta}>{loan.dateLabel}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.feedCard}>
            <h2 className={styles.feedTitle}>Active Reservations</h2>
            <p className={styles.feedSubtitle}>Your latest active requests</p>

            {activeReservations.length === 0 ? (
              <p className={styles.emptyState}>No active reservations at the moment.</p>
            ) : (
              <ul className={styles.feedList}>
                {activeReservations.map((reservation) => (
                  <li key={reservation.id} className={styles.feedItem}>
                    <p className={styles.feedItemTitle}>{reservation.title}</p>
                    <p className={styles.feedItemMeta}>{reservation.dateLabel}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.feedCard}>
            <h2 className={styles.feedTitle}>Recent Notifications</h2>
            <p className={styles.feedSubtitle}>Latest updates from the library team</p>

            {recentNotifications.length === 0 ? (
              <p className={styles.emptyState}>No notifications yet.</p>
            ) : (
              <ul className={styles.feedList}>
                {recentNotifications.map((item) => (
                  <li key={item.id} className={styles.feedItem}>
                    <div className={styles.notificationHeader}>
                      <p className={styles.feedItemTitle}>{item.title}</p>
                      <span
                        className={item.read ? styles.readBadge : styles.unreadBadge}
                      >
                        {item.read ? "Read" : "Unread"}
                      </span>
                    </div>
                    <p className={styles.feedItemMeta}>{item.dateLabel}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {stats.overdueLoans > 0 || stats.outstandingFineAmount > 0 ? (
          <div className={styles.noticeCard}>
            <CircleAlert size={17} />
            <p>
              Action needed: clear overdue loans and unpaid fines to keep borrowing uninterrupted.
            </p>
          </div>
        ) : (
          <div className={styles.noticeCardSuccess}>
            <CircleAlert size={17} />
            <p>Your account is in good standing. Keep up the great reading rhythm.</p>
          </div>
        )}

      </div>

    </MemberLayout>
  )
}
