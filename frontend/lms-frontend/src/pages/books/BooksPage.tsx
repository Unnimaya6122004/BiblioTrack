import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import Modal from "../../components/ui/Modal/Modal"
import ConfirmModal from "../../components/ui/Modal/ConfirmModal"

import AddBookForm from "./components/AddBookForm"
import {
  deleteBook,
  getAuthors,
  getBooks,
  getCategories,
  type AuthorDto,
  type BookDto,
  type CategoryDto
} from "../../api/lmsApi"
import { toErrorMessage } from "../../utils/api"
import { formatDate } from "../../utils/formatters"
import useDebouncedValue from "../../hooks/useDebouncedValue"
import {
  decodeToken,
  extractRoleFromPayload,
  getStoredRole,
  getStoredToken
} from "../../state/authState"

type BookRow = {
  id: number
  title: string
  isbn: string
  createdAt: string
}

export default function BooksPage() {

  const [openModal, setOpenModal] = useState(false)
  const [books, setBooks] = useState<BookRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingBook, setEditingBook] = useState<BookRow | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [authors, setAuthors] = useState<AuthorDto[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [selectedAuthor, setSelectedAuthor] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const debouncedSearch = useDebouncedValue(search)

  const token = getStoredToken()
  const role = getStoredRole() ?? extractRoleFromPayload(token ? decodeToken(token) : null)
  const isAdmin = role === "ADMIN"

  const loadBooks = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await getBooks({
        title: debouncedSearch.trim() || undefined,
        author: selectedAuthor || undefined,
        category: selectedCategory || undefined,
        page,
        size: 10
      })

      const mappedBooks = response.content
        .map((book: BookDto) => ({
          id: book.id,
          title: book.title,
          isbn: book.isbn ?? "-",
          createdAt: formatDate(book.createdAt)
        }))
        .sort((a, b) => a.id - b.id)

      setBooks(mappedBooks)
      setTotalPages(response.totalPages)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to load books"))
      setBooks([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    try {
      const [authorsData, categoriesData] = await Promise.all([
        getAuthors(),
        getCategories()
      ])

      setAuthors(authorsData)
      setCategories(categoriesData)
    } catch {
      setAuthors([])
      setCategories([])
    }
  }

  useEffect(() => {
    void loadFilterOptions()
  }, [])

  useEffect(() => {
    void loadBooks()
  }, [debouncedSearch, page, selectedAuthor, selectedCategory])

  const handleDelete = async (id: number) => {
    if (!isAdmin) {
      return
    }

    try {
      await deleteBook(id)
      await loadBooks()
      setDeleteId(null)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to delete book"))
    }
  }

  const openCreateModal = () => {
    setEditingBook(null)
    setOpenModal(true)
  }

  const openEditModal = (book: BookRow) => {
    if (!isAdmin) {
      return
    }

    setEditingBook(book)
    setOpenModal(true)
  }

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Title", accessor: "title" },
    { header: "ISBN", accessor: "isbn" },
    { header: "Created", accessor: "createdAt" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: unknown) => {
        const book = row as BookRow

        if (!isAdmin) {
          return <span className="text-sm text-gray-400">No action</span>
        }

        return (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => openEditModal(book)}
              className="text-blue-600 hover:text-blue-800"
              aria-label={`Edit book ${book.title}`}
            >
              <Pencil size={18} />
            </button>

            <button
              type="button"
              onClick={() => setDeleteId(book.id)}
              className="text-red-500 hover:text-red-700"
              aria-label={`Delete book ${book.title}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        )
      }
    }
  ]

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-semibold">
            Books
          </h1>

          <p className="text-gray-500">
            Manage library books
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="bg-[#0f1f3d] text-white px-4 py-2 rounded-lg hover:bg-[#162a52] transition"
          >
            + Add Book
          </button>
        )}

      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setPage(0)
            setSearch(e.target.value)
          }}
          className="border px-4 py-2 rounded-lg w-80 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6 flex gap-3">
        <select
          value={selectedAuthor}
          onChange={(e) => {
            setPage(0)
            setSelectedAuthor(e.target.value)
          }}
          className="w-56 border border-gray-300 bg-white px-4 py-2 rounded-lg text-gray-700 shadow-sm outline-none transition-all hover:border-[#162a52] focus:border-gray-300 focus:ring-0"
        >
          <option value="">Filter by Author</option>
          {authors.map((author) => (
            <option key={author.id} value={author.name}>
              {author.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setPage(0)
            setSelectedCategory(e.target.value)
          }}
          className="w-56 border border-gray-300 bg-white px-4 py-2 rounded-lg text-gray-700 shadow-sm outline-none transition-all hover:border-[#162a52] focus:border-gray-300 focus:ring-0"
        >
          <option value="">Filter by Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading books...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* Table */}
      <Table columns={columns} data={books} />

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0}
          className="border px-3 py-2 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setPage(index)}
              className={`px-3 py-1 rounded-lg border ${
                page === index ? "bg-[#0f1f3d] text-white" : "bg-white"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={totalPages === 0 || page >= totalPages - 1}
          className="border px-3 py-2 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Add/Edit Book Modal */}
      {openModal && (
        <Modal
          onClose={() => {
            setOpenModal(false)
            setEditingBook(null)
          }}
        >

          <h2 className="text-lg font-semibold mb-6">
            {editingBook ? "Edit Book" : "Add New Book"}
          </h2>

          <AddBookForm
            editingBook={editingBook}
            onClose={() => {
              setOpenModal(false)
              setEditingBook(null)
            }}
            onCreated={loadBooks}
          />

        </Modal>
      )}

      {deleteId !== null && (
        <ConfirmModal
          title="Delete Book"
          message="Are you sure you want to delete this book?"
          confirmText="Delete"
          cancelText="Cancel"
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            void handleDelete(deleteId)
          }}
        />
      )}

    </DashboardLayout>
  )
}
