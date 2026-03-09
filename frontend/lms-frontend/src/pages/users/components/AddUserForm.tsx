import { useEffect, useState } from "react"
import { createUser, updateUser } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../utils/api"
import responsive from "../../../styles/responsive.module.css"

type EditableUser = {
  id: number
  fullName: string
  email: string
  role: "ADMIN" | "MEMBER"
  phone: string
  status: "ACTIVE" | "INACTIVE" | "BLOCKED"
}

type Props = {
  onClose: () => void
  onCreated?: () => Promise<void> | void
  editingUser?: EditableUser | null
}

export default function AddUserForm({ onClose, onCreated, editingUser }: Props) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER")
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "BLOCKED">("ACTIVE")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editingUser) {
      setFullName(editingUser.fullName)
      setEmail(editingUser.email)
      setPassword("")
      setPhone(editingUser.phone)
      setRole(editingUser.role)
      setStatus(editingUser.status)
      return
    }

    setFullName("")
    setEmail("")
    setPassword("")
    setPhone("")
    setRole("MEMBER")
    setStatus("ACTIVE")
  }, [editingUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")

      const normalizedRole = role === "MEMBER" ? "USER" : "ADMIN"

      if (editingUser) {
        await updateUser(editingUser.id, {
          fullName: fullName.trim(),
          email: email.trim(),
          role: normalizedRole,
          phone: phone.trim() || undefined,
          status,
          passwordHash: password.trim() || undefined
        })
      } else {
        await createUser({
          fullName: fullName.trim(),
          email: email.trim(),
          passwordHash: password,
          role: normalizedRole,
          phone: phone.trim() || undefined,
          status
        })
      }

      if (onCreated) {
        await onCreated()
      }

      onClose()
    } catch (requestError) {
      setError(
        toErrorMessage(
          requestError,
          editingUser ? "Failed to update user" : "Failed to create user"
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>

      {/* Name */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Name
        </label>

        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter full name"
          required
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          required
          className="border px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Password {editingUser ? "(optional)" : ""}
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={editingUser ? "Leave blank to keep current password" : "At least 6 characters"}
          required={!editingUser}
          minLength={editingUser ? undefined : 6}
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
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
          value={role}
          onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
          className="w-full border border-gray-300 bg-white px-3 py-2 rounded-lg text-gray-700 shadow-sm outline-none transition-all hover:border-[#162a52] focus:border-[#0f1f3d] focus:ring-2 focus:ring-[#0f1f3d]"
        >
          <option value="ADMIN">ADMIN</option>
          <option value="MEMBER">MEMBER</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE" | "BLOCKED")}
          className="w-full border border-gray-300 bg-white px-3 py-2 rounded-lg text-gray-700 shadow-sm outline-none transition-all hover:border-[#162a52] focus:border-[#0f1f3d] focus:ring-2 focus:ring-[#0f1f3d]"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="BLOCKED">BLOCKED</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Buttons */}
      <div className={responsive.formActions}>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="border px-4 py-2 rounded-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#0f1f3d] text-white px-4 py-2 rounded-lg hover:bg-[#162a52] disabled:opacity-70"
        >
          {loading
            ? editingUser ? "Updating..." : "Creating..."
            : editingUser ? "Update User" : "Create User"
          }
        </button>

      </div>

    </form>
  )
}
