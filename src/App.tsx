import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MovieDetailPage from './pages/MovieDetailPage'
import ShowtimesPage from './pages/ShowtimesPage'
import SeatSelectionPage from './pages/SeatSelectionPage'
import BookingConfirmationPage from './pages/BookingConfirmationPage'
import MyReservationsPage from './pages/MyReservationsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  const location = useLocation()
  return token ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies/:movieId" element={<MovieDetailPage />} />
        <Route path="/movies/:movieId/showtimes" element={<ShowtimesPage />} />
        <Route path="/showtimes/:showtimeId/seats" element={<SeatSelectionPage />} />
        <Route
          path="/booking-confirmation"
          element={<PrivateRoute><BookingConfirmationPage /></PrivateRoute>}
        />
        <Route
          path="/my-reservations"
          element={<PrivateRoute><MyReservationsPage /></PrivateRoute>}
        />
        <Route
          path="/admin"
          element={<AdminRoute><AdminDashboardPage /></AdminRoute>}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
