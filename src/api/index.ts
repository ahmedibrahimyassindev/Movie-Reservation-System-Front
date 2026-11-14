import { api } from '../lib/axios';
import type {
  Movie, Cinema, Hall, Showtime, Seat,
  Reservation, AuthResponse, ReservationReport, RevenueReport
} from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<any>('/api/auth/register', data).then(r => r.data as AuthResponse),

  login: (data: { email: string; password: string }) =>
    api.post<any>('/api/auth/login', data).then(r => r.data as AuthResponse),

  me: () =>
    api.get<any>('/api/auth/me').then(r => r.data?.data ?? r.data),
};

// ── Movies ────────────────────────────────────────────────────────────────────
export const moviesApi = {
  list: (params?: { genre?: string; search?: string }) =>
    api.get<any>('/api/movies', { params }).then(r => (r.data?.data ?? r.data) as Movie[]),

  get: (movieId: string) =>
    api.get<any>(`/api/movies/${movieId}`).then(r => r.data?.data ?? r.data),

  create: (data: Partial<Movie>) =>
    api.post<any>('/api/movies', data).then(r => (r.data?.data ?? r.data) as Movie),

  update: (movieId: string, data: Partial<Movie>) =>
    api.patch<any>(`/api/movies/${movieId}`, data).then(r => (r.data?.data ?? r.data) as Movie),

  delete: (movieId: string) =>
    api.delete<any>(`/api/movies/${movieId}`).then(r => r.data),
};

// ── Cinemas & Halls ───────────────────────────────────────────────────────────
export const cinemasApi = {
  list: () =>
    api.get<any>('/api/cinemas').then(r => (r.data?.data ?? r.data) as Cinema[]),

  create: (data: { name: string; location: string }) =>
    api.post<any>('/api/cinemas', data).then(r => (r.data?.data ?? r.data) as Cinema),

  halls: (cinemaId: string) =>
    api.get<any>(`/api/cinemas/${cinemaId}/halls`).then(r => (r.data?.data ?? r.data) as Hall[]),

  createHall: (cinemaId: string, data: { name: string; rows?: number; seatsPerRow?: number }) =>
    api.post<any>(`/api/cinemas/${cinemaId}/halls`, data).then(r => (r.data?.data ?? r.data) as Hall),
};

// ── Showtimes ─────────────────────────────────────────────────────────────────
export const showtimesApi = {
  list: (params?: { movieId?: string; cinemaId?: string; date?: string }) =>
    api.get<any>('/api/showtimes', { params }).then(r => (r.data?.data ?? r.data) as Showtime[]),

  create: (data: {
    movieId: string; hallId: string; startsAt: string;
    endsAt?: string; ticketPrice: number;
  }) =>
    api.post<any>('/api/showtimes', data).then(r => (r.data?.data ?? r.data) as Showtime),

  seats: (showtimeId: string) =>
    api.get<any>(`/api/showtimes/${showtimeId}/seats`).then(r => {
      const data = r.data?.data ?? r.data;
      if (Array.isArray(data)) {
        return { showtime: null, seats: data } as { showtime: any; seats: Seat[] };
      }
      return {
        showtime: data?.showtime ?? null,
        seats: Array.isArray(data?.seats) ? data.seats : [],
      } as { showtime: any; seats: Seat[] };
    }),
};

// ── Reservations ──────────────────────────────────────────────────────────────
export const reservationsApi = {
  create: (data: { showtimeId: string; seatIds: string[] }) =>
    api.post<any>('/api/reservations', data).then(r => (r.data?.data ?? r.data) as Reservation),

  me: () =>
    api.get<any>('/api/reservations/me').then(r => (r.data?.data ?? r.data) as Reservation[]),

  cancel: (reservationId: string) =>
    api.patch<any>(`/api/reservations/${reservationId}/cancel`).then(r => (r.data?.data ?? r.data) as Reservation),
};

// ── Admin Reports ─────────────────────────────────────────────────────────────
export const reportsApi = {
  reservations: () =>
    api.get<any>('/api/admin/reports/reservations').then(r => (r.data?.data ?? r.data) as ReservationReport),

  revenue: (params?: { startDate?: string; endDate?: string }) =>
    api.get<any>('/api/admin/reports/revenue', { params }).then(r => (r.data?.data ?? r.data) as RevenueReport),
};
