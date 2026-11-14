import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  leftIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#94a3b8]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-[#64748b] pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-[#12121a] border rounded-lg px-3.5 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] transition-all duration-200 outline-none
            ${leftIcon ? 'pl-10' : ''}
            ${error ? 'border-[#ef4444] focus:border-[#ef4444]' : 'border-[#2a2a3e] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]'}
            ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-[#ef4444] mt-0.5">{error}</span>}
    </div>
  );
}

