const NOTIFICATIONS_UPDATED_EVENT = "lms-notifications-updated"

export function emitNotificationsUpdated(): void {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT))
}

export function subscribeNotificationsUpdated(
  listener: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, listener)

  return () => {
    window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, listener)
  }
}
