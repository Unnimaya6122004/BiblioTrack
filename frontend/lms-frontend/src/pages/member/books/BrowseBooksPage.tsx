import { useEffect, useMemo, useState } from "react"

import MemberLayout from "../../../components/layout/MemberLayout"
import Table from "../../../components/ui/Table/Table"
import { getBooks, type BookDto } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import useDebouncedValue from "../../../hooks/useDebouncedValue"

type BookRow = {
  id: number
  title: string
  isbn: string
}

export default function BrowseBooksPage() {

  const [search, setSearch] = useState("")
  const [books, setBooks] = useState<BookRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await getBooks()
        setBooks(
          response.content.map((book: BookDto) => ({
            id: book.id,
            title: book.title,
            isbn: book.isbn ?? "-"
          }))
        )
      } catch (requestError) {
        setError(toErrorMessage(requestError, "Failed to load books"))
        setBooks([])
      } finally {
        setLoading(false)
      }
    }

    void loadBooks()
  }, [])

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Title", accessor: "title" },
    { header: "ISBN", accessor: "isbn" }
  ]

  const filteredBooks = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase()

    if (!normalizedSearch) {
      return books
    }

    return books.filter((book) =>
      book.title.toLowerCase().includes(normalizedSearch)
    )
  }, [books, debouncedSearch])

  return (
    <MemberLayout>

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-2xl font-semibold">
          Browse Books
        </h1>

        <p className="text-gray-500">
          Explore books available in the library
        </p>

      </div>

      {/* Search */}
      <div className="mb-6">

        <input
          type="text"
          placeholder="Search books by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-80 outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading books...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* Table */}
      <Table columns={columns} data={filteredBooks} />

    </MemberLayout>
  )
}
