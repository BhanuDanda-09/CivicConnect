// ==============================================================================
// Dashboard Skeleton Screen (DashboardSkeleton.jsx)
// Pulsing placeholder skeleton for KPI cards, chart containers, and tables
// ==============================================================================

import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-10" data-testid="dashboard-skeleton">
      {/* Banner Skeleton */}
      <div className="h-44 bg-slate-200 rounded-3xl w-full"></div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-3xl p-4 space-y-3">
            <div className="h-3 bg-slate-300 rounded w-1/2"></div>
            <div className="h-7 bg-slate-300 rounded w-3/4"></div>
            <div className="h-2 bg-slate-300 rounded w-1/3"></div>
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-80 bg-slate-200 rounded-3xl"></div>
        <div className="lg:col-span-4 h-80 bg-slate-200 rounded-3xl"></div>
      </div>

      {/* Map Skeleton */}
      <div className="h-96 bg-slate-200 rounded-3xl w-full"></div>
    </div>
  );
}

