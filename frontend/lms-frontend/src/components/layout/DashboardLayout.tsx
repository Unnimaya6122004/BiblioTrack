import React, { useState } from "react"
import Sidebar from "./Sidebar"
import DashboardNavbar from "./DashboardNavbar"
import styles from "./DashboardLayout.module.css"

type Props = {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {

  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={styles.layout}>

      <Sidebar
        collapsed={collapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className={styles.content}>

        <DashboardNavbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className={styles.main}>
          {children}
        </main>

      </div>

    </div>
  )
}
