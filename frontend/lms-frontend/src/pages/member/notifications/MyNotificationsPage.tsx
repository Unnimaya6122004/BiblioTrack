import { useEffect, useState } from "react"
import { Bell, MailOpen } from "lucide-react"

import MemberLayout from "../../../components/layout/MemberLayout"
import {
  getNotifications,
  markNotificationAsRead,
  type NotificationDto
} from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import { emitNotificationsUpdated } from "../../../state/notificationsState"
import styles from "../MemberPages.module.css"

type NotificationCard = {
  id: number
  title: string
  message: string
  createdAt: string
  createdBy: string
  read: boolean
  readAt: string
}

const toDateTime = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  return new Date(value).toLocaleString()
}

export default function MyNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const unreadCount = notifications.filter((notification) => !notification.read).length

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await getNotifications({ page: 0, size: 200 })
        setNotifications(
          response.content.map((item: NotificationDto) => ({
            id: item.id,
            title: item.title,
            message: item.message,
            createdAt: toDateTime(item.createdAt),
            createdBy: item.createdByName ?? "System",
            read: item.read,
            readAt: toDateTime(item.readAt)
          }))
        )
      } catch (requestError) {
        setError(toErrorMessage(requestError, "Failed to load notifications"))
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    void loadNotifications()
  }, [])

  const handleMarkRead = async (notificationId: number) => {
    try {
      setError("")
      const updatedNotification = await markNotificationAsRead(notificationId)
      emitNotificationsUpdated()
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? {
              ...item,
              read: updatedNotification.read,
              readAt: toDateTime(updatedNotification.readAt)
            }
            : item
        )
      )
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to mark notification as read"))
    }
  }

  return (
    <MemberLayout>
      <div className={styles.page}>
        <section className={styles.heroCard}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Member Messages</p>
            <h1 className={styles.heroTitle}>Notifications</h1>
            <p className={styles.heroDescription}>
              Central updates from library administrators and system alerts.
            </p>

            <div className={styles.heroMetaRow}>
              <span className={styles.heroMetaPill}>
                <Bell size={14} />
                Unread {unreadCount}
              </span>
              <span className={styles.heroMetaPill}>
                <MailOpen size={14} />
                Total {notifications.length}
              </span>
            </div>
          </div>
        </section>

        {loading && (
          <p className={`${styles.stateMessage} ${styles.stateInfo}`}>Loading notifications...</p>
        )}

        {error && (
          <p className={`${styles.stateMessage} ${styles.stateError}`}>{error}</p>
        )}

        {notifications.length === 0 ? (
          <div className={styles.emptyCard}>
            No notifications yet.
          </div>
        ) : (
          <div className={styles.notificationList}>
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`${styles.notificationCard} ${
                  notification.read ? "" : styles.notificationCardUnread
                }`}
              >
                <div className={styles.notificationHeader}>
                  <h2 className={styles.notificationTitle}>
                    {notification.title}
                  </h2>
                  <div className={styles.notificationHeaderRight}>
                    <span className={notification.read ? styles.readBadge : styles.unreadBadge}>
                      {notification.read ? "Read" : "Unread"}
                    </span>
                    <p className={styles.notificationDate}>{notification.createdAt}</p>
                  </div>
                </div>

                <p className={styles.notificationMessage}>
                  {notification.message}
                </p>

                <p className={styles.notificationMeta}>
                  Sent by: {notification.createdBy}
                </p>

                <div className={styles.notificationFooter}>
                  {notification.read ? (
                    <p className={styles.notificationMeta}>Read at: {notification.readAt}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        void handleMarkRead(notification.id)
                      }}
                      className={styles.primaryButton}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  )
}
