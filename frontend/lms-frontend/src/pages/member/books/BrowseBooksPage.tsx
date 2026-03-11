import { useEffect, useState } from "react"
import { Search, BookOpen } from "lucide-react"

import MemberLayout from "../../../components/layout/MemberLayout"
import Table from "../../../components/ui/Table/Table"
import { getBooks, type BookDto } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../api/client"
import useDebouncedValue from "../../../hooks/useDebouncedValue"
import styles from "../MemberPages.module.css"

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

        const response = await getBooks({
          title: debouncedSearch.trim() || undefined,
          page: 0,
          size: 200
        })
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
  }, [debouncedSearch])

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Title", accessor: "title" },
    { header: "ISBN", accessor: "isbn" }
  ]

  return (
    <MemberLayout>

      <div className={styles.page}>
        <section className={styles.heroCard}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Member Catalog</p>
            <h1 className={styles.heroTitle}>Browse Books</h1>
            <p className={styles.heroDescription}>
              Explore titles in the library and quickly search by book name.
            </p>

            <div className={styles.heroMetaRow}>
              <span className={styles.heroMetaPill}>
                <BookOpen size={14} />
                {books.length} visible results
              </span>
            </div>
          </div>
        </section>

        <div className={styles.toolbarRow}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />

            <input
              type="text"
              placeholder="Search books by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {loading && (
          <p className={`${styles.stateMessage} ${styles.stateInfo}`}>Loading books...</p>
        )}

        {error && (
          <p className={`${styles.stateMessage} ${styles.stateError}`}>{error}</p>
        )}

        <section className={styles.tableSection}>
          <Table columns={columns} data={books} />
        </section>
      </div>

    </MemberLayout>
  )
}
