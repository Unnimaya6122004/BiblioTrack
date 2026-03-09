import { useState } from "react"

import { issueLoan } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import responsive from "../../../styles/responsive.module.css"

type Props = {
  onClose: () => void
  onCreated?: () => Promise<void> | void
}

export default function IssueLoanForm({ onClose, onCreated }: Props) {
  const [userId, setUserId] = useState("")
  const [bookCopyId, setBookCopyId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedUserId = Number(userId)
    const parsedBookCopyId = Number(bookCopyId)

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      setError("Please enter a valid User ID")
      return
    }

    if (!Number.isInteger(parsedBookCopyId) || parsedBookCopyId <= 0) {
      setError("Please enter a valid Book Copy ID")
      return
    }

    try {
      setLoading(true)
      setError("")

      await issueLoan({
        userId: parsedUserId,
        bookCopyId: parsedBookCopyId
      })

      if (onCreated) {
        await onCreated()
      }

      onClose()
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to issue loan"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>

      {/* User */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          User ID
        </label>

        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Book Copy */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Book Copy ID
        </label>

        <input
          type="text"
          value={bookCopyId}
          onChange={(e) => setBookCopyId(e.target.value)}
          placeholder="Enter book copy ID"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Buttons */}
      <div className={responsive.formActions}>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="border px-4 py-2 rounded-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#0f1f3d] text-white px-4 py-2 rounded-lg hover:bg-[#162a52] disabled:opacity-70"
        >
          {loading ? "Issuing..." : "Issue Loan"}
        </button>

      </div>

    </form>
  )
}
