import { jwtDecode } from "jwt-decode"
export const TOKEN_STORAGE_KEY = "auth_token"
export const USER_ID_STORAGE_KEY = "user_id"
export const ROLE_STORAGE_KEY = "user_role"
export const EMAIL_STORAGE_KEY = "user_email"
export const AUTH_STATE_STORAGE_KEY = "auth_state"
const LEGACY_TOKEN_STORAGE_KEY = "token"
let inMemoryToken: string | null = null

export type UserRole = "ADMIN" | "MEMBER"

export interface JwtPayload {
  sub?: unknown
  email?: unknown
  role?: unknown
  roles?: unknown
  authorities?: unknown
  userId?: unknown
  id?: unknown
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

  if (inMemoryToken) {
    return inMemoryToken
  }

  const cookieToken = readCookie(TOKEN_STORAGE_KEY)
  if (cookieToken) {
    inMemoryToken = cookieToken
    return cookieToken
  }

  const legacyCookieToken = readCookie(LEGACY_TOKEN_STORAGE_KEY)
  if (legacyCookieToken) {
    inMemoryToken = legacyCookieToken
    clearCookie(LEGACY_TOKEN_STORAGE_KEY)
    return legacyCookieToken
  }

  const localToken = readFromLocalStorage(TOKEN_STORAGE_KEY)
    ?? readFromLocalStorage(LEGACY_TOKEN_STORAGE_KEY)
  if (!localToken) {
    return null
  }

  // Backward-compatible migration for users already logged in.
  removeFromLocalStorage(TOKEN_STORAGE_KEY)
  removeFromLocalStorage(LEGACY_TOKEN_STORAGE_KEY)
  inMemoryToken = localToken
  return localToken
}

export function getStoredToken(): string | null {
  return getInitialToken()
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") {
    return
  }

  // Backend manages auth_token as HttpOnly cookie. Avoid storing JWT in JS.
  void token
  inMemoryToken = null
  clearCookie(LEGACY_TOKEN_STORAGE_KEY)
  removeFromLocalStorage(TOKEN_STORAGE_KEY)
  removeFromLocalStorage(LEGACY_TOKEN_STORAGE_KEY)
}

export function getStoredRole(): UserRole | null {
  if (typeof window === "undefined") {
    return null
  }

  const persistedRole = readFromLocalStorage(ROLE_STORAGE_KEY)
  if (persistedRole) {
    return normalizeRole(persistedRole)
  }

  // Legacy migration from old cookie-based storage.
  const legacyCookieRole = readCookie(ROLE_STORAGE_KEY)
  if (!legacyCookieRole) {
    return null
  }

  writeToLocalStorage(ROLE_STORAGE_KEY, legacyCookieRole)
  clearCookie(ROLE_STORAGE_KEY)
  return normalizeRole(legacyCookieRole)
}

export function setStoredRole(role: UserRole): void {
  if (typeof window === "undefined") {
    return
  }

  writeToLocalStorage(ROLE_STORAGE_KEY, role)
  clearCookie(ROLE_STORAGE_KEY)
}

export function getStoredEmail(): string {
  if (typeof window === "undefined") {
    return ""
  }

  const persistedEmail = readFromLocalStorage(EMAIL_STORAGE_KEY)
  if (persistedEmail) {
    return persistedEmail
  }

  // Legacy migration from old cookie-based storage.
  const legacyCookieEmail = readCookie(EMAIL_STORAGE_KEY)
  if (!legacyCookieEmail) {
    return ""
  }

  writeToLocalStorage(EMAIL_STORAGE_KEY, legacyCookieEmail)
  clearCookie(EMAIL_STORAGE_KEY)
  return legacyCookieEmail
}

export function setStoredEmail(email: string): void {
  if (typeof window === "undefined") {
    return
  }

  writeToLocalStorage(EMAIL_STORAGE_KEY, email.trim())
  clearCookie(EMAIL_STORAGE_KEY)
}

export function isAuthenticatedSession(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  if (getInitialToken()) {
    return true
  }

  const localFlag = readFromLocalStorage(AUTH_STATE_STORAGE_KEY)
  if (localFlag === "1") {
    return true
  }

  // Legacy migration from old cookie-based storage.
  const legacyCookieFlag = readCookie(AUTH_STATE_STORAGE_KEY)
  if (legacyCookieFlag !== "1") {
    return false
  }

  writeToLocalStorage(AUTH_STATE_STORAGE_KEY, "1")
  clearCookie(AUTH_STATE_STORAGE_KEY)
  return true
}

export function setAuthenticatedSession(): void {
  if (typeof window === "undefined") {
    return
  }

  writeToLocalStorage(AUTH_STATE_STORAGE_KEY, "1")
  clearCookie(AUTH_STATE_STORAGE_KEY)
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") {
    return
  }

  inMemoryToken = null
  clearCookie(TOKEN_STORAGE_KEY)
  clearCookie(LEGACY_TOKEN_STORAGE_KEY)
  clearCookie(USER_ID_STORAGE_KEY)
  clearCookie(ROLE_STORAGE_KEY)
  clearCookie(EMAIL_STORAGE_KEY)
  clearCookie(AUTH_STATE_STORAGE_KEY)
  removeFromLocalStorage(TOKEN_STORAGE_KEY)
  removeFromLocalStorage(LEGACY_TOKEN_STORAGE_KEY)
  removeFromLocalStorage(USER_ID_STORAGE_KEY)
  removeFromLocalStorage(ROLE_STORAGE_KEY)
  removeFromLocalStorage(EMAIL_STORAGE_KEY)
  removeFromLocalStorage(AUTH_STATE_STORAGE_KEY)
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

function parsePositiveInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

export function extractUserIdFromPayload(payload: JwtPayload | null): number | null {
  if (!payload) {
    return null
  }

  const fromUserId = parsePositiveInteger(payload.userId)
  if (fromUserId) {
    return fromUserId
  }

  return parsePositiveInteger(payload.id)
}

export function getStoredUserId(): number | null {
  if (typeof window === "undefined") {
    return null
  }

  const localUserId = readFromLocalStorage(USER_ID_STORAGE_KEY)
  if (localUserId) {
    return parsePositiveInteger(localUserId)
  }

  // Legacy migration from old cookie-based storage.
  const legacyCookieUserId = readCookie(USER_ID_STORAGE_KEY)
  if (legacyCookieUserId) {
    writeToLocalStorage(USER_ID_STORAGE_KEY, legacyCookieUserId)
    clearCookie(USER_ID_STORAGE_KEY)
  }

  return parsePositiveInteger(legacyCookieUserId)
}

export function setStoredUserId(userId: number): void {
  if (typeof window === "undefined") {
    return
  }

  writeToLocalStorage(USER_ID_STORAGE_KEY, String(userId))
  clearCookie(USER_ID_STORAGE_KEY)
}

export function clearStoredUserId(): void {
  if (typeof window === "undefined") {
    return
  }

  clearCookie(USER_ID_STORAGE_KEY)
  removeFromLocalStorage(USER_ID_STORAGE_KEY)
}

function buildCookieAttributes(maxAgeSeconds: number): string {
  const parts = [
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    "SameSite=Lax"
  ]

  if (window.location.protocol === "https:") {
    parts.push("Secure")
  }

  return parts.join("; ")
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null
  }

  const encodedPrefix = `${encodeURIComponent(name)}=`
  const cookieParts = document.cookie.split(";")

  for (const part of cookieParts) {
    const trimmed = part.trim()
    if (!trimmed.startsWith(encodedPrefix)) {
      continue
    }

    const encodedValue = trimmed.slice(encodedPrefix.length)
    return decodeURIComponent(encodedValue)
  }

  return null
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") {
    return
  }

  const encodedName = encodeURIComponent(name)
  document.cookie = `${encodedName}=; ${buildCookieAttributes(0)}`
}

function readFromLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // no-op
  }
}

function writeToLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // no-op
  }
}
