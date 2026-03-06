import responsive from "../../../styles/responsive.module.css"

type Props = {
  onClose: () => void
}

export default function AddUserForm({ onClose }: Props) {
  return (
    <form className="space-y-4">

      {/* Name */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Name
        </label>

        <input
          type="text"
          placeholder="Enter full name"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Email
        </label>

        <input
          type="email"
          placeholder="Enter email"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Phone
        </label>

        <input
          type="text"
          placeholder="Enter phone number"
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Role
        </label>

        <select
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>ADMIN</option>
          <option>MEMBER</option>
        </select>
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
          <option>INACTIVE</option>
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
          Create User
        </button>

      </div>

    </form>
  )
}
