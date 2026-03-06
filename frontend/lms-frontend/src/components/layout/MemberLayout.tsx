import type { ReactNode } from "react"
import { useState } from "react"

import MemberSidebar from "./MemberSidebar"
import DashboardNavbar from "./MemberNavbar"
import styles from "./DashboardLayout.module.css"

type Props = {
  children: ReactNode
}

export default function MemberLayout({ children }: Props) {

  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={styles.layout}>

      <MemberSidebar
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

        <div className={styles.main}>
          {children}
        </div>

      </div>

    </div>
  )
}
