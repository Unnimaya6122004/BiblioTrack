import { useEffect, useState } from "react"
import { Layers3, Plus, Search, Trash2 } from "lucide-react"

import DashboardLayout from "../../components/layout/DashboardLayout"
import Table from "../../components/ui/Table/Table"
import AddBookCopyForm from "./components/AddBookCopyForm"
import Modal from "../../components/ui/Modal/Modal"
import ConfirmModal from "../../components/ui/Modal/ConfirmModal"
import { deleteBookCopy, getBookCopies, type BookCopyDto } from "../../api/lmsApi"
import { toErrorMessage } from "../../utils/api"
import useDebouncedValue from "../../hooks/useDebouncedValue"
import pageStyles from "../../styles/adminPage.module.css"

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
          .filter((copy) => copy.barcode.toLowerCase().includes(normalizedSearch))

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
  }, [debouncedSearch, page]) // eslint-disable-line react-hooks/exhaustive-deps

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
            className={`${pageStyles.iconButton} ${pageStyles.dangerIconButton}`}
            aria-label={`Delete copy ${copy.id}`}
          >
            <Trash2 size={16} />
          </button>
        )
      }
    }
  ]

  return (
    <DashboardLayout>
      <div className={pageStyles.page}>

        <section className={pageStyles.hero}>
          <div className={pageStyles.heroContent}>
            <p className={pageStyles.heroEyebrow}>Catalog Control</p>
            <h1 className={pageStyles.heroTitle}>Book Copies</h1>
            <p className={pageStyles.heroSubtitle}>
              Track physical inventory, rack locations, and copy-level statuses.
            </p>
          </div>

          <div className={pageStyles.heroActions}>
            <button
              onClick={() => setOpenModal(true)}
              className={pageStyles.primaryButton}
            >
              <Plus size={16} />
              Add Copy
            </button>
          </div>
        </section>

        <section className={pageStyles.controlsCard}>
          <div className={pageStyles.controlsTopRow}>
            <div className={pageStyles.searchWrap}>
              <Search size={16} className={pageStyles.searchIcon} />
              <input
                value={search}
                onChange={(event) => {
                  setPage(0)
                  setSearch(event.target.value)
                }}
                placeholder="Search by barcode..."
                className={pageStyles.searchInput}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={pageStyles.metaChip}>
                <Layers3 size={13} />
                Showing {copies.length}
              </span>
              <span className={pageStyles.metaChip}>
                Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
              </span>
            </div>
          </div>
        </section>

        {loading && (
          <p className={pageStyles.infoText}>Loading copies...</p>
        )}

        {error && (
          <p className={pageStyles.errorText}>{error}</p>
        )}

        <div className={pageStyles.tableSurface}>
          <Table columns={columns} data={copies} />
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
          <Modal onClose={() => setOpenModal(false)}>
            <h2 className={pageStyles.modalTitle}>
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
      </div>
    </DashboardLayout>
  )
}
