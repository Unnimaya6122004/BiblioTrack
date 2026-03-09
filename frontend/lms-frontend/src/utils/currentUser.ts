import { findUserByEmail, type UserDto } from "../api/lmsApi"
import { decodeToken, extractEmailFromPayload, getStoredToken } from "../state/authState"

export async function getLoggedInUser(): Promise<UserDto | null> {
  const token = getStoredToken()

  if (!token) {
    return null
  }

  const payload = decodeToken(token)
  const email = extractEmailFromPayload(payload)

  if (!email) {
    return null
  }

  return findUserByEmail(email)
}
