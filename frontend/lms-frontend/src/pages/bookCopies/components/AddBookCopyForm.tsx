type Props = {
  onClose: () => void
}

export default function AddBookCopyForm({ onClose }: Props) {
  return (
    <form className="space-y-4">

      <div>
        <label className="text-sm text-gray-600">Book ID</label>
        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Enter book id"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Barcode</label>
        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Enter barcode"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="bg-[#2f5aa8] text-white px-4 py-2 rounded"
        >
          Add Copy
        </button>
      </div>

    </form>
  )
}