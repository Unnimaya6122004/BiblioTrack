import responsive from "../../../styles/responsive.module.css"

type Props = {
  onClose: () => void
}

export default function AddReservationForm({ onClose }: Props) {
  return (
    <form className="space-y-4">

      {/* User */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          User
        </label>

        <input
          type="text"
          placeholder="Enter user name or ID"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Book */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Book
        </label>

        <input
          type="text"
          placeholder="Enter book title or ID"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Reservation Date */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Reservation Date
        </label>

        <input
          type="date"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Status
        </label>

        <select
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>ACTIVE</option>
          <option>COMPLETED</option>
          <option>CANCELLED</option>
        </select>
      </div>

      {/* Buttons */}
      <div className={responsive.formActions}>

        <button
          type="button"
          onClick={onClose}
          className="border px-4 py-2 rounded-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="bg-[#2f5aa8] text-white px-4 py-2 rounded-lg hover:bg-[#274c90]"
        >
          Create Reservation
        </button>

      </div>

    </form>
  )
}
