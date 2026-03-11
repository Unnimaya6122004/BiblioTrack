import { useEffect, useState } from "react"

import MemberLayout from "../../../components/layout/MemberLayout"
import {
  getNotifications,
  markNotificationAsRead,
  type NotificationDto
} from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import { emitNotificationsUpdated } from "../../../state/notificationsState"

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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-gray-500">Central messages from library admin</p>
      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading notifications...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-gray-500">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-xl border p-4 shadow-sm ${
                notification.read ? "bg-white" : "bg-blue-50"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-[#0f1f3d]">
                  {notification.title}
                </h2>
                <p className="text-xs text-gray-500">{notification.createdAt}</p>
              </div>

              <p className="mb-3 whitespace-pre-wrap break-words text-sm text-gray-700">
                {notification.message}
              </p>

              <p className="text-xs text-gray-500">
                Sent by: {notification.createdBy}
              </p>

              <div className="mt-3">
                {notification.read ? (
                  <p className="text-xs text-gray-500">Read at: {notification.readAt}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      void handleMarkRead(notification.id)
                    }}
                    className="rounded-md bg-[#0f1f3d] px-3 py-1 text-sm text-white"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </MemberLayout>
  )
}
