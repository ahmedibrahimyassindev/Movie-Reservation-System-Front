import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Ticket,
  Calendar,
  Clock,
  ArrowRight,
  Film,
  Sparkles,
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import type { Reservation, Seat } from '../types';

export default function BookingConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    reservation?: Reservation;
    selectedSeats?: Seat[];
  } | null;

  const reservation = state?.reservation;
  const selectedSeats = state?.selectedSeats;

  useEffect(() => {
    if (!reservation) {
      navigate('/my-reservations', { replace: true });
    }
  }, [reservation, navigate]);

  if (!reservation) {
    return null;
  }

  const reservationDate = reservation.createdAt
    ? new Date(reservation.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
      <div className="bg-[#1a1a2e] border border-[#7c3aed]/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center violet-glow">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#7c3aed]/20 blur-3xl rounded-full pointer-events-none" />

        {/* Success Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] mb-6 shadow-lg shadow-[#10b981]/20">
          <CheckCircle2 size={44} />
        </div>

        {/* Headings */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7c3aed]/15 border border-[#7c3aed]/30 text-xs font-semibold text-[#a855f7] mb-3">
          <Sparkles size={13} /> Reservation Successful
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          You're All Set!
        </h1>
        <p className="text-sm text-[#94a3b8] max-w-md mx-auto mb-8">
          Your cinema seats have been officially reserved and confirmed in the theater ticketing database.
        </p>

        {/* Ticket Details Card */}
        <div className="bg-[#12121a] border border-[#2a2a3e] rounded-2xl p-6 mb-8 text-left relative">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2a2a3e]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Booking Reference
              </span>
              <div className="font-mono text-sm font-bold text-white tracking-widest mt-0.5">
                {reservation.id ? reservation.id.slice(0, 13).toUpperCase() : 'RES-CONFIRMED'}
              </div>
            </div>
            <Badge variant="confirmed">Confirmed</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#64748b] block mb-1">Seats Reserved</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSeats && selectedSeats.length > 0 ? (
                  selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded bg-[#7c3aed]/20 text-[#a855f7] font-mono font-bold"
                    >
                      {s.row}{s.number}
                    </span>
                  ))
                ) : (
                  <span className="text-white font-medium">Standard Admission</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[#64748b] block mb-1">Total Paid / Due</span>
              <div className="text-lg font-black text-[#f59e0b]">
                ${(reservation.totalAmount || 0).toFixed(2)}
              </div>
            </div>

            <div className="col-span-2 pt-2 border-t border-[#2a2a3e] flex items-center justify-between text-[#94a3b8]">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#a855f7]" /> Reserved On
              </span>
              <span className="text-white font-medium">{reservationDate}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/my-reservations" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
              <Ticket size={18} />
              View My Bookings
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
              <Film size={18} />
              Browse More Movies
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

