import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Button from "../../../components/ui/Button/Button"
import Input from "../../../components/ui/Input/Input"
import {
  setStoredToken,
  decodeToken,
  extractRoleFromPayload
} from "../../../state/authState"

interface LoginResponse {
  token?: string
  message?: string
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

      const payload = decodeToken(token)
      console.log("JWT payload:", payload)

      const role = extractRoleFromPayload(payload)

      if (!role) {
        throw new Error("Unable to determine user role from token")
      }

      setStoredToken(token)

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
