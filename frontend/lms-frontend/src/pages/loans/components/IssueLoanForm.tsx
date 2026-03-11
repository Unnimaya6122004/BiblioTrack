import { useEffect, useState } from "react"

import {
  getBookCopies,
  getLoans,
  getReservations,
  getUnpaidFineTotal,
  getUserById,
  getUsers,
  issueLoan,
  type BookCopyDto,
  type ReservationDto
} from "../../../api/lmsApi"
import { ApiError, toErrorMessage } from "../../../utils/api"
import responsive from "../../../styles/responsive.module.css"

type Props = {
  onClose: () => void
  onCreated?: () => Promise<void> | void
}

const PAGE_SIZE = 200

function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}

async function countActiveReservations(userId: number): Promise<number> {
  let count = 0
  let page = 0

  while (true) {
    const response = await getReservations({ page, size: PAGE_SIZE })

    count += response.content.filter(
      (reservation) => reservation.userId === userId && reservation.status === "ACTIVE"
    ).length

    if (count >= 3 || response.last) {
      return count
    }

    page += 1
  }
}

async function countActiveLoans(userId: number): Promise<number> {
  let count = 0
  let page = 0

  while (true) {
    const response = await getLoans({
      status: "ISSUED",
      page,
      size: PAGE_SIZE
    })

    count += response.content.filter((loan) => loan.userId === userId).length

    if (count >= 5 || response.last) {
      return count
    }

    page += 1
  }
}

async function findBookCopyById(bookCopyId: number): Promise<BookCopyDto | null> {
  let page = 0

  while (true) {
    const response = await getBookCopies({ page, size: PAGE_SIZE })
    const match = response.content.find((copy) => copy.id === bookCopyId)

    if (match) {
      return match
    }

    if (response.last) {
      return null
    }

    page += 1
  }
}

function compareReservationOrder(a: ReservationDto, b: ReservationDto): number {
  const aDate = new Date(a.reservationDate).getTime()
  const bDate = new Date(b.reservationDate).getTime()

  if (Number.isFinite(aDate) && Number.isFinite(bDate) && aDate !== bDate) {
    return aDate - bDate
  }

  return a.id - b.id
}

async function findFirstQueuedReservationForBook(
  bookId: number
): Promise<ReservationDto | null> {
  let page = 0
  let firstReservation: ReservationDto | null = null

  while (true) {
    const response = await getReservations({ page, size: PAGE_SIZE })
    const activeForBook = response.content.filter(
      (reservation) => reservation.bookId === bookId && reservation.status === "ACTIVE"
    )

    for (const reservation of activeForBook) {
      if (!firstReservation || compareReservationOrder(reservation, firstReservation) < 0) {
        firstReservation = reservation
      }
    }

    if (response.last) {
      return firstReservation
    }

    page += 1
  }
}

export default function IssueLoanForm({ onClose, onCreated }: Props) {
  const [userId, setUserId] = useState("")
  const [bookCopyId, setBookCopyId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userIdSuggestions, setUserIdSuggestions] = useState<string[]>([])
  const [bookCopyIdSuggestions, setBookCopyIdSuggestions] = useState<string[]>([])

  useEffect(() => {
    let active = true

    const loadSuggestions = async () => {
      try {
        const [usersResponse, copiesResponse] = await Promise.all([
          getUsers({ page: 0, size: 200 }),
          getBookCopies({ page: 0, size: 200 })
        ])

        if (!active) {
          return
        }

        setUserIdSuggestions(
          usersResponse.content.map((user) => String(user.id))
        )
        setBookCopyIdSuggestions(
          copiesResponse.content.map((copy) => String(copy.id))
        )
      } catch {
        if (!active) {
          return
        }

        setUserIdSuggestions([])
        setBookCopyIdSuggestions([])
      }
    }

    void loadSuggestions()

    return () => {
      active = false
    }
  }, [])

  const validateLoanEligibility = async (
    parsedUserId: number,
    parsedBookCopyId: number
  ): Promise<string | null> => {
    try {
      const user = await getUserById(parsedUserId)

      if (user.status === "BLOCKED") {
        return "User is BLOCKED. Cannot issue loan."
      }
    } catch (requestError) {
      if (isNotFoundError(requestError)) {
        return `User not found with id: ${parsedUserId}`
      }

      throw requestError
    }

    const [
      activeReservationCount,
      activeLoanCount,
      unpaidFineTotalRaw,
      bookCopy
    ] = await Promise.all([
      countActiveReservations(parsedUserId),
      countActiveLoans(parsedUserId),
      getUnpaidFineTotal(parsedUserId),
      findBookCopyById(parsedBookCopyId)
    ])

    if (activeReservationCount >= 3) {
      return "User already has maximum active reservations (3)"
    }

    if (activeLoanCount >= 5) {
      return "User already has maximum active loans (5)"
    }

    const unpaidFineTotal = Number(unpaidFineTotalRaw)

    if (!Number.isFinite(unpaidFineTotal)) {
      return "Unable to validate unpaid fine total for this user."
    }

    if (unpaidFineTotal > 500) {
      return "User unpaid fine total exceeds 500. Cannot issue book."
    }

    if (unpaidFineTotal > 0) {
      return "User has unpaid fines. Cannot issue book."
    }

    if (!bookCopy) {
      return `Book copy not found with id: ${parsedBookCopyId}`
    }

    if (bookCopy.status !== "AVAILABLE") {
      return "Book copy is not available"
    }

    const firstQueuedReservation = await findFirstQueuedReservationForBook(bookCopy.bookId)
    if (
      firstQueuedReservation &&
      firstQueuedReservation.userId !== parsedUserId
    ) {
      return `Book is reserved for another user in queue (userId: ${firstQueuedReservation.userId})`
    }

    return null
  }

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

      const eligibilityError = await validateLoanEligibility(parsedUserId, parsedBookCopyId)
      if (eligibilityError) {
        setError(eligibilityError)
        return
      }

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
          list="loan-user-id-suggestions"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <datalist id="loan-user-id-suggestions">
          {userIdSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
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
          list="loan-copy-id-suggestions"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <datalist id="loan-copy-id-suggestions">
          {bookCopyIdSuggestions.map((suggestion) => (
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
          {loading ? "Issuing..." : "Issue Loan"}
        </button>

      </div>

    </form>
  )
}
