import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  Calendar,
  Film,
  Ticket,
  MapPin,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { moviesApi } from '../api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import type { Movie, Showtime } from '../types';

export default function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [descExpanded, setDescExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => moviesApi.get(movieId!),
    enabled: !!movieId,
  });

  // Normalize movie and showtimes data
  const movie: Movie | undefined = data?.movie || (data?.id ? data : undefined);
  const showtimes: Showtime[] = data?.showtimes || movie?.showtimes || [];

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-32 h-6 bg-[#2a2a3e] rounded shimmer mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-72 aspect-[2/3] bg-[#1a1a2e] rounded-2xl shimmer flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="w-48 h-6 bg-[#2a2a3e] rounded shimmer" />
            <div className="w-3/4 h-10 bg-[#2a2a3e] rounded shimmer" />
            <div className="w-1/2 h-5 bg-[#2a2a3e] rounded shimmer" />
            <div className="w-full h-32 bg-[#2a2a3e] rounded shimmer mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-sm text-[#94a3b8] mb-6 max-w-md mx-auto">
          We couldn't locate details for this movie. It may have been removed or the link is invalid.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Cinematic Hero */}
      <div className="relative min-h-[460px] md:min-h-[520px] overflow-hidden flex items-end">
        {/* Background Backdrop Image */}
        {movie.posterUrl && !imageError ? (
          <img
            src={movie.posterUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover filter blur-2xl scale-110 opacity-30 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#0a0a0f] to-[#0a0a0f]" />
        )}

        {/* Ambient Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-transparent to-[#0a0a0f]" />

        {/* Foreground Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Movies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Poster Card */}
            <div className="w-48 sm:w-60 md:w-72 aspect-[2/3] rounded-2xl overflow-hidden border border-[#2a2a3e] bg-[#1a1a2e] shadow-2xl flex-shrink-0 violet-glow">
              {movie.posterUrl && !imageError ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#1a0a2e] to-[#0a0a0f]">
                  <Film className="w-16 h-16 text-[#7c3aed] mb-3 opacity-60" />
                  <span className="font-bold text-white text-base">{movie.title}</span>
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                {movie.genre && <Badge variant="genre">{movie.genre}</Badge>}
                <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
                  <Clock size={13} className="text-[#a855f7]" />
                  {formatDuration(movie.durationMinutes)}
                </span>
                {movie.releaseDate && (
                  <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
                    <Calendar size={13} className="text-[#a855f7]" />
                    {formatDate(movie.releaseDate)}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {movie.description && (
                <div className="max-w-2xl text-sm sm:text-base text-[#94a3b8] leading-relaxed">
                  <p className={descExpanded ? '' : 'line-clamp-3'}>
                    {movie.description}
                  </p>
                  {movie.description.length > 180 && (
                    <button
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="text-xs font-semibold text-[#a855f7] hover:underline mt-1 cursor-pointer"
                    >
                      {descExpanded ? 'Show less' : 'Read full synopsis'}
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <Link to={`/movies/${movie.id}/showtimes`}>
                  <Button variant="primary" size="lg" className="gap-2">
                    <Ticket size={18} />
                    View Showtimes & Book
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Quick View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2a2a3e]">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Ticket className="text-[#7c3aed]" size={22} />
              Upcoming Showtimes
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
              Select a screening time below to proceed to seat selection.
            </p>
          </div>

          <Link
            to={`/movies/${movie.id}/showtimes`}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#a855f7] hover:text-[#c084fc] transition-colors"
          >
            All Filters <ChevronRight size={16} />
          </Link>
        </div>

        {showtimes.length === 0 ? (
          <div className="p-8 bg-[#1a1a2e]/60 border border-[#2a2a3e] rounded-2xl text-center">
            <Ticket className="w-12 h-12 text-[#64748b] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">
              No screenings currently scheduled
            </h3>
            <p className="text-sm text-[#94a3b8] mb-4">
              Check back soon or explore our dedicated showtimes browser.
            </p>
            <Link to={`/movies/${movie.id}/showtimes`}>
              <Button variant="secondary" size="sm">
                Explore Full Showtime Schedule
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {showtimes.map((st) => {
              const dateObj = new Date(st.startsAt);
              const timeFormatted = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateFormatted = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <Link
                  key={st.id}
                  to={`/showtimes/${st.id}/seats`}
                  className="bg-[#1a1a2e] border border-[#2a2a3e] hover:border-[#7c3aed] p-5 rounded-xl transition-all duration-200 card-hover flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-2">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar size={13} className="text-[#a855f7]" />
                        {dateFormatted}
                      </span>
                      <span className="font-bold text-[#f59e0b] text-sm">
                        ${st.ticketPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-2xl font-black text-white group-hover:text-[#a855f7] transition-colors mb-2">
                      {timeFormatted}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                      <MapPin size={13} className="text-[#64748b]" />
                      <span>
                        {st.hall?.cinema?.name || 'Grand Cinema'} • {st.hall?.name || 'Auditorium'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2a2a3e] flex items-center justify-between text-xs font-semibold text-[#a855f7]">
                    <span>Select Seats</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

