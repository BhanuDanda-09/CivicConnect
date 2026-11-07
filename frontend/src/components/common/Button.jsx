import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-[0.98]';

  const variants = {
    primary: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-900 border border-transparent shadow-slate-900/10',
    accent: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-600 border border-transparent shadow-sky-600/20',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-slate-400',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400 bg-transparent',
    teal: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-600 border border-transparent',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-600 border border-transparent',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-600 border border-transparent',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300 shadow-none',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
          {children}
        </>
      )}
    </button>
  );
}
