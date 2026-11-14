import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Film,
  AlertCircle,
  XCircle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { reservationsApi } from '../api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import type { Reservation } from '../types';

export default function MyReservationsPage() {
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch current user reservations
  const { data: reservations, isLoading, isError, refetch } = useQuery({
    queryKey: ['reservations-me'],
    queryFn: () => reservationsApi.me(),
  });

  // Cancel reservation mutation
  const cancelMutation = useMutation({
    mutationFn: (reservationId: string) => reservationsApi.cancel(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations-me'] });
      setCancellingId(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to cancel reservation.');
      setCancellingId(null);
    },
  });

  const handleCancel = (reservationId: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation? The seats will be returned to the pool.')) {
      setCancellingId(reservationId);
      cancelMutation.mutate(reservationId);
    }
  };

  // Stats calculation
  const totalConfirmed = reservations?.filter((r) => r.status === 'CONFIRMED').length || 0;
  const totalSpent =
    reservations
      ?.filter((r) => r.status === 'CONFIRMED')
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0) || 0;

  // Filtered reservations
  const filteredReservations = reservations?.filter((r) => {
    if (filterTab === 'ALL') return true;
    return r.status === filterTab;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#2a2a3e] mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Ticket className="text-[#7c3aed]" size={30} />
            My Bookings
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Review and manage all your active movie ticket reservations.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="flex items-center gap-4">
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/15 text-[#10b981] flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold block">
                Active Bookings
              </span>
              <span className="text-xl font-black text-white">{totalConfirmed}</span>
            </div>
          </div>

          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold block">
                Total Spent
              </span>
              <span className="text-xl font-black text-[#f59e0b]">
                ${totalSpent.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#2a2a3e] pb-1">
        {(['ALL', 'CONFIRMED', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              filterTab === tab
                ? 'bg-[#7c3aed] text-white'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#12121a]'
            }`}
          >
            {tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-[#1a1a2e] rounded-2xl shimmer border border-[#2a2a3e]" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-8 text-center bg-[#1a1a2e] border border-[#ef4444]/30 rounded-2xl max-w-md mx-auto">
          <AlertCircle size={36} className="text-[#ef4444] mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">Failed to load reservations</h3>
          <p className="text-xs text-[#94a3b8] mb-4">
            Could not fetch your bookings. Please check your connection.
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredReservations && filteredReservations.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#12121a] border border-[#2a2a3e] flex items-center justify-center text-[#64748b] mb-4">
            <Ticket size={28} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No reservations found</h3>
          <p className="text-sm text-[#94a3b8] max-w-sm mb-6">
            You don't have any {filterTab !== 'ALL' ? filterTab.toLowerCase() : ''} bookings yet. Browse current screenings and book your tickets.
          </p>
          <Link to="/">
            <Button variant="primary">Discover Movies</Button>
          </Link>
        </div>
      )}

      {/* Reservations List */}
      {!isLoading && !isError && filteredReservations && filteredReservations.length > 0 && (
        <div className="flex flex-col gap-4">
          {filteredReservations.map((res: Reservation) => {
            const isConfirmed = res.status === 'CONFIRMED';
            const movie = res.showtime?.movie;
            const startsAt = res.showtime?.startsAt
              ? new Date(res.showtime.startsAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Screening Time Pending';

            return (
              <div
                key={res.id}
                className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#7c3aed]/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Poster Thumbnail */}
                  <div className="w-16 h-24 rounded-xl overflow-hidden bg-[#12121a] border border-[#2a2a3e] flex-shrink-0">
                    {movie?.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#7c3aed]">
                        <Film size={22} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={isConfirmed ? 'confirmed' : 'cancelled'}>
                        {res.status}
                      </Badge>
                      <span className="font-mono text-xs text-[#64748b]">
                        ID: {res.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {movie?.title || 'Cinema Screening'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#94a3b8]">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-[#a855f7]" />
                        {startsAt}
                      </span>
                      {res.showtime?.hall && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-[#a855f7]" />
                          {res.showtime.hall.cinema?.name || 'Grand Cinema'} • {res.showtime.hall.name}
                        </span>
                      )}
                    </div>

                    {res.seats && res.seats.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-[#64748b]">Seats:</span>
                        {res.seats.map((s) => (
                          <span
                            key={s.id}
                            className="px-1.5 py-0.5 rounded bg-[#7c3aed]/15 text-[#a855f7] font-mono text-[11px] font-bold"
                          >
                            {s.row}{s.number}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Price & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#2a2a3e]">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-[#64748b] block">Total Amount</span>
                    <span className="text-xl font-black text-[#f59e0b]">
                      ${(res.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  {isConfirmed && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={cancellingId === res.id}
                      onClick={() => handleCancel(res.id)}
                      className="gap-1.5"
                    >
                      <XCircle size={14} />
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

