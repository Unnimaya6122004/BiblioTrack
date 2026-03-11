import { useEffect, useState } from "react"

import { createBookCopy, getBookCopies, getBooks } from "../../../api/lmsApi"
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
  const [bookIdSuggestions, setBookIdSuggestions] = useState<string[]>([])
  const [barcodeSuggestions, setBarcodeSuggestions] = useState<string[]>([])
  const [rackLocationSuggestions, setRackLocationSuggestions] = useState<string[]>([])

  useEffect(() => {
    let active = true

    const loadSuggestions = async () => {
      try {
        const [booksResponse, copiesResponse] = await Promise.all([
          getBooks({ page: 0, size: 200 }),
          getBookCopies({ page: 0, size: 200 })
        ])

        if (!active) {
          return
        }

        const uniqueBookIds = Array.from(
          new Set(booksResponse.content.map((book) => String(book.id)))
        )
        const uniqueBarcodes = Array.from(
          new Set(
            copiesResponse.content
              .map((copy) => copy.barcode.trim())
              .filter((value) => value.length > 0)
          )
        )
        const uniqueRackLocations = Array.from(
          new Set(
            copiesResponse.content
              .map((copy) => copy.rackLocation?.trim() ?? "")
              .filter((value) => value.length > 0)
          )
        )

        setBookIdSuggestions(uniqueBookIds)
        setBarcodeSuggestions(uniqueBarcodes)
        setRackLocationSuggestions(uniqueRackLocations)
      } catch {
        if (!active) {
          return
        }

        setBookIdSuggestions([])
        setBarcodeSuggestions([])
        setRackLocationSuggestions([])
      }
    }

    void loadSuggestions()

    return () => {
      active = false
    }
  }, [])

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
          list="copy-book-id-suggestions"
          required
        />
        <datalist id="copy-book-id-suggestions">
          {bookIdSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="text-sm text-gray-600">Barcode</label>
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Enter barcode"
          list="copy-barcode-suggestions"
          required
        />
        <datalist id="copy-barcode-suggestions">
          {barcodeSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="text-sm text-gray-600">Rack Location</label>
        <input
          value={rackLocation}
          onChange={(e) => setRackLocation(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Enter rack location"
          list="copy-rack-location-suggestions"
        />
        <datalist id="copy-rack-location-suggestions">
          {rackLocationSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
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
