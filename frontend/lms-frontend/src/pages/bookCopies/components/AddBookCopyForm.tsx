import { useState } from "react"

import { createBookCopy } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import responsive from "../../../styles/responsive.module.css"

type Props = {
  onClose: () => void
  onCreated?: () => Promise<void> | void
}

export default function AddBookCopyForm({ onClose, onCreated }: Props) {
  const [bookId, setBookId] = useState("")
  const [barcode, setBarcode] = useState("")
  const [rackLocation, setRackLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedBookId = Number(bookId)
    if (!Number.isInteger(parsedBookId) || parsedBookId <= 0) {
      setError("Please enter a valid Book ID")
      return
    }

    try {
      setLoading(true)
      setError("")

      await createBookCopy(parsedBookId, {
        barcode: barcode.trim(),
        rackLocation: rackLocation.trim() || undefined
      })

      if (onCreated) {
        await onCreated()
      }

      onClose()
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to add book copy"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>

      <div>
        <label className="text-sm text-gray-600">Book ID</label>
        <input
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Enter book id"
          required
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Barcode</label>
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Enter barcode"
          required
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Rack Location</label>
        <input
          value={rackLocation}
          onChange={(e) => setRackLocation(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Enter rack location"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className={responsive.formActions}>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#0f1f3d] text-white px-4 py-2 rounded disabled:opacity-70"
        >
          {loading ? "Adding..." : "Add Copy"}
        </button>
      </div>

    </form>
  )
}
