import { Routes, Route } from "react-router-dom"

import HomePage from "../pages/home/HomePage"
import LoginPage from "../pages/login/LoginPage"
import DashboardPage from "../pages/dashboard/DashboardPage"
import BooksPage from "../pages/books/BooksPage"
import BookCopiesPage from "../pages/bookCopies/BookCopiesPage"
import UsersPage from "../pages/users/UsersPage"
import LoansPage from "../pages/loans/LoansPage"
import ReservationsPage from "../pages/reservations/ReservationsPage"
import FinesPage from "../pages/fines/FinesPage"
import NotificationsPage from "../pages/notifications/NotificationsPage"
import MemberDashboard from "../pages/member/dashboard/MemberDashboard"
import BrowseBooksPage from "../pages/member/books/BrowseBooksPage"
import MyLoansPage from "../pages/member/loans/MyLoansPage"
import MyReservationsPage from "../pages/member/reservations/MyReservationsPage"
import MyFinesPage from "../pages/member/fines/MyFinesPage"
import MyNotificationsPage from "../pages/member/notifications/MyNotificationsPage"
import ProtectedRoute from "./ProtectedRoute"

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="ADMIN">
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/books"
        element={
          <ProtectedRoute role="ADMIN">
            <BooksPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/book-copies"
        element={
          <ProtectedRoute role="ADMIN">
            <BookCopiesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute role="ADMIN">
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/loans"
        element={
          <ProtectedRoute role="ADMIN">
            <LoansPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservations"
        element={
          <ProtectedRoute role="ADMIN">
            <ReservationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fines"
        element={
          <ProtectedRoute role="ADMIN">
            <FinesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute role="ADMIN">
            <NotificationsPage />
          </ProtectedRoute>
        }
      />


      <Route
        path="/member/dashboard"
        element={
          <ProtectedRoute role="MEMBER">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/books"
        element={
          <ProtectedRoute role="MEMBER">
            <BrowseBooksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/loans"
        element={
          <ProtectedRoute role="MEMBER">
            <MyLoansPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/reservations"
        element={
          <ProtectedRoute role="MEMBER">
            <MyReservationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/fines"
        element={
          <ProtectedRoute role="MEMBER">
            <MyFinesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/notifications"
        element={
          <ProtectedRoute role="MEMBER">
            <MyNotificationsPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}
