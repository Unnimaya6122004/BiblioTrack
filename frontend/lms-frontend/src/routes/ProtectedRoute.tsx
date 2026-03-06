import type { ReactElement } from "react"
import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

type AllowedRole = "ADMIN" | "MEMBER"

interface JwtPayload {
  role?: unknown
  roles?: unknown
  authorities?: unknown
}

interface ProtectedRouteProps {
  role: AllowedRole
  children: ReactElement
}

function normalizeRole(value: unknown): AllowedRole | null {
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

function firstArrayItem(value: unknown): unknown {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined
  }

  return value[0]
}

function extractRole(payload: JwtPayload): AllowedRole | null {
  const fromRole = normalizeRole(payload.role)
  if (fromRole) {
    return fromRole
  }

  const fromRoles = normalizeRole(firstArrayItem(payload.roles))
  if (fromRoles) {
    return fromRoles
  }

  const firstAuthority = firstArrayItem(payload.authorities)

  if (typeof firstAuthority === "object" && firstAuthority !== null && "authority" in firstAuthority) {
    const fromAuthorityObject = normalizeRole(
      (firstAuthority as { authority?: unknown }).authority
    )

    if (fromAuthorityObject) {
      return fromAuthorityObject
    }
  }

  return normalizeRole(firstAuthority)
}

export default function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  try {
    const payload = jwtDecode<JwtPayload>(token)
    const tokenRole = extractRole(payload)

    if (!tokenRole || tokenRole !== role) {
      return <Navigate to="/login" replace />
    }

    return children
  } catch {
    return <Navigate to="/login" replace />
  }
}
