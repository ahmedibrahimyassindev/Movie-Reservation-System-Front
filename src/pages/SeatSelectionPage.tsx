import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Armchair,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Check,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Crown,
  LogIn,
} from 'lucide-react';
import { showtimesApi, reservationsApi } from '../api';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import type { Seat } from '../types';

export default function SeatSelectionPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch real-time seat layout and showtime details
  const {
    data: seatData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['seats', showtimeId],
    queryFn: () => showtimesApi.seats(showtimeId!),
    enabled: !!showtimeId,
  });

  const showtime = seatData?.showtime;
  const seats: Seat[] = Array.isArray(seatData?.seats)
    ? seatData.seats
    : Array.isArray(seatData)
    ? (seatData as any)
    : [];

  // Group seats by row (e.g. A, B, C...)
  const seatsByRow = useMemo(() => {
    const grouped: Record<string, Seat[]> = {};
    seats.forEach((seat) => {
      const row = seat.row || 'A';
      if (!grouped[row]) grouped[row] = [];
      grouped[row].push(seat);
    });

    // Sort rows alphabetically, and seats within row by seat number
    const sortedKeys = Object.keys(grouped).sort();
    const sortedObj: Record<string, Seat[]> = {};
    sortedKeys.forEach((key) => {
      sortedObj[key] = grouped[key].sort((a, b) => a.number - b.number);
    });
    return sortedObj;
  }, [seats]);

  // Selected seat objects list
  const selectedSeatsList = useMemo(() => {
    return seats.filter((s) => selectedSeatIds.has(s.id));
  }, [seats, selectedSeatIds]);

  const ticketPrice = showtime?.ticketPrice ?? 15;
  const totalPrice = selectedSeatIds.size * ticketPrice;

  // Toggle seat selection
  const handleToggleSeat = (seat: Seat) => {
    const isReserved =
      seat.isAvailable !== undefined ? !seat.isAvailable : Boolean(seat.isReserved);
    if (isReserved) return;
    setErrorMessage(null);

    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      if (next.has(seat.id)) {
        next.delete(seat.id);
      } else {
        if (next.size >= 8) {
          setErrorMessage('You can select a maximum of 8 seats per booking.');
          return prev;
        }
        next.add(seat.id);
      }
      return next;
    });
  };

  // Reservation mutation
  const reservationMutation = useMutation({
    mutationFn: (seatIds: string[]) =>
      reservationsApi.create({
        showtimeId: showtimeId!,
        seatIds,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seats', showtimeId] });
      queryClient.invalidateQueries({ queryKey: ['reservations-me'] });
      navigate('/booking-confirmation', {
        state: {
          reservation: data,
          selectedSeats: selectedSeatsList,
          showtime,
        },
      });
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'One or more selected seats were just reserved by another guest. Please reselect.'
          : 'Failed to complete reservation. Please try again.');
      setErrorMessage(msg);
      refetch();
    },
  });

  const handleConfirmBooking = () => {
    if (selectedSeatIds.size === 0) return;

    // If user is not authenticated, prompt to sign in
    if (!token) {
      navigate('/login', {
        state: {
          from: location,
          message: 'Please sign in to confirm and save your seat reservation.',
        },
      });
      return;
    }

    reservationMutation.mutate(Array.from(selectedSeatIds));
  };

  // Movie and Cinema info helpers
  const movieTitle =
    typeof showtime?.movie === 'string'
      ? showtime.movie
      : showtime?.movie?.title || 'Screening Selection';

  const cinemaName =
    typeof showtime?.cinema === 'string'
      ? showtime.cinema
      : showtime?.cinema?.name || 'Grand Horizon Cinema';

  const hallName =
    typeof showtime?.hall === 'string'
      ? showtime.hall
      : showtime?.hall?.name || 'Main Auditorium';

  const startsAtFormatted = showtime?.startsAt
    ? new Date(showtime.startsAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="flex flex-col min-h-full pb-36">
      {/* Top Bar Navigation & Screening Info */}
      <div className="bg-[#12121a] border-b border-[#2a2a3e] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="text-left sm:text-center">
            <h1 className="text-lg font-bold text-white flex items-center gap-2 sm:justify-center">
              <Armchair size={18} className="text-[#7c3aed]" />
              {movieTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94a3b8] mt-0.5 sm:justify-center">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-[#7c3aed]" />
                {cinemaName} • {hallName}
              </span>
              {startsAtFormatted && (
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-[#a855f7]" />
                  {startsAtFormatted}
                </span>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="gold">${ticketPrice.toFixed(2)} / seat</Badge>
          </div>
        </div>
      </div>

      {/* Main Seat Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow flex flex-col items-center">
        {/* Error notification */}
        {errorMessage && (
          <div className="w-full max-w-xl mb-6 p-4 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 flex items-start gap-3">
            <AlertCircle size={18} className="text-[#ef4444] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#ef4444] font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Curved Cinema Screen Visual */}
        <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
          <div className="w-full h-3 rounded-[50%] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent shadow-[0_0_30px_rgba(168,85,247,0.7)]" />
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#94a3b8] mt-3 flex items-center gap-2">
            <Sparkles size={12} className="text-[#7c3aed]" />
            Auditorium Screen
            <Sparkles size={12} className="text-[#7c3aed]" />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-10 h-10 border-3 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#94a3b8]">Loading real-time seat availability...</span>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="p-8 text-center bg-[#1a1a2e] border border-[#ef4444]/30 rounded-2xl max-w-md">
            <AlertCircle size={36} className="text-[#ef4444] mx-auto mb-2" />
            <h3 className="text-base font-bold text-white mb-1">Failed to load seats</h3>
            <p className="text-xs text-[#94a3b8] mb-4">
              Unable to reach theater seating system. Please try again.
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Seat Grid */}
        {!isLoading && !isError && seats.length > 0 && (
          <div className="flex flex-col gap-3 items-center overflow-x-auto max-w-full p-4">
            {Object.entries(seatsByRow).map(([rowLabel, rowSeats]) => (
              <div key={rowLabel} className="flex items-center gap-2 sm:gap-3">
                {/* Row Label (Left) */}
                <span className="w-6 text-center text-xs font-bold text-[#64748b] select-none">
                  {rowLabel}
                </span>

                {/* Seats in Row */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeatIds.has(seat.id);
                    const isReserved =
                      seat.isAvailable !== undefined
                        ? !seat.isAvailable
                        : Boolean(seat.isReserved);
                    const isVip = seat.seatType === 'VIP';

                    let seatClass = 'seat-available';
                    if (isReserved) {
                      seatClass = 'seat-reserved';
                    } else if (isSelected) {
                      seatClass = 'seat-selected text-white';
                    } else if (isVip) {
                      seatClass = 'bg-[#1a1a2e] border-2 border-[#f59e0b]/60 text-[#fbbf24] hover:bg-[#7c3aed] hover:border-[#a855f7] hover:text-white cursor-pointer';
                    }

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={isReserved}
                        onClick={() => handleToggleSeat(seat)}
                        title={`Row ${seat.row}, Seat ${seat.number}${isVip ? ' (VIP)' : ''}${
                          isReserved ? ' (Reserved)' : ''
                        }`}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-semibold select-none transition-all duration-150 ${seatClass}`}
                      >
                        {isSelected ? (
                          <Check size={12} strokeWidth={3} />
                        ) : isVip && !isReserved ? (
                          <Crown size={12} className="text-[#f59e0b]" />
                        ) : (
                          seat.number
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Row Label (Right) */}
                <span className="w-6 text-center text-xs font-bold text-[#64748b] select-none">
                  {rowLabel}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-3.5 px-6 rounded-2xl bg-[#12121a] border border-[#2a2a3e]">
          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <div className="w-5 h-5 rounded-md seat-available border" />
            <span>Standard</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <div className="w-5 h-5 rounded-md bg-[#1a1a2e] border-2 border-[#f59e0b] flex items-center justify-center">
              <Crown size={10} className="text-[#f59e0b]" />
            </div>
            <span>VIP Seat</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <div className="w-5 h-5 rounded-md seat-selected flex items-center justify-center text-white">
              <Check size={11} strokeWidth={3} />
            </div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <div className="w-5 h-5 rounded-md seat-reserved" />
            <span>Reserved / Sold Out</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Summary Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-[#12121a]/95 backdrop-blur-lg border-t border-[#2a2a3e] p-4 sm:p-5 z-40 shadow-2xl">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex flex-col">
              <span className="text-xs text-[#94a3b8]">Selected Seats</span>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap max-w-xs">
                {selectedSeatsList.length === 0 ? (
                  <span className="text-[#64748b] font-normal">None selected</span>
                ) : (
                  selectedSeatsList.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/40 text-xs font-mono"
                    >
                      {s.row}{s.number}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="h-8 w-px bg-[#2a2a3e] hidden sm:block" />

            <div className="flex flex-col text-right sm:text-left">
              <span className="text-xs text-[#94a3b8]">Total Amount</span>
              <span className="text-xl font-extrabold text-[#f59e0b]">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="primary"
              size="lg"
              disabled={selectedSeatIds.size === 0}
              loading={reservationMutation.isPending}
              onClick={handleConfirmBooking}
              className="w-full sm:w-auto px-8 gap-2"
            >
              {token ? (
                <>
                  <ShieldCheck size={18} />
                  Confirm Reservation ({selectedSeatIds.size})
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In & Book ({selectedSeatIds.size})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
