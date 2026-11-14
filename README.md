# 🎬 CINEPLEX — Movie Reservation System Frontend

A modern, responsive, high-performance web application for cinema ticketing and seat reservations built with React 19, TypeScript, Tailwind CSS v4, and TanStack React Query.

Backend API: [Movie Reservation System API](https://movie-reservation-system-ten.vercel.app/api/docs)

---

## ✨ Features

- **Discover & Catalog**: Hero banner with live search, genre filters, and responsive movie cards with duration and release year.
- **Movie Details**: Ambient backdrop, expandable synopsis, and upcoming screening previews.
- **Showtime Scheduler & Filter**: Filter screenings by date and cinema facility.
- **Auditorium Seat Selection**:
  - Curved perspective cinema screen visual.
  - Interactive seat matrix (Standard & VIP seating with crown indicators).
  - Real-time seat availability and conflict prevention.
  - Sticky booking summary bar.
- **Booking Voucher & Confirmation**: Reservation reference code, seat numbers, and total amount.
- **User Booking Management**: Active vs. cancelled statistics, total spend tracking, and 1-click booking cancellation with seat pool release.
- **Admin Command Center**:
  - 📊 **Reports**: Box office revenue & reservation volume breakdown by movie.
  - 🎬 **Movies**: Add, edit, and delete movie catalog entries.
  - 🏛️ **Cinemas & Halls**: Create theaters and auto-generate auditoriums with custom seat rows.
  - 🗓️ **Showtimes**: Schedule screenings with collision detection guards.
- **Authentication**: JWT token management, persistent state (Zustand), and role-based route guards.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Data Fetching & Caching**: [@tanstack/react-query v5](https://tanstack.com/query)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with localStorage persistence
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm or pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ahmedibrahimyassindev/Movie-Reservation-System-Front.git

# Navigate to project directory
cd Movie-Reservation-System-Front

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

---

## 🔑 Default Administrator Credentials

To access the Admin Command Center:

- **Email**: `admin@cineplex.com`
- **Password**: `Password123!`
- **Role**: `ADMIN`
