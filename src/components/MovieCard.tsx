import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Film } from 'lucide-react';
import type { Movie } from '../types';
import Badge from './ui/Badge';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group relative flex flex-col bg-[#1a1a2e] rounded-xl overflow-hidden border border-[#2a2a3e] card-hover cursor-pointer"
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-[2/3] bg-[#12121a] overflow-hidden">
        {movie.posterUrl && !imageError ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1a0a2e] to-[#0a0a0f] text-center">
            <Film className="w-12 h-12 text-[#7c3aed] mb-2 opacity-60" />
            <span className="text-sm font-semibold text-[#94a3b8] line-clamp-2">
              {movie.title}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent opacity-80" />

        {/* Genre Badge */}
        {movie.genre && (
          <div className="absolute top-2.5 right-2.5">
            <Badge variant="genre">{movie.genre}</Badge>
          </div>
        )}
      </div>

      {/* Movie Details */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-2">
        <h3 className="font-bold text-base text-[#f1f5f9] group-hover:text-[#a855f7] transition-colors line-clamp-1">
          {movie.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-[#94a3b8] pt-1 border-t border-[#2a2a3e]">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-[#a855f7]" />
            {formatDuration(movie.durationMinutes)}
          </span>
          {movie.releaseDate && (
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

