import type { ReactElement } from "react"
import { Navigate } from "react-router-dom"
import {
  decodeToken,
  extractRoleFromPayload,
  getStoredToken,
  type UserRole
} from "../state/authState"

interface ProtectedRouteProps {
  role: UserRole
  children: ReactElement
}

export default function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const token = getStoredToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const payload = decodeToken(token)
  const tokenRole = extractRoleFromPayload(payload)

  if (!tokenRole || tokenRole !== role) {
    return <Navigate to="/login" replace />
  }

  return children
}
