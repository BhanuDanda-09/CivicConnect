// ==============================================================================
// Municipal Administrator Dashboard (AdminDashboard.jsx)
// Phase 6 - Real-time Analytics, Aggregations, Leaflet Map, and Action Center
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import ComplaintMap from '../../components/common/ComplaintMap';
import { adminAnalyticsAPI, adminWorkerAPI } from '../../services/api';
import { getStoredComplaints, MOCK_ANALYTICS, MOCK_WORKERS } from '../../utils/mockData';
import {
  ShieldCheck,
  FileText,
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  HardHat,
  Filter,
  RefreshCw,
  ExternalLink,
  MapPin,
  Flame,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PERIOD_OPTIONS = [
  { label: '7 Days', value: '7days' },
  { label: '30 Days', value: '30days' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: '12 Months', value: '12months' },
  { label: 'All Time', value: 'all' },
];

const STATUS_COLORS = {
  SUBMITTED: '#3b82f6',
  UNDER_VERIFICATION: '#6366f1',
  VERIFIED: '#8b5cf6',
  ASSIGNED: '#f59e0b',
  IN_PROGRESS: '#a855f7',
  RESOLVED: '#10b981',
  REJECTED: '#ef4444',
};

const CATEGORY_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];

export default function AdminDashboard() {
  const [period, setPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics state
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    overdue: 0,
    resolutionRate: 0,
  });

  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [pendingAttention, setPendingAttention] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);

  const loadDashboardData = async (selectedPeriod = period) => {
    try {
      setRefreshing(true);

      // Fetch analytics overview, ward breakdown, workers, and complaint locations in parallel
      const [overviewRes, wardRes, workerRes, locationRes] = await Promise.allSettled([
        adminAnalyticsAPI.getOverview({ period: selectedPeriod }),
        adminAnalyticsAPI.getWards(),
        adminWorkerAPI.getAll(),
        adminAnalyticsAPI.getComplaintLocations(),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.success) {
        const d = overviewRes.value.data.data;
        setSummary(d.summary || {});
        setStatusData(d.statusBreakdown || []);
        setCategoryData(d.categoryBreakdown || []);
        setPriorityData(d.priorityBreakdown || []);
        setMonthlyTrends(d.monthlyTrends || []);
        setPendingAttention(d.pendingAttention || []);
        setRecentComplaints(d.recentComplaints || []);
      } else {
        // Fallback for offline/demo
        const fallbackList = getStoredComplaints();
        const total = fallbackList.length;
        const pending = fallbackList.filter((c) => ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED'].includes(c.status)).length;
        const assigned = fallbackList.filter((c) => c.status === 'ASSIGNED').length;
        const inProgress = fallbackList.filter((c) => c.status === 'IN_PROGRESS').length;
        const resolved = fallbackList.filter((c) => ['RESOLVED', 'CITIZEN_FEEDBACK'].includes(c.status)).length;

        setSummary({
          total,
          pending,
          assigned,
          inProgress,
          resolved,
          rejected: 1,
          overdue: 2,
          resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        });
        setMonthlyTrends(MOCK_ANALYTICS.monthlyTrends);
        setCategoryData(MOCK_ANALYTICS.categoryBreakdown);
        setPendingAttention(fallbackList.slice(0, 3));
        setRecentComplaints(fallbackList.slice(0, 6));
      }

      if (wardRes.status === 'fulfilled' && wardRes.value.data?.success) {
        setWardData(wardRes.value.data.data || []);
      }

      if (workerRes.status === 'fulfilled' && workerRes.value.data?.success) {
        setWorkers(workerRes.value.data.data.slice(0, 5) || []);
      } else {
        setWorkers(MOCK_WORKERS.slice(0, 5));
      }

      if (locationRes.status === 'fulfilled' && locationRes.value.data?.success) {
        setMapLocations(locationRes.value.data.data || []);
      } else {
        const mockLocs = getStoredComplaints().map((c) => ({
          id: c.id,
          complaintId: c.complaintId || c.id,
          title: c.title,
          priority: c.priority,
          status: c.status,
          ward: c.ward,
          address: c.location,
          coordinates: [c.coordinates?.lat || 18.5204, c.coordinates?.lng || 73.8567],
        }));
        setMapLocations(mockLocs);
      }
    } catch (err) {
      console.warn('Dashboard fetch notice:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData(period);
  }, [period]);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Central Municipal Operations & Grievance Command Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            City Civic Grievance Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time municipal telemetry across 8 administrative wards. Dispatch field crews, analyze grievance velocity, and uphold statutory service level agreements (SLAs).
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all active:scale-95"
          >
            Manage Grievances
          </Link>
          <Link
            to="/admin/workers"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span>Field Workers</span>
          </Link>
          <button
            onClick={() => loadDashboardData(period)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Analytics Time Horizon:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === opt.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Reports"
          value={summary.total || 0}
          icon={FileText}
          color="blue"
          subtitle="All complaints"
        />
        <StatCard
          title="Pending Action"
          value={summary.pending || 0}
          icon={Clock}
          color="indigo"
          subtitle="Verification pipeline"
        />
        <StatCard
          title="Assigned Crew"
          value={summary.assigned || 0}
          icon={UserCheck}
          color="amber"
          subtitle="Dispatched to worker"
        />
        <StatCard
          title="In Progress"
          value={summary.inProgress || 0}
          icon={Wrench}
          color="purple"
          subtitle="Under active repair"
        />
        <StatCard
          title="Resolved"
          value={summary.resolved || 0}
          icon={CheckCircle2}
          color="green"
          subtitle={`${summary.resolutionRate || 0}% resolution rate`}
        />
        <StatCard
          title="Attention Req."
          value={summary.overdue || 0}
          icon={AlertTriangle}
          color="red"
          subtitle="High/Emergency SLA"
        />
      </div>

      {/* Urgent Attention / Overdue Escalation Banner (if any) */}
      {pendingAttention.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800 rounded-3xl p-5 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
              <Flame className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Priority Action Required: High Severity & Pending Grievances ({pendingAttention.length})</span>
            </div>
            <Link
              to="/admin/complaints?priority=EMERGENCY"
              className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 inline-flex items-center gap-1"
            >
              <span>View In Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingAttention.map((item) => (
              <div
                key={item.id || item.complaintId}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 shadow-xs flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {item.complaintId}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      item.priority === 'EMERGENCY'
                        ? 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300'
                        : 'bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{item.ward}</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Volume & Trajectory Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Grievance Volume & Resolution Trajectory
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Monthly reports filed vs. verified resolutions</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-transparent dark:border-slate-700">
              SLA Resolution: {summary.resolutionRate || 0}%
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
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
                <Area
                  type="monotone"
                  dataKey="submitted"
                  name="Reported Grievances"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSubmitted)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved Grievances"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Grievance Status Ratio</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Current state across municipal pipeline</p>
          </div>

          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData.filter((s) => s.count > 0)}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || '#64748b'}
                    />
                  ))}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.total || 0}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
            {statusData.slice(0, 4).map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[s.status] || '#64748b' }}
                  ></span>
                  <span className="capitalize">{s.status.toLowerCase().replace('_', ' ')}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ward Comparison & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ward-wise Analysis */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Ward Grievance Load & Resolution</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Total complaints vs. resolved per municipal ward</p>
            </div>
            <Link
              to="/admin/analytics"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis
                  dataKey="ward"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => val.split('-')[0].trim()}
                />
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
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="total" name="Total Filed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Department / Category Volume</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Grievances categorized by infrastructure type</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoryData.slice(0, 6)}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis
                  dataKey="category"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => val.replace('_', ' ')}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" name="Count" fill="#0ea5e9" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Geospatial Map Section */}
      <ComplaintMap
        locations={mapLocations}
        height="400px"
        title="Active Complaint Geo-Location Distribution"
        subtitle="OpenStreetMap telemetry showing pinned incident locations across the city"
        role="admin"
      />

      {/* Field Worker Workload Monitor & Recent Complaints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Field Worker Table */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Field Crew Workload</h3>
            </div>
            <Link
              to="/admin/workers"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {workers.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-xs">
                    {w.name ? w.name.charAt(0) : 'W'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{w.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{w.trade || 'Field Works'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      w.status === 'Available'
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {w.status || 'Active'}
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {w.activeTasks ?? w.assignedTasks ?? 0} Active / {w.completedTasks ?? 0} Done
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Complaints Feed */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Complaints Feed</h3>
            </div>
            <Link
              to="/admin/complaints"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Full List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Complaint</th>
                  <th className="py-2.5 px-3">Ward</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {recentComplaints.slice(0, 6).map((c) => (
                  <tr key={c.id || c.complaintId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.title}</div>
                      <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{c.complaintId}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px]">{c.ward}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          c.priority === 'EMERGENCY'
                            ? 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300'
                            : c.priority === 'HIGH'
                            ? 'bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300'
                            : 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to="/admin/complaints"
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
