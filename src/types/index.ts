// API types matching the backend schema

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  genre: string;
  durationMinutes: number;
  releaseDate: string;
  showtimes?: Showtime[];
}

export interface Cinema {
  id: string;
  name: string;
  location: string;
}

export interface Hall {
  id: string;
  cinemaId: string;
  name: string;
  seatCapacity: number;
}

export interface Showtime {
  id: string;
  movieId: string;
  hallId: string;
  startsAt: string;
  endsAt: string;
  ticketPrice: number;
  movie?: Movie;
  hall?: Hall & { cinema?: Cinema };
}

export interface Seat {
  id: string;
  hallId?: string;
  row: string;
  number: number;
  seatType?: 'STANDARD' | 'VIP';
  isAvailable?: boolean;
  isReserved?: boolean;
}

export interface ShowtimeDetails {
  id: string;
  movie?: string | Movie;
  hall?: string | Hall;
  cinema?: string | Cinema;
  startsAt: string;
  endsAt?: string;
  ticketPrice: number;
  totalSeats?: number;
  availableSeats?: number;
}

export interface ShowtimeSeatsResponse {
  showtime: ShowtimeDetails;
  seats: Seat[];
}

export interface Reservation {
  id: string;
  userId: string;
  showtimeId: string;
  status: 'CONFIRMED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  showtime?: Showtime;
  seats?: Seat[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ReservationReport {
  total: number;
  confirmed: number;
  cancelled: number;
  byMovie: Array<{ movieId: string; title: string; count: number }>;
}

export interface RevenueReport {
  total: number;
  byMovie: Array<{ movieId: string; title: string; revenue: number; tickets: number }>;
}

