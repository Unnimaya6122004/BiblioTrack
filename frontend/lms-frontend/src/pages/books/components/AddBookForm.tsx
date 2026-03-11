import { useEffect, useState } from "react"
import {
  createBook,
  getAuthors,
  getBooks,
  getCategories,
  type AuthorDto,
  type CategoryDto,
  updateBook
} from "../../../api/lmsApi"
import { toErrorMessage } from "../../../utils/api"

type EditableBook = {
  id: number
  title: string
  isbn: string
}

type Props = {
  onClose: () => void
  onCreated?: () => Promise<void> | void
  editingBook?: EditableBook | null
}

function parseIdList(value: string): number[] {
  if (!value.trim()) {
    return []
  }

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0)
}

export default function AddBookForm({ onClose, onCreated, editingBook }: Props) {
  const [title, setTitle] = useState("")
  const [isbn, setIsbn] = useState("")
  const [authorIds, setAuthorIds] = useState("")
  const [categoryIds, setCategoryIds] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [isbnSuggestions, setIsbnSuggestions] = useState<string[]>([])
  const [authorSuggestions, setAuthorSuggestions] = useState<AuthorDto[]>([])
  const [categorySuggestions, setCategorySuggestions] = useState<CategoryDto[]>([])

  useEffect(() => {
    let active = true

    const loadSuggestions = async () => {
      try {
        const [booksResponse, authorsResponse, categoriesResponse] = await Promise.all([
          getBooks({ page: 0, size: 200 }),
          getAuthors(),
          getCategories()
        ])

        if (!active) {
          return
        }

        const titles = Array.from(
          new Set(
            booksResponse.content
              .map((book) => book.title.trim())
              .filter((value) => value.length > 0)
          )
        )

        const isbns = Array.from(
          new Set(
            booksResponse.content
              .map((book) => book.isbn?.trim() ?? "")
              .filter((value) => value.length > 0)
          )
        )

        setTitleSuggestions(titles)
        setIsbnSuggestions(isbns)
        setAuthorSuggestions(authorsResponse)
        setCategorySuggestions(categoriesResponse)
      } catch {
        if (!active) {
          return
        }

        setTitleSuggestions([])
        setIsbnSuggestions([])
        setAuthorSuggestions([])
        setCategorySuggestions([])
      }
    }

    void loadSuggestions()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.title)
      setIsbn(editingBook.isbn)
      setAuthorIds("")
      setCategoryIds("")
      return
    }

    setTitle("")
    setIsbn("")
    setAuthorIds("")
    setCategoryIds("")
  }, [editingBook])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const payload = {
      title: title.trim(),
      isbn: isbn.trim() || undefined,
      authorIds: parseIdList(authorIds),
      categoryIds: parseIdList(categoryIds)
    }

    try {
      setLoading(true)
      setError("")

      if (editingBook) {
        await updateBook(editingBook.id, payload)
      } else {
        await createBook(payload)
      }

      if (onCreated) {
        await onCreated()
      }

      onClose()
    } catch (requestError) {
      setError(
        toErrorMessage(
          requestError,
          editingBook ? "Failed to update book" : "Failed to create book"
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Title
          </label>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Book title"
            list="book-title-suggestions"
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
          <datalist id="book-title-suggestions">
            {titleSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            ISBN
          </label>

          <input
            value={isbn}
            onChange={(event) => setIsbn(event.target.value)}
            placeholder="ISBN number"
            list="book-isbn-suggestions"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
          <datalist id="book-isbn-suggestions">
            {isbnSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Author IDs
          </label>

          <input
            value={authorIds}
            onChange={(event) => setAuthorIds(event.target.value)}
            placeholder="Example: 1,2"
            list="author-id-suggestions"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
          <datalist id="author-id-suggestions">
            {authorSuggestions.map((author) => (
              <option key={author.id} value={String(author.id)}>
                {author.name}
              </option>
            ))}
          </datalist>
          <p className="mt-1 text-xs text-slate-500">Comma-separated IDs</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Category IDs
          </label>

          <input
            value={categoryIds}
            onChange={(event) => setCategoryIds(event.target.value)}
            placeholder="Example: 1,3"
            list="category-id-suggestions"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
          <datalist id="category-id-suggestions">
            {categorySuggestions.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </datalist>
          <p className="mt-1 text-xs text-slate-500">Comma-separated IDs</p>
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
          {loading
            ? editingBook ? "Updating..." : "Adding..."
            : editingBook ? "Update Book" : "Add Book"
          }
        </button>
      </div>
    </form>
  )
}
