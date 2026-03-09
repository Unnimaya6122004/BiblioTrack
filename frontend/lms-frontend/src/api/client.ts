import { clearStoredToken, getStoredToken } from "../state/authState"

const DEFAULT_API_BASE_URL = "http://localhost:8081/api/v1"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL

export interface ValidationErrors {
  [key: string]: string
}

interface ApiErrorPayload {
  message?: string
  error?: string
  validationErrors?: ValidationErrors
}

export class ApiError extends Error {
  status: number
  validationErrors?: ValidationErrors

  constructor(message: string, status: number, validationErrors?: ValidationErrors) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.validationErrors = validationErrors
  }
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

async function parseResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function toApiErrorPayload(data: unknown): ApiErrorPayload {
  if (typeof data !== "object" || data === null) {
    return {}
  }

  const payload = data as ApiErrorPayload

  if (
    payload.validationErrors &&
    (typeof payload.validationErrors !== "object" || Array.isArray(payload.validationErrors))
  ) {
    payload.validationErrors = undefined
  }

  return payload
}

function toPayloadErrorMessage(payload: ApiErrorPayload, fallback: string): string {
  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error
  }

  return fallback
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`
  }

  return `${API_BASE_URL}${path}`
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(init?.headers)

  if (!headers.has("Content-Type") && init?.body !== undefined) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers
    })
  } catch {
    throw new ApiError("Unable to reach server. Please check backend connection.", 0)
  }

  const data = await parseResponseJson(response)

  if (!response.ok) {
    const payload = toApiErrorPayload(data)

    if (response.status === 401) {
      clearStoredToken()
    }

    throw new ApiError(
      toPayloadErrorMessage(payload, "Request failed"),
      response.status,
      payload.validationErrors
    )
  }

  return data as T
}

export function toErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError && error.message) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
