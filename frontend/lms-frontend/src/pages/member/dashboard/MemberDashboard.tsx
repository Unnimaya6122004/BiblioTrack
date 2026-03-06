import MemberLayout from "../../../components/layout/MemberLayout"
import StatCard from "../../../components/ui/StatCard/StatCard"

import { BookOpen, CalendarCheck, AlertTriangle } from "lucide-react"

export default function MemberDashboard() {

  return (
    <MemberLayout>

      <h1 className="text-2xl font-serif font-semibold mb-6">
        Member Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <StatCard
          title="Active Loans"
          value="0"
          description="Books currently borrowed"
          icon={<BookOpen size={20} />}
        />

        <StatCard
          title="Reservations"
          value="0"
          description="Books reserved"
          icon={<CalendarCheck size={20} />}
        />

        <StatCard
          title="Outstanding Fines"
          value="$0"
          description="Pending fine amount"
          icon={<AlertTriangle size={20} />}
        />

      </div>

    </MemberLayout>
  )
}