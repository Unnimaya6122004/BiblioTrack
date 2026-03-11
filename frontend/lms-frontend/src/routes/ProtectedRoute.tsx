import type { ReactElement } from "react"
import { Navigate } from "react-router-dom"
import {
  decodeToken,
  extractRoleFromPayload,
  getStoredRole,
  getStoredToken,
  isAuthenticatedSession,
  type UserRole
} from "../state/authState"

interface ProtectedRouteProps {
  role: UserRole
  children: ReactElement
}

export default function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const token = getStoredToken()
  const storedRole = getStoredRole()
  const authenticated = isAuthenticatedSession() || Boolean(token)

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  const payload = token ? decodeToken(token) : null
  const tokenRole = token ? extractRoleFromPayload(payload) : null
  const activeRole = storedRole ?? tokenRole

  if (!activeRole || activeRole !== role) {
    return <Navigate to="/login" replace />
  }

  return children
}
