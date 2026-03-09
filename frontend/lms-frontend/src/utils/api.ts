import {
  API_BASE_URL,
  ApiError,
  apiRequest,
  toErrorMessage,
  type PageResponse,
  type ValidationErrors
} from "../api/client"

export {
  API_BASE_URL,
  ApiError,
  toErrorMessage,
  type PageResponse,
  type ValidationErrors
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  return apiRequest<T>(path, init)
}
