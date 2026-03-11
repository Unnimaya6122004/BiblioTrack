import { useEffect, useState } from "react"

import { createReservation, getBooks, getUsers } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import responsive from "../../../styles/responsive.module.css"

type Props = {
  onClose: () => void
  onCreated?: () => Promise<void> | void
  defaultUserId?: number | null
}

export default function AddReservationForm({ onClose, onCreated, defaultUserId }: Props) {
  const [userId, setUserId] = useState("")
  const [bookId, setBookId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userIdSuggestions, setUserIdSuggestions] = useState<string[]>([])
  const [bookIdSuggestions, setBookIdSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (defaultUserId && defaultUserId > 0) {
      setUserId(String(defaultUserId))
    }
  }, [defaultUserId])

  useEffect(() => {
    let active = true

    const loadSuggestions = async () => {
      try {
        const [usersResponse, booksResponse] = await Promise.all([
          getUsers({ page: 0, size: 200 }),
          getBooks({ page: 0, size: 200 })
        ])

        if (!active) {
          return
        }

        setUserIdSuggestions(usersResponse.content.map((user) => String(user.id)))
        setBookIdSuggestions(booksResponse.content.map((book) => String(book.id)))
      } catch {
        if (!active) {
          return
        }

        setUserIdSuggestions([])
        setBookIdSuggestions([])
      }
    }

    void loadSuggestions()

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedUserId = Number(userId)
    const parsedBookId = Number(bookId)

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      setError("Please enter a valid User ID")
      return
    }

    if (!Number.isInteger(parsedBookId) || parsedBookId <= 0) {
      setError("Please enter a valid Book ID")
      return
    }

    try {
      setLoading(true)
      setError("")

      await createReservation({
        userId: parsedUserId,
        bookId: parsedBookId
      })

      if (onCreated) {
        await onCreated()
      }

      onClose()
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to create reservation"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>

      {/* User */}
      {defaultUserId ? (
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            User ID
          </label>

          <input
            type="text"
            value={userId}
            readOnly
            className="border px-3 py-2 rounded-lg w-full bg-gray-100 text-gray-600"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            User ID
          </label>

          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            list="reservation-user-id-suggestions"
            className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <datalist id="reservation-user-id-suggestions">
            {userIdSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>
      )}

      {/* Book */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Book ID
        </label>

        <input
          type="text"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          placeholder="Enter book ID"
          list="reservation-book-id-suggestions"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <datalist id="reservation-book-id-suggestions">
          {bookIdSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
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
          {loading ? "Creating..." : "Create Reservation"}
        </button>

      </div>

    </form>
  )
}
