import { jwtDecode } from "jwt-decode"
export const TOKEN_STORAGE_KEY = "token"

export type UserRole = "ADMIN" | "MEMBER"

export interface JwtPayload {
  sub?: unknown
  email?: unknown
  role?: unknown
  roles?: unknown
  authorities?: unknown
}

function firstArrayItem(value: unknown): unknown {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined
  }

  return value[0]
}

function normalizeRole(value: unknown): UserRole | null {
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

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token)
  } catch {
    return null
  }
}

export function extractRoleFromPayload(payload: JwtPayload | null): UserRole | null {
  if (!payload) {
    return null
  }

  const roleFromRole = normalizeRole(payload.role)
  if (roleFromRole) {
    return roleFromRole
  }

  const roleFromRoles = normalizeRole(firstArrayItem(payload.roles))
  if (roleFromRoles) {
    return roleFromRoles
  }

  const firstAuthority = firstArrayItem(payload.authorities)

  if (
    typeof firstAuthority === "object" &&
    firstAuthority !== null &&
    "authority" in firstAuthority
  ) {
    const roleFromAuthorityObject = normalizeRole(
      (firstAuthority as { authority?: unknown }).authority
    )
    if (roleFromAuthorityObject) {
      return roleFromAuthorityObject
    }
  }

  return normalizeRole(firstAuthority)
}

function getInitialToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getStoredToken(): string | null {
  return getInitialToken()
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function extractEmailFromPayload(payload: JwtPayload | null): string {
  const subject = payload?.sub
  const email = payload?.email

  if (typeof subject === "string" && subject.trim()) {
    return subject
  }

  if (typeof email === "string" && email.trim()) {
    return email
  }

  return ""
}
