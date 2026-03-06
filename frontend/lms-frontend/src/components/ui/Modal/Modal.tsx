import type { ReactNode } from "react"
type ModalProps = {
  children: ReactNode
  onClose: () => void
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* Modal container */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-[420px] relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {children}

      </div>

    </div>
  )
}