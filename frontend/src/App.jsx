import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-2 font-bold text-2xl shadow-inner">
          🏛️
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Smart Civic Complaint Portal
        </h1>
        <p className="text-slate-600 leading-relaxed text-sm">
          A modern civic-tech platform connecting citizens, municipal authorities, and field workers with automated CI/CD and real-time monitoring.
        </p>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-left space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <span>Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Phase 1 Initialized</span>
          </div>
          <p className="text-xs text-blue-700">
            Folder structure, Docker configuration, Kubernetes manifests, and CI/CD pipelines successfully created.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 font-medium text-slate-700">
            👥 Citizen
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 font-medium text-slate-700">
            🛡️ Admin
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 font-medium text-slate-700">
            👷 Worker
          </div>
        </div>
      </div>
    </div>
  );
}
