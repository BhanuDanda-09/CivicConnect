// ==============================================================================
// Municipal Civic Analytics Page (Analytics.jsx)
// Phase 6 - Comprehensive SLA, Cross-Departmental, and Ward Metrics
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { adminAnalyticsAPI } from '../../services/api';
import { MOCK_ANALYTICS } from '../../utils/mockData';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Filter,
  RefreshCw,
  Award,
  Users,
} from 'lucide-react';

const PERIOD_OPTIONS = [
  { label: '7 Days', value: '7days' },
  { label: '30 Days', value: '30days' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: '12 Months', value: '12months' },
];

const PRIORITY_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#0ea5e9',
  HIGH: '#f97316',
  EMERGENCY: '#ef4444',
};

export default function Analytics() {
  const [period, setPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [monthlyTrends, setMonthlyTrends] = useState(MOCK_ANALYTICS.monthlyTrends);
  const [categoryBreakdown, setCategoryBreakdown] = useState(MOCK_ANALYTICS.categoryBreakdown);
  const [priorityData, setPriorityData] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [workerPerformance, setWorkerPerformance] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    resolved: 0,
    resolutionRate: 0,
  });

  const loadData = async (selectedPeriod = period) => {
    try {
      setRefreshing(true);
      const [overviewRes, wardRes, workerRes] = await Promise.allSettled([
        adminAnalyticsAPI.getOverview({ period: selectedPeriod }),
        adminAnalyticsAPI.getWards(),
        adminAnalyticsAPI.getWorkers(),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.success) {
        const d = overviewRes.value.data.data;
        if (d.monthlyTrends?.length) setMonthlyTrends(d.monthlyTrends);
        if (d.categoryBreakdown?.length) setCategoryBreakdown(d.categoryBreakdown);
        if (d.priorityBreakdown?.length) setPriorityData(d.priorityBreakdown);
        if (d.summary) setSummary(d.summary);
      }

      if (wardRes.status === 'fulfilled' && wardRes.value.data?.success) {
        setWardData(wardRes.value.data.data || []);
      }

      if (workerRes.status === 'fulfilled' && workerRes.value.data?.success) {
        setWorkerPerformance(workerRes.value.data.data || []);
      }
    } catch (err) {
      console.warn('Analytics API error, using baseline demo data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Municipal Civic Analytics & Redressal Performance</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Statutory metrics, turnaround SLAs, and cross-ward grievance efficiency telemetry.
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-1.5 shadow-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === opt.value
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-indigo-600'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => loadData(period)}
            disabled={refreshing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resolution Compliance
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.resolutionRate || 85}%
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Above Statutory Municipal Benchmark</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Average Turnaround
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">18.4 hrs</h3>
            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>SLA Target: &lt; 48.0 hrs</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Field Crew Deployed
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {workerPerformance.length || 6} Officers
            </h3>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Active across 8 Wards</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top 2 Charts: Monthly Line & Category Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Grievance Volume & Resolution Trajectory
              </h3>
              <p className="text-xs text-slate-400">Progression over time horizon</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="submitted"
                  name="Reported Grievances"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved Grievances"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Urgency & Severity Distribution</h3>
            <p className="text-xs text-slate-400">Grievances grouped by urgency rating</p>
          </div>

          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={
                    priorityData.length > 0
                      ? priorityData
                      : [
                          { priority: 'LOW', count: 12 },
                          { priority: 'MEDIUM', count: 28 },
                          { priority: 'HIGH', count: 15 },
                          { priority: 'EMERGENCY', count: 5 },
                        ]
                  }
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(priorityData.length > 0 ? priorityData : ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).map(
                    (entry, idx) => {
                      const key = typeof entry === 'string' ? entry : entry.priority;
                      return <Cell key={idx} fill={PRIORITY_COLORS[key] || '#0ea5e9'} />;
                    }
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-100 dark:border-slate-800">
            {['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'].map((lvl) => (
              <div key={lvl} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[lvl] }}
                ></span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{lvl.toLowerCase()} Priority</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ward-wise Performance Breakdown */}
      {wardData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Ward Redressal Efficiency</h3>
            <p className="text-xs text-slate-400">Detailed breakdown across all administrative municipal wards</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Municipal Ward</th>
                  <th className="py-3 px-4 text-center">Total Reports</th>
                  <th className="py-3 px-4 text-center">Pending</th>
                  <th className="py-3 px-4 text-center">In Progress</th>
                  <th className="py-3 px-4 text-center">Resolved</th>
                  <th className="py-3 px-4 text-right">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {wardData.map((w) => (
                  <tr key={w.ward} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{w.ward}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">{w.total}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-amber-600 dark:text-amber-400">{w.pending}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-purple-600 dark:text-purple-400">{w.inProgress}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-emerald-600 dark:text-emerald-400">{w.resolved}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full text-[11px]">
                        {w.resolutionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
