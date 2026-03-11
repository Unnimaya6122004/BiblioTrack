import { useEffect, useState } from "react"

import { createReservation, getBooks, getUsers } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

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
      <div className="grid gap-4 md:grid-cols-2">
        {defaultUserId ? (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              User ID
            </label>

            <input
              type="text"
              value={userId}
              readOnly
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              User ID
            </label>

            <input
              type="text"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter user ID"
              list="reservation-user-id-suggestions"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
              required
            />
            <datalist id="reservation-user-id-suggestions">
              {userIdSuggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Book ID
          </label>

          <input
            type="text"
            value={bookId}
            onChange={(event) => setBookId(event.target.value)}
            placeholder="Enter book ID"
            list="reservation-book-id-suggestions"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
            required
          />
          <datalist id="reservation-book-id-suggestions">
            {bookIdSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#0f1f3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#162a52] disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create Reservation"}
        </button>
      </div>
    </form>
  )
}
