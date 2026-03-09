import { useEffect, useState } from "react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import StatCard from "../../components/ui/StatCard/StatCard"
import QuickActions from "./components/QuickActions"
import SystemStatus from "./components/SystemStatus"
import styles from "./DashboardPage.module.css"

import {
  BookOpen,
  Users,
  Repeat,
  CalendarCheck,
  AlertTriangle
} from "lucide-react"
import {
  getBooks,
  getFines,
  getLoans,
  getReservations,
  getUsers
} from "../../api/lmsApi"
import { toErrorMessage } from "../../api/client"

type DashboardStats = {
  totalBooks: number
  totalUsers: number
  activeLoans: number
  reservations: number
  unpaidFines: number
}

const initialStats: DashboardStats = {
  totalBooks: 0,
  totalUsers: 0,
  activeLoans: 0,
  reservations: 0,
  unpaidFines: 0
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
      } catch (requestError) {
        setError(toErrorMessage(requestError, "Failed to load dashboard stats"))
        setStats(initialStats)
      } finally {
        setLoading(false)
      }
    }

    void loadStats()
  }, [])

  return (
    <DashboardLayout>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500">
          Overview of your library system
        </p>
      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading dashboard...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
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

    </DashboardLayout>
  )
}
