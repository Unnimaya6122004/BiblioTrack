import Modal from "./Modal"

type ConfirmModalProps = {
  title: string
  message: string
  errorMessage?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  message,
  errorMessage,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel
}: ConfirmModalProps) {

  return (
    <Modal onClose={onCancel}>

      <h2 className="text-lg font-semibold mb-4">
        {title}
      </h2>

      <p className="text-gray-600 mb-6">
        {message}
      </p>

      {errorMessage && (
        <p className="text-sm text-red-600 mb-4">
          {errorMessage}
        </p>
      )}

      <div className="flex justify-end gap-3">

        <button
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          {cancelText}
        </button>

        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          {confirmText}
        </button>

      </div>

    </Modal>
  )
}
