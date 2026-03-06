import type { ReactNode } from "react"
import styles from "./Modal.module.css"
type ModalProps = {
  children: ReactNode
  onClose: () => void
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div className={styles.overlay}>

      {/* Modal container */}
      <div className={styles.content}>

        {/* Close button */}
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          ✕
        </button>

        {children}

      </div>

    </div>
  )
}
