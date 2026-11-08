// ==============================================================================
// Complaint Card Skeleton (ComplaintCardSkeleton.jsx)
// ==============================================================================

import React from 'react';

export default function ComplaintCardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" data-testid="complaint-card-skeleton">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="h-44 bg-slate-200 rounded-2xl w-full"></div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/5"></div>
            </div>
            <div className="h-5 bg-slate-200 rounded w-4/5"></div>
            <div className="h-3 bg-slate-200 rounded w-full"></div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

