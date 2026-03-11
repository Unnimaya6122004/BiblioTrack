import { useEffect, useState } from "react"
import { Layers3, Pencil, Plus, Search, Trash2 } from "lucide-react"

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
import pageStyles from "../../styles/adminPage.module.css"

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
  }, [debouncedSearch, page, selectedAuthor, selectedCategory]) // eslint-disable-line react-hooks/exhaustive-deps

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
          return <span className="text-xs text-slate-400">No action</span>
        }

        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openEditModal(book)}
              className={pageStyles.iconButton}
              aria-label={`Edit book ${book.title}`}
            >
              <Pencil size={14} />
            </button>

            <button
              type="button"
              onClick={() => setDeleteId(book.id)}
              className={`${pageStyles.iconButton} ${pageStyles.dangerIconButton}`}
              aria-label={`Delete book ${book.title}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      }
    }
  ]

  return (
    <DashboardLayout>
      <div className={pageStyles.page}>

        <section className={pageStyles.hero}>
          <div className={pageStyles.heroContent}>
            <p className={pageStyles.heroEyebrow}>Catalog Library</p>
            <h1 className={pageStyles.heroTitle}>Books</h1>
            <p className={pageStyles.heroSubtitle}>
              Manage titles, ISBN records, and searchable catalog metadata.
            </p>
          </div>

          {isAdmin && (
            <div className={pageStyles.heroActions}>
              <button
                onClick={openCreateModal}
                className={pageStyles.primaryButton}
              >
                <Plus size={16} />
                Add Book
              </button>
            </div>
          )}
        </section>

        <section className={pageStyles.controlsCard}>
          <div className={pageStyles.controlsTopRow}>
            <div className={pageStyles.searchWrap}>
              <Search size={16} className={pageStyles.searchIcon} />
              <input
                placeholder="Search by title..."
                value={search}
                onChange={(event) => {
                  setPage(0)
                  setSearch(event.target.value)
                }}
                className={pageStyles.searchInput}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={pageStyles.metaChip}>
                <Layers3 size={13} />
                Showing {books.length}
              </span>
              <span className={pageStyles.metaChip}>
                Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
              </span>
            </div>
          </div>

          <div className={pageStyles.selectRow}>
            <select
              value={selectedAuthor}
              onChange={(event) => {
                setPage(0)
                setSelectedAuthor(event.target.value)
              }}
              className={pageStyles.selectInput}
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
              onChange={(event) => {
                setPage(0)
                setSelectedCategory(event.target.value)
              }}
              className={pageStyles.selectInput}
            >
              <option value="">Filter by Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading && (
          <p className={pageStyles.infoText}>Loading books...</p>
        )}

        {error && (
          <p className={pageStyles.errorText}>{error}</p>
        )}

        <div className={pageStyles.tableSurface}>
          <Table columns={columns} data={books} />
        </div>

        <div className={pageStyles.pagination}>
          <button
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
            className={pageStyles.pageNavButton}
          >
            Previous
          </button>

          <div className={pageStyles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setPage(index)}
                className={`${pageStyles.pageNumber} ${page === index ? pageStyles.pageNumberActive : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={totalPages === 0 || page >= totalPages - 1}
            className={pageStyles.pageNavButton}
          >
            Next
          </button>
        </div>

        {openModal && (
          <Modal
            onClose={() => {
              setOpenModal(false)
              setEditingBook(null)
            }}
          >
            <h2 className={pageStyles.modalTitle}>
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
      </div>
    </DashboardLayout>
  )
}
