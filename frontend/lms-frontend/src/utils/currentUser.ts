import {
  findUserByEmail,
  getUserById,
  type UserDto
} from "../api/lmsApi"
import {
  decodeToken,
  extractEmailFromPayload,
  getStoredUserId,
  getStoredEmail,
  getStoredToken,
  setStoredUserId
} from "../state/authState"
import { ApiError } from "./api"

export async function getLoggedInUser(): Promise<UserDto | null> {
  const storedUserId = getStoredUserId()
  if (storedUserId) {
    try {
      return await getUserById(storedUserId)
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) {
        throw error
      }
    }
  }

  const token = getStoredToken()
  const payload = token ? decodeToken(token) : null
  const email = getStoredEmail() || extractEmailFromPayload(payload)

  if (!email) {
    return null
  }

  const user = await findUserByEmail(email)

  if (!user) {
    return null
  }

  setStoredUserId(user.id)
  return user
}
