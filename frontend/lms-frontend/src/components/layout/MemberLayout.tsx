import type { ReactNode } from "react"
import { useState } from "react"

import MemberSidebar from "./MemberSidebar"
import DashboardNavbar from "./MemberNavbar"

type Props = {
  children: ReactNode
}

export default function MemberLayout({ children }: Props) {

  // Navbar requires these props
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex">

      <MemberSidebar />

      <div className="flex-1 bg-gray-50 min-h-screen">

        <DashboardNavbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className="p-8">
          {children}
        </div>

      </div>

    </div>
  )
}