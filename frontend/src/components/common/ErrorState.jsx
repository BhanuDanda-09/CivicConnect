// ==============================================================================
// Reusable Error State Component (ErrorState.jsx)
// ==============================================================================

import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while fetching information from the municipal server.',
  onRetry,
  isNetworkError = false,
  className = '',
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl border border-rose-200/90 dark:border-rose-900/50 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs transition-colors ${className}`}
      data-testid="error-state"
    >
      <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/40">
        {isNetworkError ? (
          <WifiOff className="w-8 h-8 text-rose-500 dark:text-rose-400" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
        )}
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
