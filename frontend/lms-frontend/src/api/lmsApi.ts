import { apiFetch, type PageResponse } from "../utils/api"

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED"
export type UserRole = "ADMIN" | "MEMBER" | "USER"

export interface UserDto {
  id: number
  fullName: string
  email: string
  role: UserRole
  phone?: string | null
  status?: UserStatus | null
  createdAt?: string | null
}

export interface CreateUserPayload {
  fullName: string
  email: string
  passwordHash: string
  role: UserRole
  phone?: string
  status?: UserStatus
}

export interface UpdateUserPayload {
  fullName: string
  email: string
  role: UserRole
  phone?: string
  status?: UserStatus
  passwordHash?: string
}

export interface BookDto {
  id: number
  title: string
  isbn?: string | null
  createdAt?: string | null
}

export interface CreateBookPayload {
  title: string
  isbn?: string
  authorIds?: number[]
  categoryIds?: number[]
}

export interface UpdateBookPayload {
  title: string
  isbn?: string
  authorIds?: number[]
  categoryIds?: number[]
}

export interface AuthorDto {
  id: number
  name: string
}

export interface CategoryDto {
  id: number
  name: string
}

export interface BookCopyDto {
  id: number
  bookId: number
  bookTitle: string
  barcode: string
  rackLocation?: string | null
  status: string
}

export interface CreateBookCopyPayload {
  barcode: string
  rackLocation?: string
}

export interface LoanDto {
  id: number
  userId: number
  userName: string
  userEmail: string
  bookId: number
  bookTitle: string
  barcode: string
  issueDate: string
  dueDate: string
  returnDate?: string | null
  status: string
}

export interface IssueLoanPayload {
  userId: number
  bookCopyId: number
}

export interface ReservationDto {
  id: number
  userId: number
  userName: string
  bookId: number
  bookTitle: string
  reservationDate: string
  status: string
}

export interface CreateReservationPayload {
  userId: number
  bookId: number
}

export interface FineDto {
  id: number
  loanId: number
  userId: number
  userName: string
  amount: number | string
  issuedDate: string
  paidDate?: string | null
  status: string
}

export interface NotificationDto {
  id: number
  title: string
  message: string
  createdByUserId?: number | null
  createdByName?: string | null
  createdAt: string
  read: boolean
  readAt?: string | null
}

export interface CreateNotificationPayload {
  title: string
  message: string
}

export interface TopBookAnalyticsDto {
  bookId: number
  bookTitle: string
  loanCount: number
}

export interface DefaulterAnalyticsDto {
  userId: number
  userName: string
  overdueLoanCount: number
  unpaidFineTotal: number
}

export interface FineTrendPointDto {
  month: string
  raisedAmount: number
  paidAmount: number
}

export interface AdminAnalyticsDto {
  topBooks: TopBookAnalyticsDto[]
  defaulters: DefaulterAnalyticsDto[]
  fineTrends: FineTrendPointDto[]
}

export function mapRoleForUi(role: UserRole): "ADMIN" | "MEMBER" {
  if (role === "USER") {
    return "MEMBER"
  }

  if (role === "ADMIN") {
    return "ADMIN"
  }

  return "MEMBER"
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue
    }
    search.set(key, String(value))
  }

  const result = search.toString()
  return result ? `?${result}` : ""
}

export async function getUsers(params?: {
  status?: string
  fullName?: string
  page?: number
  size?: number
}): Promise<PageResponse<UserDto>> {
  const query = toQueryString({
    page: params?.page ?? 0,
    size: params?.size ?? 200,
    status: params?.status,
    fullName: params?.fullName
  })

  return apiFetch<PageResponse<UserDto>>(`/users${query}`)
}

export async function getUserById(id: number): Promise<UserDto> {
  return apiFetch<UserDto>(`/users?id=${id}`)
}

export async function findUserByEmail(email: string): Promise<UserDto | null> {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    return null
  }

  let page = 0
  const size = 100

  while (true) {
    const response = await getUsers({ page, size })
    const match = response.content.find(
      (user) => user.email.trim().toLowerCase() === normalizedEmail
    )

    if (match) {
      return match
    }

    if (response.last) {
      return null
    }

    page += 1
  }
}

export async function createUser(payload: CreateUserPayload): Promise<UserDto> {
  return apiFetch<UserDto>("/users", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<UserDto> {
  return apiFetch<UserDto>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  })
}

export async function deleteUser(id: number): Promise<void> {
  await apiFetch<void>(`/users/${id}`, { method: "DELETE" })
}

export async function getBooks(params?: {
  title?: string
  author?: string
  category?: string
  page?: number
  size?: number
}): Promise<PageResponse<BookDto>> {
  const query = toQueryString({
    page: params?.page ?? 0,
    size: params?.size ?? 200,
    title: params?.title,
    author: params?.author,
    category: params?.category
  })

  return apiFetch<PageResponse<BookDto>>(`/books${query}`)
}

export async function createBook(payload: CreateBookPayload): Promise<BookDto> {
  return apiFetch<BookDto>("/books", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export async function updateBook(id: number, payload: UpdateBookPayload): Promise<BookDto> {
  return apiFetch<BookDto>(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  })
}

export async function deleteBook(id: number): Promise<void> {
  await apiFetch<void>(`/books/${id}`, { method: "DELETE" })
}

export async function getAuthors(): Promise<AuthorDto[]> {
  return apiFetch<AuthorDto[]>("/authors")
}

export async function getCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>("/categories")
}

export async function getBookCopies(params?: {
  barcode?: string
  page?: number
  size?: number
}): Promise<PageResponse<BookCopyDto>> {
  const query = toQueryString({
    page: params?.page ?? 0,
    size: params?.size ?? 200,
    barcode: params?.barcode
  })

  return apiFetch<PageResponse<BookCopyDto>>(`/book-copies${query}`)
}

export async function createBookCopy(
  bookId: number,
  payload: CreateBookCopyPayload
): Promise<BookCopyDto> {
  return apiFetch<BookCopyDto>(`/book-copies/${bookId}`, {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export async function deleteBookCopy(id: number): Promise<void> {
  await apiFetch<void>(`/book-copies/${id}`, { method: "DELETE" })
}

export async function getLoans(params?: {
  status?: string
  page?: number
  size?: number
}): Promise<PageResponse<LoanDto>> {
  const query = toQueryString({
    page: params?.page ?? 0,
    size: params?.size ?? 200,
    status: params?.status
  })

  return apiFetch<PageResponse<LoanDto>>(`/loans${query}`)
}

export async function issueLoan(payload: IssueLoanPayload): Promise<LoanDto> {
  return apiFetch<LoanDto>("/loans", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export async function returnLoan(loanId: number): Promise<LoanDto> {
  return apiFetch<LoanDto>(`/loans/${loanId}`, { method: "PUT" })
}

export async function getReservations(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<ReservationDto>> {
  const query = toQueryString({
    page: params?.page ?? 0,
    size: params?.size ?? 200
  })

  return apiFetch<PageResponse<ReservationDto>>(`/reservations${query}`)
}

export async function createReservation(
  payload: CreateReservationPayload
): Promise<ReservationDto> {
  return apiFetch<ReservationDto>("/reservations", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export async function cancelReservation(id: number): Promise<void> {
  await apiFetch<void>(`/reservations/${id}`, { method: "DELETE" })
}

export async function getFines(params?: {
  loanId?: number
  userId?: number
  page?: number
  size?: number
}): Promise<PageResponse<FineDto>> {
  const query = toQueryString({
    page: params?.page ?? 0,
    size: params?.size ?? 200,
    loanId: params?.loanId,
    userId: params?.userId
  })

  return apiFetch<PageResponse<FineDto>>(`/fines${query}`)
}

export async function payFine(id: number): Promise<FineDto> {
  return apiFetch<FineDto>(`/fines/${id}`, { method: "PUT" })
}

export async function getUnpaidFineTotal(userId: number): Promise<number> {
  return apiFetch<number>(`/fines?userId=${userId}`)
}

export async function getNotifications(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<NotificationDto>> {
  const query = toQueryString({
    page: params?.page ?? 0,
    size: params?.size ?? 200
  })

  return apiFetch<PageResponse<NotificationDto>>(`/notifications${query}`)
}

export async function createNotification(
  payload: CreateNotificationPayload
): Promise<NotificationDto> {
  return apiFetch<NotificationDto>("/notifications", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export async function markNotificationAsRead(id: number): Promise<NotificationDto> {
  return apiFetch<NotificationDto>(`/notifications/${id}/read`, {
    method: "PUT"
  })
}

export async function getUnreadNotificationCount(): Promise<number> {
  return apiFetch<number>("/notifications/unread-count")
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsDto> {
  return apiFetch<AdminAnalyticsDto>("/analytics/admin")
}
