import React from 'react';

interface BadgeProps {
  variant?: 'genre' | 'confirmed' | 'cancelled' | 'gold';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'genre', children, className = '' }: BadgeProps) {
  const styles = {
    genre: 'bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-[#a855f7]',
    confirmed: 'bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981]',
    cancelled: 'bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444]',
    gold: 'bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#fbbf24]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

