import React, { useState } from "react"
import Sidebar from "./Sidebar"
import DashboardNavbar from "./DashboardNavbar"

type Props = {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {

  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex">

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1">

        <DashboardNavbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main className="p-6 bg-gray-50 min-h-screen">
          {children}
        </main>

      </div>

    </div>
  )
}