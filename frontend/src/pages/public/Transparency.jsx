// ==============================================================================
// Public Transparency & Governance Portal (Transparency.jsx)
// Open municipal metrics, resolution velocity, category distributions, and CSV export
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, ShieldCheck, Download, Award, FileText } from 'lucide-react';
import { communityAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Transparency() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await communityAPI.getTransparency();
        if (res.data?.success && res.data.data) {
          setMetrics(res.data.data);
        }
      } catch {
        toast.error('Unable to fetch public governance metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const handleDownloadCSV = () => {
    if (!metrics) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Grievances Logged', metrics.totalComplaints || 0],
      ['Successfully Resolved', metrics.resolvedComplaints || 0],
      ['In Progress Work', metrics.inProgressComplaints || 0],
      ['Pending Verification/Assignment', metrics.pendingComplaints || 0],
      ['Overall Resolution Rate (%)', `${metrics.resolutionRate || 0}%`],
      ['SLA Adherence Rate (%)', `${metrics.slaAdherenceRate || 0}%`],
      [],
      ['Category', 'Count'],
      ...(metrics.categoryStats || []).map((c) => [c.category, c.count]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicConnect_Transparency_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Public governance CSV report downloaded.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Public Governance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                National Civic Transparency Portal
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
                Review municipal resolution velocity, department service-level compliance, and verified repair records across Indian cities and municipalities.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Total Logged</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {loading ? '...' : metrics?.totalComplaints || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Fixed & Resolved</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {loading ? '...' : metrics?.resolvedComplaints || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Resolution Rate</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {loading ? '...' : `${metrics?.resolutionRate || 0}%`}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">SLA Adherence</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {loading ? '...' : `${metrics?.slaAdherenceRate || 0}%`}
              </h3>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Grievance Category Distribution
              </h2>
            </div>
            <div className="space-y-3 pt-2">
              {metrics?.categoryStats && metrics.categoryStats.length > 0 ? (
                metrics.categoryStats.map((item, idx) => {
                  const percent = metrics.totalComplaints > 0 ? Math.round((item.count / metrics.totalComplaints) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {item.category?.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-slate-500">{item.count} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500">No category statistics available.</p>
              )}
            </div>
          </div>

          {/* SLA Standard Policies */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Municipal Service-Level Agreements (SLA)
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              CivicConnect binds field operations to binding resolution milestones. Breached timelines automatically escalate grievances to higher zonal authorities.
            </p>
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
                <span className="font-bold text-rose-800 dark:text-rose-200">Critical Safety Hazards (Wires, Manholes)</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-300">Within 24 Hours</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                <span className="font-bold text-amber-800 dark:text-amber-200">High Priority (Drinking Water, Major Roads)</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300">Within 48 Hours</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900">
                <span className="font-bold text-sky-800 dark:text-sky-200">Medium Priority (Streetlights, Drainage)</span>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-300">Within 5 Days</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300">Low Priority (Routine Upkeep)</span>
                <span className="font-mono font-bold text-slate-600 dark:text-slate-400">Within 10 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
