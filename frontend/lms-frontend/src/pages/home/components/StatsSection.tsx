import { BookOpen, Users, Clock, Library } from "lucide-react"
import styles from "./StatsSection.module.css"
import responsive from "../../../styles/responsive.module.css"

export default function StatsSection() {

  const stats = [
    {
      value: "12,500+",
      label: "Books Cataloged",
      icon: BookOpen
    },
    {
      value: "3,200+",
      label: "Active Members",
      icon: Users
    },
    {
      value: "25+",
      label: "Years of Service",
      icon: Clock
    },
    {
      value: "5",
      label: "Branches",
      icon: Library
    },
  ]

  return (
    <div className={styles.section}>
      <div className={`${styles.statsGrid} ${responsive.container}`}>

        {stats.map((stat) => {

          const Icon = stat.icon

          return (
            <div key={stat.label} className={styles.card}>

              {/* Icon */}
              <Icon
                size={28}
                className={styles.icon}
              />

              {/* Value */}
              <div className={styles.value}>
                {stat.value}
              </div>

              {/* Label */}
              <div className={styles.label}>
                {stat.label}
              </div>

            </div>
          )
        })}

      </div>
    </div>
  )
}
