import DashboardLayout from "../../components/layout/DashboardLayout"
import StatCard from "../../components/ui/StatCard/StatCard"
import QuickActions from "./components/QuickActions"
import SystemStatus from "./components/SystemStatus"

import {
  BookOpen,
  Users,
  Repeat,
  CalendarCheck,
  AlertTriangle
} from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500">
          Overview of your library system
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6 mb-8">

        <StatCard
          title="Total Books"
          value={0}
          description="In catalog"
          icon={<BookOpen size={20} />}
        />

        <StatCard
          title="Total Users"
          value={0}
          description="Registered members"
          icon={<Users size={20} />}
        />

        <StatCard
          title="Active Loans"
          value={0}
          description="Currently issued"
          icon={<Repeat size={20} />}
        />

        <StatCard
          title="Reservations"
          value={0}
          description="Pending requests"
          icon={<CalendarCheck size={20} />}
        />

        <StatCard
          title="Unpaid Fines"
          value={0}
          description="Awaiting payment"
          icon={<AlertTriangle size={20} />}
        />

      </div>

      <div className="grid grid-cols-2 gap-6">
        <QuickActions />
        <SystemStatus />
      </div>

    </DashboardLayout>
  )
}