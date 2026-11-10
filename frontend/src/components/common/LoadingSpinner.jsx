// ==============================================================================
// Loading Spinner Component (LoadingSpinner.jsx)
// ==============================================================================

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading data...',
  className = '',
  inline = false,
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs ${className}`}>
        <Loader2 className={`${sizeClasses[size] || sizeClasses.sm} animate-spin text-sky-600 dark:text-sky-400`} />
        {message && <span>{message}</span>}
      </span>
    );
  }

  return (
    <div className={`py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-sky-600 dark:text-sky-400`} />
      {message && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{message}</p>}
    </div>
  );
}

