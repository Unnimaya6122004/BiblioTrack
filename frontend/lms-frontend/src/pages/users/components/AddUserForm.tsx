import { useEffect, useState } from "react"
import { createUser, getUsers, updateUser } from "../../../api/lmsApi"
import { toErrorMessage } from "../../../utils/api"

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
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([])
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([])
  const [phoneSuggestions, setPhoneSuggestions] = useState<string[]>([])

  useEffect(() => {
    let active = true

    const loadSuggestions = async () => {
      try {
        const usersResponse = await getUsers({ page: 0, size: 200 })
        if (!active) {
          return
        }

        const names = Array.from(
          new Set(
            usersResponse.content
              .map((user) => user.fullName.trim())
              .filter((value) => value.length > 0)
          )
        )
        const emails = Array.from(
          new Set(
            usersResponse.content
              .map((user) => user.email.trim())
              .filter((value) => value.length > 0)
          )
        )
        const phones = Array.from(
          new Set(
            usersResponse.content
              .map((user) => user.phone?.trim() ?? "")
              .filter((value) => value.length > 0)
          )
        )

        setNameSuggestions(names)
        setEmailSuggestions(emails)
        setPhoneSuggestions(phones)
      } catch {
        if (!active) {
          return
        }

        setNameSuggestions([])
        setEmailSuggestions([])
        setPhoneSuggestions([])
      }
    }

    void loadSuggestions()

    return () => {
      active = false
    }
  }, [])

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter full name"
            list="user-name-suggestions"
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
          <datalist id="user-name-suggestions">
            {nameSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter email"
            list="user-email-suggestions"
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
          <datalist id="user-email-suggestions">
            {emailSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Password {editingUser ? "(optional)" : ""}
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={editingUser ? "Leave blank to keep current password" : "At least 6 characters"}
            required={!editingUser}
            minLength={editingUser ? undefined : 6}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Phone
          </label>

          <input
            type="text"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter phone number"
            list="user-phone-suggestions"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
          <datalist id="user-phone-suggestions">
            {phoneSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Role
          </label>

          <select
            value={role}
            onChange={(event) => setRole(event.target.value as "ADMIN" | "MEMBER")}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="MEMBER">MEMBER</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Status
          </label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "ACTIVE" | "INACTIVE" | "BLOCKED")}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
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
            ? editingUser ? "Updating..." : "Creating..."
            : editingUser ? "Update User" : "Create User"
          }
        </button>
      </div>
    </form>
  )
}
