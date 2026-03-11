import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Button from "../../../components/ui/Button/Button"
import Input from "../../../components/ui/Input/Input"
import { API_BASE_URL, ApiError } from "../../../utils/api"
import { findUserByEmail, getUsers } from "../../../api/lmsApi"
import {
  clearStoredUserId,
  clearStoredToken,
  extractEmailFromPayload,
  extractRoleFromPayload,
  setStoredToken,
  setStoredRole,
  setStoredEmail,
  setAuthenticatedSession,
  setStoredUserId,
  decodeToken,
  extractUserIdFromPayload
} from "../../../state/authState"

interface LoginResponse {
  token?: string
  role?: string
  email?: string
  message?: string
}

type LoginFormProps = {
  error: string
  setError: (value: string) => void
}

export default function LoginForm({ error, setError }: LoginFormProps) {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {

      setLoading(true)
      setError("")

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim(),
            password
          })
        }
      )

      let data: LoginResponse = {}

      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials")
      }

      const token = typeof data.token === "string" ? data.token : null
      const payload = token ? decodeToken(token) : null
      const roleFromPayload = extractRoleFromPayload(payload)
      const roleFromResponse = typeof data.role === "string"
        ? data.role.trim().toUpperCase()
        : ""
      const role = roleFromResponse === "ADMIN"
        ? "ADMIN"
        : roleFromResponse === "MEMBER" || roleFromResponse === "USER"
          ? "MEMBER"
          : roleFromPayload

      if (!role) {
        throw new Error("Invalid email or password")
      }

      if (token) {
        setStoredToken(token)
      }

      const resolvedEmail = (typeof data.email === "string" && data.email.trim())
        ? data.email.trim()
        : extractEmailFromPayload(payload) || email.trim()

      setStoredRole(role)
      setStoredEmail(resolvedEmail)
      setAuthenticatedSession()
      setError("")

      // Enforce cookie-based auth: proceed only if backend session is active.
      try {
        await getUsers({ page: 0, size: 1 })
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.status === 401) {
          throw new Error("Login succeeded but auth cookie was not stored by browser")
        }

        throw requestError
      }

      const userIdFromToken = extractUserIdFromPayload(payload)

      if (userIdFromToken) {
        setStoredUserId(userIdFromToken)
      } else {
        try {
          const user = await findUserByEmail(resolvedEmail)
          if (user) {
            setStoredUserId(user.id)
          } else {
            clearStoredUserId()
          }
        } catch {
          clearStoredUserId()
        }
      }

      // redirect based on role
      if (role === "ADMIN") {
        navigate("/dashboard")
      } else if (role === "MEMBER") {
        navigate("/member/dashboard")
      }

    } catch (error) {
      console.error("Login error:", error)
      setError(
        error instanceof Error && error.message
          ? error.message
          : "Invalid email or password"
      )
      clearStoredToken()

    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">

      {/* Email */}
      <div>
        <label className="text-sm text-gray-600">
          Email
        </label>

        <Input
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          placeholder="admin@library.com"
        />
      </div>

      {/* Password */}
      <div>
        <label className="text-sm text-gray-600">
          Password
        </label>

        <Input
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Button */}
      <Button className="w-full" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </Button>

    </form>
  )
}
