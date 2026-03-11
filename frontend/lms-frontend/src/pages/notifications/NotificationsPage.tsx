import { useEffect, useState, type FormEvent } from "react"

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
          <p className="max-w-xl whitespace-pre-wrap break-words text-sm text-gray-700">
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
          return <span className="text-xs text-gray-500">Read at {notification.readAt}</span>
        }

        return (
          <button
            type="button"
            onClick={() => {
              void handleMarkRead(notification.id)
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Mark as Read
          </button>
        )
      }
    }
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-gray-500">Send centralized messages to all members</p>
      </div>

      <form onSubmit={handleSend} className="mb-8 rounded-xl border bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold">Send New Notification</h2>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-600">Title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Library notice title"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={150}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-600">Message</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write the message members should receive..."
              className="min-h-32 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={2000}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#0f1f3d] px-4 py-2 text-white disabled:opacity-70"
        >
          {submitting ? "Sending..." : "Send Notification"}
        </button>
      </form>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading notifications...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p className="mb-4 text-sm text-green-700">{success}</p>
      )}

      <Table columns={columns} data={notifications} />
    </DashboardLayout>
  )
}
