import { useState } from "react"

import MemberLayout from "../../../components/layout/MemberLayout"
import Table from "../../../components/ui/Table/Table"

type Book = {
  id: number
  title: string
  isbn: string
}

export default function BrowseBooksPage() {

  const [search, setSearch] = useState("")

  const books: Book[] = []

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Title", accessor: "title" },
    { header: "ISBN", accessor: "isbn" }
  ]

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <MemberLayout>

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-2xl font-serif font-semibold">
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

      {/* Table */}
      <Table columns={columns} data={filteredBooks} />

    </MemberLayout>
  )
}