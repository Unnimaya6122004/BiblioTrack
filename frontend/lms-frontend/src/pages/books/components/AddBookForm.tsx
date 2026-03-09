import { useEffect, useState } from "react"
import Input from "../../../components/ui/Input/Input"
import Button from "../../../components/ui/Button/Button"
import { createBook, updateBook } from "../../../api/lmsApi"
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
          required
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">
          ISBN
        </label>

        <Input
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder="ISBN number"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">
          Author IDs
        </label>

        <Input
          value={authorIds}
          onChange={(e) => setAuthorIds(e.target.value)}
          placeholder="Example: 1,2"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">
          Category IDs
        </label>

        <Input
          value={categoryIds}
          onChange={(e) => setCategoryIds(e.target.value)}
          placeholder="Example: 1,3"
        />
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
