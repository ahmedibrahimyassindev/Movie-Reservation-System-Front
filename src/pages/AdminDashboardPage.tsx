import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Film,
  Building,
  Calendar,
  DollarSign,
  Ticket,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';
import {
  reportsApi,
  moviesApi,
  cinemasApi,
  showtimesApi,
} from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import type { Movie, Cinema, Showtime } from '../types';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MOVIES' | 'CINEMAS' | 'SHOWTIMES'>('OVERVIEW');

  // ----------------------------------------------------------------------
  // TAB 1: REPORTS (OVERVIEW)
  // ----------------------------------------------------------------------
  const { data: resReport, isLoading: resReportLoading } = useQuery({
    queryKey: ['admin-res-report'],
    queryFn: () => reportsApi.reservations(),
  });

  const { data: revReport, isLoading: revReportLoading } = useQuery({
    queryKey: ['admin-rev-report'],
    queryFn: () => reportsApi.revenue(),
  });

  // ----------------------------------------------------------------------
  // TAB 2: MOVIES
  // ----------------------------------------------------------------------
  const { data: movies, isLoading: moviesLoading } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: () => moviesApi.list(),
  });

  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    genre: '',
    durationMinutes: 120,
    posterUrl: '',
    description: '',
    releaseDate: '',
  });

  const saveMovieMutation = useMutation({
    mutationFn: (data: typeof movieForm) => {
      if (editingMovie) {
        return moviesApi.update(editingMovie.id, data);
      }
      return moviesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setMovieModalOpen(false);
      setEditingMovie(null);
      setMovieForm({
        title: '',
        genre: '',
        durationMinutes: 120,
        posterUrl: '',
        description: '',
        releaseDate: '',
      });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to save movie.');
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: (id: string) => moviesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete movie.');
    },
  });

  const handleEditMovie = (m: Movie) => {
    setEditingMovie(m);
    setMovieForm({
      title: m.title,
      genre: m.genre,
      durationMinutes: m.durationMinutes,
      posterUrl: m.posterUrl || '',
      description: m.description || '',
      releaseDate: m.releaseDate ? m.releaseDate.split('T')[0] : '',
    });
    setMovieModalOpen(true);
  };

  // ----------------------------------------------------------------------
  // TAB 3: CINEMAS & HALLS
  // ----------------------------------------------------------------------
  const { data: cinemas, isLoading: cinemasLoading } = useQuery({
    queryKey: ['admin-cinemas'],
    queryFn: () => cinemasApi.list(),
  });

  const [cinemaForm, setCinemaForm] = useState({ name: '', location: '' });
  const [expandedCinemaId, setExpandedCinemaId] = useState<string | null>(null);
  const [hallForm, setHallForm] = useState({ name: '', rows: 5, seatsPerRow: 10 });
  const [selectedCinemaForHall, setSelectedCinemaForHall] = useState<string | null>(null);

  const createCinemaMutation = useMutation({
    mutationFn: (data: typeof cinemaForm) => cinemasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cinemas'] });
      queryClient.invalidateQueries({ queryKey: ['cinemas'] });
      setCinemaForm({ name: '', location: '' });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create cinema.');
    },
  });

  const createHallMutation = useMutation({
    mutationFn: ({ cinemaId, data }: { cinemaId: string; data: typeof hallForm }) =>
      cinemasApi.createHall(cinemaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-halls', selectedCinemaForHall] });
      setSelectedCinemaForHall(null);
      setHallForm({ name: '', rows: 5, seatsPerRow: 10 });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create hall.');
    },
  });

  // Fetch halls for expanded cinema
  const { data: expandedHalls } = useQuery({
    queryKey: ['admin-halls', expandedCinemaId],
    queryFn: () => cinemasApi.halls(expandedCinemaId!),
    enabled: !!expandedCinemaId,
  });

  // ----------------------------------------------------------------------
  // TAB 4: SHOWTIMES
  // ----------------------------------------------------------------------
  const { data: allShowtimes, isLoading: showtimesLoading } = useQuery({
    queryKey: ['admin-showtimes'],
    queryFn: () => showtimesApi.list(),
  });

  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    cinemaId: '',
    hallId: '',
    startsAt: '',
    ticketPrice: 15.0,
  });

  // Fetch halls for selected cinema in showtime form
  const { data: formHalls } = useQuery({
    queryKey: ['admin-halls', showtimeForm.cinemaId],
    queryFn: () => cinemasApi.halls(showtimeForm.cinemaId),
    enabled: !!showtimeForm.cinemaId,
  });

  const createShowtimeMutation = useMutation({
    mutationFn: (data: typeof showtimeForm) =>
      showtimesApi.create({
        movieId: data.movieId,
        hallId: data.hallId,
        startsAt: new Date(data.startsAt).toISOString(),
        ticketPrice: Number(data.ticketPrice),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-showtimes'] });
      queryClient.invalidateQueries({ queryKey: ['showtimes'] });
      setShowtimeForm({
        movieId: '',
        cinemaId: '',
        hallId: '',
        startsAt: '',
        ticketPrice: 15.0,
      });
      alert('Showtime created successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create showtime (Check for scheduling conflicts).');
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#2a2a3e] mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <LayoutDashboard className="text-[#7c3aed]" size={30} />
            Admin Command Center
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            System metrics, movie catalog, cinema theater management & schedule dispatcher.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-[#12121a] rounded-xl border border-[#2a2a3e] overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Reports', icon: TrendingUp },
            { id: 'MOVIES', label: 'Movies', icon: Film },
            { id: 'CINEMAS', label: 'Cinemas & Halls', icon: Building },
            { id: 'SHOWTIMES', label: 'Showtimes', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#7c3aed] text-white shadow-md'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: OVERVIEW & REPORTS */}
      {/* ==================================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="flex flex-col gap-8">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                  Total Bookings
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/15 text-[#a855f7] flex items-center justify-center">
                  <Ticket size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-white">
                {resReport?.total ?? 0}
              </div>
              <span className="text-xs text-[#94a3b8] mt-1 block">Lifetime reservations</span>
            </div>

            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                  Confirmed
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-white">
                {resReport?.confirmed ?? 0}
              </div>
              <span className="text-xs text-[#10b981] mt-1 block">Active admission passes</span>
            </div>

            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                  Cancelled
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#ef4444]/15 text-[#ef4444] flex items-center justify-center">
                  <XCircle size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-white">
                {resReport?.cancelled ?? 0}
              </div>
              <span className="text-xs text-[#ef4444] mt-1 block">Seats refunded & returned</span>
            </div>

            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                  Gross Revenue
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-[#f59e0b]">
                ${(revReport?.total ?? 0).toFixed(2)}
              </div>
              <span className="text-xs text-[#94a3b8] mt-1 block">Box office ticketing intake</span>
            </div>
          </div>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue by Movie */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-[#f59e0b]" />
                Box Office Revenue by Movie
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12121a] text-[#94a3b8] uppercase font-bold">
                    <tr>
                      <th className="py-3 px-4 rounded-l-lg">Movie</th>
                      <th className="py-3 px-4">Tickets</th>
                      <th className="py-3 px-4 rounded-r-lg text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3e]">
                    {revReport?.byMovie && revReport.byMovie.length > 0 ? (
                      revReport.byMovie.map((item) => (
                        <tr key={item.movieId} className="hover:bg-[#12121a]/50">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {item.title}
                          </td>
                          <td className="py-3.5 px-4 text-[#94a3b8] font-mono">
                            {item.tickets}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#f59e0b] text-right">
                            ${item.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-[#64748b]">
                          No sales data recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reservations by Movie */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Ticket size={18} className="text-[#7c3aed]" />
                Reservations Demand by Movie
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12121a] text-[#94a3b8] uppercase font-bold">
                    <tr>
                      <th className="py-3 px-4 rounded-l-lg">Movie Title</th>
                      <th className="py-3 px-4 rounded-r-lg text-right">Booking Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3e]">
                    {resReport?.byMovie && resReport.byMovie.length > 0 ? (
                      resReport.byMovie.map((item) => (
                        <tr key={item.movieId} className="hover:bg-[#12121a]/50">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {item.title}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#a855f7] text-right font-mono">
                            {item.count}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-[#64748b]">
                          No reservation history recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MOVIES MANAGEMENT */}
      {/* ==================================================================== */}
      {activeTab === 'MOVIES' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Movie Catalog ({movies?.length || 0})</h2>
            <Button
              variant="primary"
              onClick={() => {
                setEditingMovie(null);
                setMovieForm({
                  title: '',
                  genre: '',
                  durationMinutes: 120,
                  posterUrl: '',
                  description: '',
                  releaseDate: '',
                });
                setMovieModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus size={16} /> Add New Movie
            </Button>
          </div>

          {/* Modal / Form for Add / Edit Movie */}
          {movieModalOpen && (
            <div className="bg-[#12121a] border border-[#7c3aed]/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-4">
                {editingMovie ? `Edit Movie: ${editingMovie.title}` : 'Add Movie to Catalog'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMovieMutation.mutate(movieForm);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <Input
                  label="Movie Title *"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  required
                />
                <Input
                  label="Genre *"
                  placeholder="e.g. Sci-Fi, Action, Drama"
                  value={movieForm.genre}
                  onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                  required
                />
                <Input
                  label="Duration (Minutes) *"
                  type="number"
                  value={movieForm.durationMinutes}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, durationMinutes: parseInt(e.target.value) || 0 })
                  }
                  required
                />
                <Input
                  label="Release Date"
                  type="date"
                  value={movieForm.releaseDate}
                  onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Poster URL (HTTPS image link)"
                    placeholder="https://..."
                    value={movieForm.posterUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#94a3b8]">Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#12121a] border border-[#2a2a3e] rounded-lg p-3 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#7c3aed] outline-none"
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setMovieModalOpen(false);
                      setEditingMovie(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={saveMovieMutation.isPending}>
                    {editingMovie ? 'Save Changes' : 'Publish Movie'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Movies Table */}
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12121a] text-[#94a3b8] uppercase font-bold border-b border-[#2a2a3e]">
                  <tr>
                    <th className="py-3.5 px-4">Poster</th>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Genre</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Release</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3e]">
                  {movies?.map((m) => (
                    <tr key={m.id} className="hover:bg-[#12121a]/50">
                      <td className="py-3 px-4">
                        <div className="w-10 h-14 rounded overflow-hidden bg-[#12121a] border border-[#2a2a3e]">
                          {m.posterUrl ? (
                            <img src={m.posterUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#7c3aed]">
                              <Film size={14} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                        {m.title}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="genre">{m.genre}</Badge>
                      </td>
                      <td className="py-3 px-4 text-[#94a3b8]">{m.durationMinutes}m</td>
                      <td className="py-3 px-4 text-[#94a3b8]">
                        {m.releaseDate ? new Date(m.releaseDate).getFullYear() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditMovie(m)}
                            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#12121a] cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${m.title}"?`)) {
                                deleteMovieMutation.mutate(m.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#ef4444]/15 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: CINEMAS & HALLS */}
      {/* ==================================================================== */}
      {activeTab === 'CINEMAS' && (
        <div className="flex flex-col gap-8">
          {/* Create Cinema Form */}
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Building size={18} className="text-[#7c3aed]" />
              Add Cinema Facility
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCinemaMutation.mutate(cinemaForm);
              }}
              className="flex flex-col sm:flex-row gap-4 items-end"
            >
              <div className="flex-1 w-full">
                <Input
                  label="Cinema Name *"
                  placeholder="e.g. Grand Horizon IMAX"
                  value={cinemaForm.name}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex-1 w-full">
                <Input
                  label="Location Address *"
                  placeholder="e.g. Downtown Mall, 4th Floor"
                  value={cinemaForm.location}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, location: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" variant="primary" loading={createCinemaMutation.isPending}>
                Create Cinema
              </Button>
            </form>
          </div>

          {/* Cinemas List with Halls Expansion */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white">Registered Theaters & Auditoriums</h3>
            {cinemas?.map((c) => {
              const isExpanded = expandedCinemaId === c.id;
              return (
                <div
                  key={c.id}
                  className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl overflow-hidden"
                >
                  <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/15 text-[#a855f7] flex items-center justify-center flex-shrink-0">
                        <Building size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{c.name}</h4>
                        <span className="text-xs text-[#94a3b8] flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-[#7c3aed]" /> {c.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedCinemaForHall(c.id)}
                        className="gap-1.5"
                      >
                        <Plus size={14} /> Add Hall
                      </Button>
                      <button
                        onClick={() => setExpandedCinemaId(isExpanded ? null : c.id)}
                        className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#12121a] cursor-pointer"
                        title="View Halls"
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Add Hall inline form */}
                  {selectedCinemaForHall === c.id && (
                    <div className="bg-[#12121a] border-t border-[#2a2a3e] p-6">
                      <h5 className="text-sm font-bold text-white mb-3">
                        Generate Auditorium with Automated Seat Layout
                      </h5>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          createHallMutation.mutate({ cinemaId: c.id, data: hallForm });
                        }}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
                      >
                        <Input
                          label="Hall / Auditorium Name *"
                          placeholder="e.g. Hall 1 (Dolby Atmos)"
                          value={hallForm.name}
                          onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                          required
                        />
                        <Input
                          label="Seat Rows (A-Z)"
                          type="number"
                          min={1}
                          max={26}
                          value={hallForm.rows}
                          onChange={(e) =>
                            setHallForm({ ...hallForm, rows: parseInt(e.target.value) || 5 })
                          }
                          required
                        />
                        <Input
                          label="Seats Per Row"
                          type="number"
                          min={1}
                          max={30}
                          value={hallForm.seatsPerRow}
                          onChange={(e) =>
                            setHallForm({ ...hallForm, seatsPerRow: parseInt(e.target.value) || 10 })
                          }
                          required
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setSelectedCinemaForHall(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            loading={createHallMutation.isPending}
                          >
                            Build Seats
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Expanded Halls view */}
                  {isExpanded && (
                    <div className="bg-[#12121a]/60 border-t border-[#2a2a3e] p-6">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-4">
                        Auditoriums in this Facility
                      </h5>
                      {expandedHalls && expandedHalls.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {expandedHalls.map((h) => (
                            <div
                              key={h.id}
                              className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <Layers size={16} className="text-[#a855f7]" />
                                <span className="font-bold text-white text-sm">{h.name}</span>
                              </div>
                              <span className="text-xs text-[#94a3b8] font-mono">
                                {h.seatCapacity} Seats
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#64748b]">No auditoriums added yet.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: SHOWTIMES SCHEDULER */}
      {/* ==================================================================== */}
      {activeTab === 'SHOWTIMES' && (
        <div className="flex flex-col gap-8">
          {/* Create Showtime Form */}
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Calendar size={18} className="text-[#7c3aed]" />
              Schedule Screening (Collision Guard Enabled)
            </h3>
            <p className="text-xs text-[#94a3b8] mb-6">
              The backend ensures atomic conflict verification against existing hall schedules.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createShowtimeMutation.mutate(showtimeForm);
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end"
            >
              {/* Select Movie */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#94a3b8]">Select Movie *</label>
                <select
                  required
                  value={showtimeForm.movieId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                  className="bg-[#12121a] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c3aed]"
                >
                  <option value="">-- Choose Movie --</option>
                  {movies?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.durationMinutes}m)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Cinema */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#94a3b8]">Select Cinema *</label>
                <select
                  required
                  value={showtimeForm.cinemaId}
                  onChange={(e) =>
                    setShowtimeForm({ ...showtimeForm, cinemaId: e.target.value, hallId: '' })
                  }
                  className="bg-[#12121a] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c3aed]"
                >
                  <option value="">-- Choose Cinema --</option>
                  {cinemas?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Hall */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#94a3b8]">Select Auditorium / Hall *</label>
                <select
                  required
                  disabled={!showtimeForm.cinemaId}
                  value={showtimeForm.hallId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, hallId: e.target.value })}
                  className="bg-[#12121a] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c3aed] disabled:opacity-50"
                >
                  <option value="">
                    {showtimeForm.cinemaId ? '-- Choose Hall --' : '-- First Select Cinema --'}
                  </option>
                  {formHalls?.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.seatCapacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              {/* Starts At */}
              <Input
                label="Start Date & Time *"
                type="datetime-local"
                value={showtimeForm.startsAt}
                onChange={(e) => setShowtimeForm({ ...showtimeForm, startsAt: e.target.value })}
                required
              />

              {/* Ticket Price */}
              <Input
                label="Ticket Price ($) *"
                type="number"
                step="0.5"
                min="1"
                value={showtimeForm.ticketPrice}
                onChange={(e) =>
                  setShowtimeForm({ ...showtimeForm, ticketPrice: parseFloat(e.target.value) || 0 })
                }
                required
              />

              <Button
                type="submit"
                variant="primary"
                loading={createShowtimeMutation.isPending}
                className="w-full"
              >
                Schedule Showtime
              </Button>
            </form>
          </div>

          {/* All Scheduled Showtimes */}
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Upcoming Scheduled Screenings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12121a] text-[#94a3b8] uppercase font-bold border-b border-[#2a2a3e]">
                  <tr>
                    <th className="py-3.5 px-4">Movie</th>
                    <th className="py-3.5 px-4">Cinema & Hall</th>
                    <th className="py-3.5 px-4">Start Time</th>
                    <th className="py-3.5 px-4">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3e]">
                  {allShowtimes?.map((st: Showtime) => {
                    const startStr = new Date(st.startsAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={st.id} className="hover:bg-[#12121a]/50">
                        <td className="py-3 px-4 font-bold text-white">
                          {st.movie?.title || 'Screening'}
                        </td>
                        <td className="py-3 px-4 text-[#94a3b8]">
                          {st.hall?.cinema?.name || 'Grand Cinema'} • {st.hall?.name || 'Auditorium'}
                        </td>
                        <td className="py-3 px-4 text-white font-mono">{startStr}</td>
                        <td className="py-3 px-4 font-bold text-[#f59e0b]">
                          ${st.ticketPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

