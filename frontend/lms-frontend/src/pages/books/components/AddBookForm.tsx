import { useState } from "react"
import Input from "../../../components/ui/Input/Input"
import Button from "../../../components/ui/Button/Button"
import responsive from "../../../styles/responsive.module.css"

type Props = {
  onClose: () => void
}

export default function AddBookForm({ onClose }: Props) {

  const [title, setTitle] = useState("")
  const [isbn, setIsbn] = useState("")
  const [author, setAuthor] = useState("")
  const [category, setCategory] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newBook = {
      title,
      isbn,
      author,
      category
    }

    console.log("Book to add:", newBook)

    onClose()
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
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">
          Author
        </label>

        <Input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author name"
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
          Category
        </label>

        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
        />
      </div>

      <div className={responsive.formActions}>

        <Button type="button" onClick={onClose}>
          Cancel
        </Button>

        <Button type="submit">
          Add Book
        </Button>

      </div>

    </form>
  )
}
