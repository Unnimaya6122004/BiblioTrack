import { useEffect, useMemo, useState, type FormEvent } from "react"
import { BellRing, Layers3, Search, Send } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  type NotificationDto
} from "../../api/lmsApi"
import { toErrorMessage } from "../../api/client"
import { emitNotificationsUpdated } from "../../state/notificationsState"
import pageStyles from "../../styles/adminPage.module.css"

type NotificationRow = {
  id: number
  title: string
  message: string
  createdAt: string
  createdBy: string
  status: string
  read: boolean
  readAt: string
}

const toDateTime = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  return new Date(value).toLocaleString()
}

export default function NotificationsPage() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [search, setSearch] = useState("")
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
          status: item.read ? "READ" : "UNREAD",
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

  useEffect(() => {
    void loadNotifications()
  }, [])

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setSubmitting(true)
      setError("")
      setSuccess("")

      await createNotification({
        title: title.trim(),
        message: message.trim()
      })

      setTitle("")
      setMessage("")
      setSuccess("Notification sent successfully.")
      emitNotificationsUpdated()
      await loadNotifications()
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to send notification"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkRead = async (id: number) => {
    try {
      setError("")
      setSuccess("")
      await markNotificationAsRead(id)
      emitNotificationsUpdated()
      await loadNotifications()
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to mark notification as read"))
    }
  }

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return notifications
    }

    return notifications.filter((item) =>
      String(item.id).includes(normalizedSearch) ||
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.message.toLowerCase().includes(normalizedSearch) ||
      item.createdBy.toLowerCase().includes(normalizedSearch) ||
      item.status.toLowerCase().includes(normalizedSearch) ||
      item.createdAt.toLowerCase().includes(normalizedSearch)
    )
  }, [notifications, search])

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Date", accessor: "createdAt" },
    { header: "Title", accessor: "title" },
    {
      header: "Message",
      accessor: "message",
      render: (row: unknown) => {
        const notification = row as NotificationRow

        return (
          <p className="max-w-xl whitespace-pre-wrap break-words text-sm text-slate-700">
            {notification.message}
          </p>
        )
      }
    },
    { header: "Sent By", accessor: "createdBy" },
    { header: "Status", accessor: "status" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: unknown) => {
        const notification = row as NotificationRow

        if (notification.read) {
          return <span className="text-xs text-slate-500">Read at {notification.readAt}</span>
        }

        return (
          <button
            type="button"
            onClick={() => {
              void handleMarkRead(notification.id)
            }}
            className={pageStyles.actionLink}
          >
            Mark as Read
          </button>
        )
      }
    }
  ]

  const unreadCount = notifications.filter((item) => !item.read).length

  return (
    <DashboardLayout>
      <div className={pageStyles.page}>

        <section className={pageStyles.hero}>
          <div className={pageStyles.heroContent}>
            <p className={pageStyles.heroEyebrow}>Communication Center</p>
            <h1 className={pageStyles.heroTitle}>Notifications</h1>
            <p className={pageStyles.heroSubtitle}>
              Send centralized updates and monitor read/unread communication status.
            </p>
          </div>

          <div className={pageStyles.heroActions}>
            <span className={pageStyles.metaChip}>
              <BellRing size={13} />
              Unread {unreadCount}
            </span>
          </div>
        </section>

        <form onSubmit={handleSend} className={pageStyles.formCard}>
          <h2 className={pageStyles.formTitle}>Send New Notification</h2>

          <div className={pageStyles.formGrid}>
            <div>
              <label className={pageStyles.label}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Library notice title"
                className={pageStyles.input}
                maxLength={150}
                required
              />
            </div>

            <div>
              <label className={pageStyles.label}>Message</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write the message members should receive..."
                className={`${pageStyles.input} ${pageStyles.textArea}`}
                maxLength={2000}
                required
              />
            </div>
          </div>

          <div className="mt-3">
            <button
              type="submit"
              disabled={submitting}
              className={pageStyles.primaryButton}
            >
              <Send size={15} />
              {submitting ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>

        <section className={pageStyles.controlsCard}>
          <div className={pageStyles.controlsTopRow}>
            <div className={pageStyles.searchWrap}>
              <Search size={16} className={pageStyles.searchIcon} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, message, sender, status..."
                className={pageStyles.searchInput}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={pageStyles.metaChip}>
                <Layers3 size={13} />
                Showing {filteredNotifications.length}
              </span>
              <span className={pageStyles.metaChip}>Total {notifications.length}</span>
            </div>
          </div>
        </section>

        {loading && (
          <p className={pageStyles.infoText}>Loading notifications...</p>
        )}

        {error && (
          <p className={pageStyles.errorText}>{error}</p>
        )}

        {success && (
          <p className={pageStyles.successText}>{success}</p>
        )}

        <div className={pageStyles.tableSurface}>
          <Table columns={columns} data={filteredNotifications} />
        </div>
      </div>
    </DashboardLayout>
  )
}
