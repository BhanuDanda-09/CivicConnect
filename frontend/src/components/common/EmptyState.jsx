// ==============================================================================
// Reusable Empty State Component (EmptyState.jsx)
// ==============================================================================

import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no active records matching your criteria.',
  actionText,
  onAction,
  actionLink,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs ${className}`}
      data-testid="empty-state"
    >
      <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      {actionText && (
        <div className="pt-2">
          {actionLink ? (
            <a
              href={actionLink}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-colors"
            >
              {actionText}
            </a>
          ) : (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

