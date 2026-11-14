import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Film, AlertCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authApi.register({ name, email, password, role: 'USER' });
      const token = (response as any).token || (response as any).data?.token;
      const user = (response as any).user || (response as any).data?.user;

      if (token && user) {
        login(token, user);
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // If register doesn't return token immediately, attempt login
        const loginRes = await authApi.login({ email, password });
        const lToken = (loginRes as any).token || (loginRes as any).data?.token;
        const lUser = (loginRes as any).user || (loginRes as any).data?.user;
        if (lToken && lUser) {
          login(lToken, lUser);
          navigate(lUser.role === 'ADMIN' ? '/admin' : '/');
        } else {
          navigate('/login');
        }
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please check your information.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0a0a0f] text-[#f1f5f9]">
      {/* Left Column: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1a0a2e] via-[#12121a] to-[#0a0a0f] p-12 flex-col justify-between border-r border-[#2a2a3e]">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#7c3aed]/20 blur-[140px] rounded-full pointer-events-none" />

        <Link to="/" className="flex items-center gap-2.5 text-white z-10 w-fit">
          <Film className="text-[#7c3aed]" size={28} />
          <span className="text-2xl font-black tracking-widest text-gradient">
            CINEPLEX
          </span>
        </Link>

        <div className="z-10 max-w-lg">
          <span className="inline-block px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/40 text-xs font-semibold mb-4 uppercase tracking-wider">
            Join Cineplex
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Create your account and start watching movies today.
          </h2>
          <p className="text-[#94a3b8] text-base leading-relaxed">
            Gain instant access to real-time seat availability, frictionless booking cancellations, and administrator management controls.
          </p>
        </div>

        <div className="z-10 text-xs text-[#64748b]">
          © 2026 CINEPLEX Entertainment. All rights reserved.
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94a3b8] hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={14} /> Back to discover
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-sm text-[#94a3b8]">
              Join us to reserve seats and track all your cinema tickets.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-start gap-3">
              <AlertCircle className="text-[#ef4444] flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-[#ef4444]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Alice Walker"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              leftIcon={<UserIcon size={16} />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              leftIcon={<Lock size={16} />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign Up
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#2a2a3e] text-center">
            <p className="text-sm text-[#94a3b8]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#a855f7] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

