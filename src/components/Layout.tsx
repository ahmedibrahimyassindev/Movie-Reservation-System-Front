import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Film, Menu, X, LogOut, LayoutDashboard, Ticket, Compass } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-[#a855f7] bg-[#7c3aed]/10'
        : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a2e]'
    }`;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0f', color: '#f1f5f9' }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50"
        style={{
          backgroundColor: 'rgba(18, 18, 26, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #2a2a3e',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <Film size={24} style={{ color: '#7c3aed' }} />
              <span
                className="text-xl font-extrabold tracking-widest"
                style={{
                  background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CINEPLEX
              </span>
            </Link>

            {/* Center: Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" end className={navLinkClass}>
                <Compass size={15} />
                Discover
              </NavLink>
              <NavLink to="/my-reservations" className={navLinkClass}>
                <Ticket size={15} />
                My Bookings
              </NavLink>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" className={navLinkClass}>
                  <LayoutDashboard size={15} />
                  Admin Dashboard
                </NavLink>
              )}
            </div>

            {/* Right: Auth area (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {/* Avatar */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                    >
                      {getInitials(user.name || user.email || 'U')}
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#f1f5f9' }}>
                      {user.name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a1a2e';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#f1f5f9')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8')}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                    style={{ backgroundColor: '#7c3aed' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#6d28d9')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#7c3aed')}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors duration-200"
              style={{ color: '#94a3b8' }}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div
            className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1"
            style={{ borderTop: '1px solid #2a2a3e', backgroundColor: 'rgba(18,18,26,0.97)' }}
          >
            <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <Compass size={15} />
              Discover
            </NavLink>
            <NavLink to="/my-reservations" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <Ticket size={15} />
              My Bookings
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                <LayoutDashboard size={15} />
                Admin Dashboard
              </NavLink>
            )}
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid #2a2a3e' }}>
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                    >
                      {getInitials(user.name || user.email || 'U')}
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#f1f5f9' }}>
                      {user.name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium w-full text-left transition-colors duration-200"
                    style={{ color: '#94a3b8' }}
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    style={{ color: '#94a3b8', border: '1px solid #2a2a3e' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors duration-200"
                    style={{ backgroundColor: '#7c3aed' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="py-6 text-center text-sm"
        style={{
          backgroundColor: '#12121a',
          borderTop: '1px solid #2a2a3e',
          color: '#94a3b8',
        }}
      >
        © 2026 CINEPLEX. All rights reserved.
      </footer>
    </div>
  );
}
