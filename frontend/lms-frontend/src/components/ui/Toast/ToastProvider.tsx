import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react"
import styles from "./ToastProvider.module.css"

type ToastType = "success" | "error" | "info"

type ToastItem = {
  id: number
  type: ToastType
  title: string
  message: string
}

type ToastInput = {
  title?: string
  message: string
}

type ToastContextValue = {
  success: (input: ToastInput | string) => void
  error: (input: ToastInput | string) => void
  info: (input: ToastInput | string) => void
}

const DEFAULT_DISMISS_MS = 3500
const ToastContext = createContext<ToastContextValue | null>(null)

function normalizeInput(input: ToastInput | string, fallbackTitle: string): ToastInput {
  if (typeof input === "string") {
    return {
      title: fallbackTitle,
      message: input
    }
  }

  return {
    title: input.title || fallbackTitle,
    message: input.message
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback((type: ToastType, input: ToastInput | string, fallbackTitle: string) => {
    const normalized = normalizeInput(input, fallbackTitle)
    const id = Date.now() + Math.floor(Math.random() * 1000)

    setToasts((previous) => [
      ...previous,
      {
        id,
        type,
        title: normalized.title ?? fallbackTitle,
        message: normalized.message
      }
    ])

    window.setTimeout(() => {
      removeToast(id)
    }, DEFAULT_DISMISS_MS)
  }, [removeToast])

  const contextValue = useMemo<ToastContextValue>(() => ({
    success: (input) => {
      pushToast("success", input, "Success")
    },
    error: (input) => {
      pushToast("error", input, "Error")
    },
    info: (input) => {
      pushToast("info", input, "Info")
    }
  }), [pushToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div className={styles.container} aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`} role="status">
            <div className={styles.toastContent}>
              <p className={styles.title}>{toast.title}</p>
              <p className={styles.message}>{toast.message}</p>
            </div>

            <button
              type="button"
              className={styles.close}
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }

  return context
}
