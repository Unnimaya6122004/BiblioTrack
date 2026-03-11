import { useEffect, useState } from "react"
import Input from "../../../components/ui/Input/Input"
import Button from "../../../components/ui/Button/Button"
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
import responsive from "../../../styles/responsive.module.css"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      <div>
        <label className="text-sm text-gray-600">
          Title
        </label>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Book title"
          list="book-title-suggestions"
          required
        />
        <datalist id="book-title-suggestions">
          {titleSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="text-sm text-gray-600">
          ISBN
        </label>

        <Input
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder="ISBN number"
          list="book-isbn-suggestions"
        />
        <datalist id="book-isbn-suggestions">
          {isbnSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="text-sm text-gray-600">
          Author IDs
        </label>

        <Input
          value={authorIds}
          onChange={(e) => setAuthorIds(e.target.value)}
          placeholder="Example: 1,2"
          list="author-id-suggestions"
        />
        <datalist id="author-id-suggestions">
          {authorSuggestions.map((author) => (
            <option key={author.id} value={String(author.id)}>
              {author.name}
            </option>
          ))}
        </datalist>
      </div>

      <div>
        <label className="text-sm text-gray-600">
          Category IDs
        </label>

        <Input
          value={categoryIds}
          onChange={(e) => setCategoryIds(e.target.value)}
          placeholder="Example: 1,3"
          list="category-id-suggestions"
        />
        <datalist id="category-id-suggestions">
          {categorySuggestions.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </datalist>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className={responsive.formActions}>

        <Button type="button" onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button type="submit" disabled={loading}>
          {loading
            ? editingBook ? "Updating..." : "Adding..."
            : editingBook ? "Update Book" : "Add Book"
          }
        </Button>

      </div>

    </form>
  )
}
