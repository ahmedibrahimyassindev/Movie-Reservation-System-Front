import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Film, AlertCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fromState = (location.state as any)?.from;
  const from = typeof fromState === 'string' ? fromState : fromState?.pathname || '/';
  const infoMessage = (location.state as any)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      // The API response might return { token, user } or { data: { token, user } }
      const token = (response as any).token || (response as any).data?.token;
      const user = (response as any).user || (response as any).data?.user;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      login(token, user);

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to log in. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0a0a0f] text-[#f1f5f9]">
      {/* Left Column: Branding / Cinematic (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1a0a2e] via-[#12121a] to-[#0a0a0f] p-12 flex-col justify-between border-r border-[#2a2a3e]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c3aed]/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#a855f7]/15 blur-[100px] rounded-full pointer-events-none" />

        <Link to="/" className="flex items-center gap-2.5 text-white z-10 w-fit">
          <Film className="text-[#7c3aed]" size={28} />
          <span className="text-2xl font-black tracking-widest text-gradient">
            CINEPLEX
          </span>
        </Link>

        <div className="z-10 max-w-lg">
          <span className="inline-block px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/40 text-xs font-semibold mb-4 uppercase tracking-wider">
            Curated Cinema
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Step into the realm of premier cinema entertainment.
          </h2>
          <p className="text-[#94a3b8] text-base leading-relaxed">
            Instant booking, live seat maps, seamless showtime tracking, and exclusive theater privileges.
          </p>
        </div>

        <div className="z-10 text-xs text-[#64748b]">
          © 2026 CINEPLEX Entertainment. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94a3b8] hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={14} /> Back to discover
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-sm text-[#94a3b8]">
              Sign in to manage your bookings and reserve your favorite seats.
            </p>
          </div>

          {infoMessage && (
            <div className="mb-6 p-4 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/40 flex items-start gap-3">
              <Film className="text-[#a855f7] flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-[#f1f5f9]">{infoMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-start gap-3">
              <AlertCircle className="text-[#ef4444] flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-[#ef4444]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock size={16} />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#2a2a3e] text-center">
            <p className="text-sm text-[#94a3b8]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#a855f7] font-semibold hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

