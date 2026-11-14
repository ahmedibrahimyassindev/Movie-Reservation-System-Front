import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, AlertCircle, Film } from 'lucide-react';
import { moviesApi } from '../api';
import MovieCard from '../components/MovieCard';
import Button from '../components/ui/Button';

const GENRES = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: movies,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['movies', selectedGenre, searchQuery],
    queryFn: () =>
      moviesApi.list({
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        search: searchQuery.trim() || undefined,
      }),
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#2a2a3e] bg-gradient-to-b from-[#1a0a2e]/60 via-[#0a0a0f] to-[#0a0a0f]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7c3aed]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-xs font-semibold text-[#a855f7] mb-6">
            <Sparkles size={14} />
            <span>Premium Cinema Booking Experience</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Experience Stories <br className="hidden sm:inline" />
            <span className="text-gradient">On The Big Screen</span>
          </h1>

          <p className="text-base sm:text-lg text-[#94a3b8] max-w-2xl mb-8">
            Immerse yourself in blockbuster releases, Dolby Atmos sound, and luxurious reclining seats. Reserve your spot in seconds.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-xl relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748b]">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search movies by title, director, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12121a]/90 backdrop-blur-md border border-[#2a2a3e] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] text-white placeholder-[#64748b] text-sm rounded-xl pl-11 pr-4 py-3.5 outline-none transition-all duration-200 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {/* Genre Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {GENRES.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/25'
                    : 'bg-[#12121a] text-[#94a3b8] border border-[#2a2a3e] hover:border-[#7c3aed]/50 hover:text-white'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Film className="text-[#7c3aed]" size={24} />
            <span>Now Showing & Upcoming</span>
          </h2>
          {movies && (
            <span className="text-xs sm:text-sm text-[#94a3b8]">
              {movies.length} {movies.length === 1 ? 'Movie' : 'Movies'} found
            </span>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-[#2a2a3e] flex flex-col"
              >
                <div className="w-full aspect-[2/3] shimmer" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-4 bg-[#2a2a3e] rounded w-3/4 shimmer" />
                  <div className="h-3 bg-[#2a2a3e] rounded w-1/2 shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center p-12 bg-[#1a1a2e]/50 border border-[#ef4444]/30 rounded-2xl text-center max-w-lg mx-auto">
            <AlertCircle size={48} className="text-[#ef4444] mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Failed to load movies</h3>
            <p className="text-sm text-[#94a3b8] mb-6">
              Could not retrieve the movie catalog. Please check your network and try again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && movies && movies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#12121a] border border-[#2a2a3e] flex items-center justify-center text-[#64748b] mb-4">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No movies found</h3>
            <p className="text-sm text-[#94a3b8] max-w-md">
              We couldn't find any movies matching "{searchQuery || selectedGenre}". Try adjusting your filters or search keywords.
            </p>
            {(searchQuery || selectedGenre !== 'All') && (
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => {
                  setSelectedGenre('All');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Movies Grid */}
        {!isLoading && !isError && movies && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

