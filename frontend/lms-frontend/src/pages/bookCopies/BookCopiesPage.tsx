import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import AddBookCopyForm from "./components/AddBookCopyForm"
import Modal from "../../components/ui/Modal/Modal"
import ConfirmModal from "../../components/ui/Modal/ConfirmModal"
import { deleteBookCopy, getBookCopies, type BookCopyDto } from "../../api/lmsApi"
import { toErrorMessage } from "../../utils/api"
import useDebouncedValue from "../../hooks/useDebouncedValue"

type CopyRow = {
  id: number
  book: string
  barcode: string
  rackLocation: string
  status: string
}

export default function BookCopiesPage() {
  const PAGE_SIZE = 10
  const [copies, setCopies] = useState<CopyRow[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const debouncedSearch = useDebouncedValue(search)

  const loadCopies = async () => {
    try {
      setLoading(true)
      setError("")

      const normalizedSearch = debouncedSearch.trim().toLowerCase()

      if (normalizedSearch) {
        const response = await getBookCopies({
          page: 0,
          size: 200
        })

        const mappedCopies = response.content
          .map((copy: BookCopyDto) => ({
            id: copy.id,
            book: copy.bookTitle,
            barcode: copy.barcode,
            rackLocation: copy.rackLocation ?? "-",
            status: copy.status
          }))
          .sort((a, b) => a.id - b.id)
          .filter((copy) =>
            copy.barcode.toLowerCase().includes(normalizedSearch)
          )

        const start = page * PAGE_SIZE
        const end = start + PAGE_SIZE

        setCopies(mappedCopies.slice(start, end))
        setTotalPages(Math.ceil(mappedCopies.length / PAGE_SIZE))
        return
      }

      const response = await getBookCopies({
        page,
        size: PAGE_SIZE
      })

      const mappedCopies = response.content
        .map((copy: BookCopyDto) => ({
          id: copy.id,
          book: copy.bookTitle,
          barcode: copy.barcode,
          rackLocation: copy.rackLocation ?? "-",
          status: copy.status
        }))
        .sort((a, b) => a.id - b.id)

      setCopies(mappedCopies)
      setTotalPages(response.totalPages)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to load book copies"))
      setCopies([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCopies()
  }, [debouncedSearch, page])

  const handleDelete = async (id: number) => {
    try {
      await deleteBookCopy(id)
      await loadCopies()
      setDeleteId(null)
    } catch (requestError) {
      setError(toErrorMessage(requestError, "Failed to delete book copy"))
    }
  }

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Book", accessor: "book" },
    { header: "Barcode ID", accessor: "barcode" },
    { header: "Rack Location", accessor: "rackLocation" },
    { header: "Status", accessor: "status" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: unknown) => {
        const copy = row as CopyRow

        return (
          <button
            type="button"
            onClick={() => setDeleteId(copy.id)}
            className="text-red-500 hover:text-red-700"
            aria-label={`Delete copy ${copy.id}`}
          >
            <Trash2 size={18} />
          </button>
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
            Book Copies
          </h1>

          <p className="text-gray-500">
            Manage physical copies
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-[#0f1f3d] text-white px-4 py-2 rounded-lg hover:bg-[#162a52] transition"
        >
          + Add Copy
        </button>

      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => {
            setPage(0)
            setSearch(e.target.value)
          }}
          placeholder="Search by barcode..."
          className="border px-4 py-2 rounded-lg w-80 outline-none"
        />
      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading copies...</p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* Table */}
      <Table columns={columns} data={copies} />

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

      {/* Add Copy Modal */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>

          <h2 className="text-lg font-semibold mb-6">
            Add Book Copy
          </h2>

          <AddBookCopyForm
            onClose={() => setOpenModal(false)}
            onCreated={loadCopies}
          />

        </Modal>
      )}

      {deleteId !== null && (
        <ConfirmModal
          title="Delete Copy"
          message="Are you sure you want to delete this copy?"
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
