import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ArrowLeft,
  ChevronRight,
  Filter,
  Film,
} from 'lucide-react';
import { moviesApi, showtimesApi, cinemasApi } from '../api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function ShowtimesPage() {
  const { movieId } = useParams<{ movieId: string }>();

  // Filter states
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('');

  // Fetch Movie Info
  const { data: movieData } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => moviesApi.get(movieId!),
    enabled: !!movieId,
  });
  const movie = movieData?.movie || (movieData?.id ? movieData : undefined);

  // Fetch Cinemas for dropdown
  const { data: cinemas } = useQuery({
    queryKey: ['cinemas'],
    queryFn: () => cinemasApi.list(),
  });

  // Fetch Showtimes based on filters
  const { data: showtimes, isLoading } = useQuery({
    queryKey: ['showtimes', movieId, selectedDate, selectedCinemaId],
    queryFn: () =>
      showtimesApi.list({
        movieId: movieId || undefined,
        date: selectedDate || undefined,
        cinemaId: selectedCinemaId || undefined,
      }),
  });

  // Group showtimes by Cinema
  const groupedByCinema = React.useMemo(() => {
    if (!showtimes) return {};
    return showtimes.reduce<Record<string, { cinemaName: string; location?: string; items: typeof showtimes }>>(
      (acc, st) => {
        const cName = st.hall?.cinema?.name || 'Grand Horizon Cinema';
        const cLoc = st.hall?.cinema?.location || 'Downtown Center';
        if (!acc[cName]) {
          acc[cName] = { cinemaName: cName, location: cLoc, items: [] };
        }
        acc[cName].items.push(st);
        return acc;
      },
      {}
    );
  }, [showtimes]);

  return (
    <div className="flex flex-col min-h-full pb-16">
      {/* Movie Mini Header */}
      {movie && (
        <div className="bg-[#12121a] border-b border-[#2a2a3e] py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to={`/movies/${movie.id}`}
                className="w-12 h-16 rounded-lg overflow-hidden border border-[#2a2a3e] bg-[#1a1a2e] flex-shrink-0"
              >
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#7c3aed]">
                    <Film size={20} />
                  </div>
                )}
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="genre">{movie.genre}</Badge>
                  <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                    <Clock size={12} className="text-[#a855f7]" /> {movie.durationMinutes} min
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-white line-clamp-1">{movie.title}</h1>
              </div>
            </div>

            <Link
              to={`/movies/${movie.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to details
            </Link>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="sticky top-16 z-30 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2a2a3e] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Filter size={16} className="text-[#7c3aed]" />
            <span>Filter Screenings</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-[#12121a] border border-[#2a2a3e] rounded-lg px-3 py-1.5 text-xs text-[#f1f5f9]">
              <Calendar size={14} className="text-[#a855f7]" />
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer"
              />
            </div>

            {/* Cinema Dropdown */}
            <div className="flex items-center gap-2 bg-[#12121a] border border-[#2a2a3e] rounded-lg px-3 py-1.5 text-xs text-[#f1f5f9]">
              <MapPin size={14} className="text-[#a855f7]" />
              <select
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer pr-2"
              >
                <option value="" className="bg-[#12121a] text-white">
                  All Cinema Theaters
                </option>
                {cinemas?.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#12121a] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {(selectedDate !== todayStr || selectedCinemaId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(todayStr);
                  setSelectedCinemaId('');
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Showtimes List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {isLoading && (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6 shimmer">
                <div className="w-48 h-6 bg-[#2a2a3e] rounded mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-20 bg-[#2a2a3e] rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && Object.keys(groupedByCinema).length === 0 && (
          <div className="p-12 bg-[#1a1a2e]/40 border border-[#2a2a3e] rounded-2xl text-center max-w-lg mx-auto">
            <Ticket className="w-16 h-16 text-[#64748b] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-white mb-1">No Screenings Available</h3>
            <p className="text-sm text-[#94a3b8] mb-6">
              There are no showtimes matching your selected date and cinema criteria.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedDate(todayStr);
                setSelectedCinemaId('');
              }}
            >
              View Today's Full Schedule
            </Button>
          </div>
        )}

        {!isLoading && Object.keys(groupedByCinema).length > 0 && (
          <div className="flex flex-col gap-8">
            {Object.entries(groupedByCinema).map(([cinemaName, group]) => (
              <div
                key={cinemaName}
                className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6 sm:p-8"
              >
                {/* Cinema Header */}
                <div className="flex items-start justify-between pb-4 mb-6 border-b border-[#2a2a3e]">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <MapPin size={18} className="text-[#7c3aed]" />
                      {group.cinemaName}
                    </h3>
                    {group.location && (
                      <p className="text-xs text-[#94a3b8] mt-1 pl-6">{group.location}</p>
                    )}
                  </div>
                  <Badge variant="gold">Dolby Atmos • 4K Laser</Badge>
                </div>

                {/* Showtimes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {group.items.map((st) => {
                    const timeStr = new Date(st.startsAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <Link
                        key={st.id}
                        to={`/showtimes/${st.id}/seats`}
                        className="bg-[#12121a] border border-[#2a2a3e] hover:border-[#7c3aed] rounded-xl p-3.5 transition-all duration-200 card-hover flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg font-bold text-white group-hover:text-[#a855f7] transition-colors">
                            {timeStr}
                          </span>
                          <span className="text-xs font-semibold text-[#f59e0b]">
                            ${st.ticketPrice.toFixed(2)}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#94a3b8] mb-3">
                          {st.hall?.name || 'Main Auditorium'}
                        </div>

                        <div className="pt-2 border-t border-[#2a2a3e] flex items-center justify-between text-[11px] font-semibold text-[#a855f7]">
                          <span>Reserve</span>
                          <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

