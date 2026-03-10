import type { ReactNode } from "react"
import { useEffect, useState } from "react"

import MemberSidebar from "./MemberSidebar"
import DashboardNavbar from "./MemberNavbar"
import styles from "./DashboardLayout.module.css"

type Props = {
  children: ReactNode
}

const SIDEBAR_WIDTH_KEY = "lms.memberSidebarWidth"
const SIDEBAR_COLLAPSED_KEY = "lms.memberSidebarCollapsed"
const DEFAULT_SIDEBAR_WIDTH = 256
const MIN_SIDEBAR_WIDTH = 220
const MAX_SIDEBAR_WIDTH = 420

const clampSidebarWidth = (value: number) =>
  Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, value))

export default function MemberLayout({ children }: Props) {

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SIDEBAR_WIDTH
    }

    const storedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_KEY))

    if (!Number.isFinite(storedWidth)) {
      return DEFAULT_SIDEBAR_WIDTH
    }

    return clampSidebarWidth(storedWidth)
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth))
  }, [sidebarWidth])

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  return (
    <div className={`${styles.layout} app-font`}>

      <MemberSidebar
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className={styles.content}>

        <DashboardNavbar
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
