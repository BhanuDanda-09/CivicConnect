// ==============================================================================
// Table Skeleton Screen (TableSkeleton.jsx)
// ==============================================================================

import React from 'react';

export default function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs animate-pulse space-y-4" data-testid="table-skeleton">
      <div className="h-5 bg-slate-200 rounded w-1/4"></div>

      <div className="space-y-3 pt-2">
        <div className="h-8 bg-slate-100 rounded-xl w-full"></div>
        {[...Array(rows)].map((_, rIdx) => (
          <div key={rIdx} className="grid grid-cols-12 gap-3 items-center py-2.5 border-b border-slate-100">
            <div className="col-span-4 h-4 bg-slate-200 rounded"></div>
            <div className="col-span-3 h-4 bg-slate-200 rounded"></div>
            <div className="col-span-2 h-4 bg-slate-200 rounded"></div>
            <div className="col-span-3 h-4 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

