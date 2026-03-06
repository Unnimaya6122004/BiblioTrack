import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

import Button from "../../../components/ui/Button/Button"
import Input from "../../../components/ui/Input/Input"

interface JwtPayload {
  role?: unknown
  roles?: unknown
  authorities?: unknown
}

interface LoginResponse {
  token?: string
  message?: string
}

function normalizeRole(value: unknown): "ADMIN" | "MEMBER" | null {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.replace(/^ROLE_/, "").trim().toUpperCase()

  if (normalized === "ADMIN") {
    return "ADMIN"
  }

  if (normalized === "MEMBER" || normalized === "USER") {
    return "MEMBER"
  }

  return null
}

function getFirstItem(value: unknown): unknown {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined
  }

  return value[0]
}

function extractRole(payload: JwtPayload): "ADMIN" | "MEMBER" | null {
  const roleFromRole = normalizeRole(payload.role)

  if (roleFromRole) {
    return roleFromRole
  }

  const roleFromRoles = normalizeRole(getFirstItem(payload.roles))

  if (roleFromRoles) {
    return roleFromRoles
  }

  const firstAuthority = getFirstItem(payload.authorities)

  if (typeof firstAuthority === "object" && firstAuthority !== null && "authority" in firstAuthority) {
    const roleFromAuthorityObject = normalizeRole(
      (firstAuthority as { authority?: unknown }).authority
    )

    if (roleFromAuthorityObject) {
      return roleFromAuthorityObject
    }
  }

  return normalizeRole(firstAuthority)
}

export default function LoginForm() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {

      setLoading(true)

      const response = await fetch(
        "http://localhost:8081/api/v1/auth/login",
        {
          method: "POST",
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

      const token = data.token

      if (!token) {
        throw new Error("Token not found in login response")
      }

      // store token
      localStorage.setItem("token", token)

      // only continue after token is successfully stored
      const storedToken = localStorage.getItem("token")

      if (!storedToken) {
        throw new Error("Failed to store authentication token")
      }

      const payload = jwtDecode<JwtPayload>(storedToken)
      console.log("JWT payload:", payload)

      const role = extractRole(payload)

      if (!role) {
        localStorage.removeItem("token")
        throw new Error("Unable to determine user role from token")
      }

      // redirect based on role
      if (role === "ADMIN") {
        navigate("/dashboard")
      } else if (role === "MEMBER") {
        navigate("/member/dashboard")
      }

    } catch (error) {

      console.error("Login error:", error)
      const message =
        error instanceof Error ? error.message : "Login failed. Check your credentials."
      alert(message)

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

      {/* Button */}
      <Button className="w-full" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </Button>

    </form>
  )
}
