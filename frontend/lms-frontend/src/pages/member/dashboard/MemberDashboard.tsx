import { useEffect, useState } from "react"

import MemberLayout from "../../../components/layout/MemberLayout"
import StatCard from "../../../components/ui/StatCard/StatCard"

import { BookOpen, CalendarCheck, AlertTriangle } from "lucide-react"
import { getFines, getLoans, getReservations } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import { formatCurrency } from "../../../utils/formatters"
import { getLoggedInUser } from "../../../utils/currentUser"

type MemberStats = {
  activeLoans: number
  reservations: number
  outstandingFines: string
}

const initialStats: MemberStats = {
  activeLoans: 0,
  reservations: 0,
  outstandingFines: formatCurrency(0)
}

export default function MemberDashboard() {
  const [stats, setStats] = useState<MemberStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError("")

        const user = await getLoggedInUser()

        if (!user) {
          setStats(initialStats)
          setError("Unable to resolve logged in user")
          return
        }

        const [loans, reservations, fines] = await Promise.all([
          getLoans(),
          getReservations(),
          getFines()
        ])

        const myActiveLoans = loans.content.filter(
          (loan) => loan.userId === user.id && loan.status === "ISSUED"
        ).length

        const myActiveReservations = reservations.content.filter(
          (reservation) => reservation.userId === user.id && reservation.status === "ACTIVE"
        ).length

        const myOutstandingFineAmount = fines.content
          .filter((fine) => fine.userId === user.id && fine.status === "UNPAID")
          .reduce((total, fine) => total + Number(fine.amount), 0)

        setStats({
          activeLoans: myActiveLoans,
          reservations: myActiveReservations,
          outstandingFines: formatCurrency(myOutstandingFineAmount)
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
    <MemberLayout>

      <h1 className="text-2xl font-semibold mb-6">
        Member Dashboard
      </h1>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading dashboard...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-3 gap-6">

        <StatCard
          title="Active Loans"
          value={stats.activeLoans}
          description="Books currently borrowed"
          icon={<BookOpen size={20} />}
        />

        <StatCard
          title="Reservations"
          value={stats.reservations}
          description="Books reserved"
          icon={<CalendarCheck size={20} />}
        />

        <StatCard
          title="Outstanding Fines"
          value={stats.outstandingFines}
          description="Pending fine amount"
          icon={<AlertTriangle size={20} />}
        />

      </div>

    </MemberLayout>
  )
}
