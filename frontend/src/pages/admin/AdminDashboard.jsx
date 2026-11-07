import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import { getStoredComplaints, MOCK_ANALYTICS } from '../../utils/mockData';
import {
  FileText,
  Clock,
  ShieldCheck,
  UserCheck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    setComplaints(getStoredComplaints());
  }, []);

  const total = complaints.length;
  const newReports = complaints.filter((c) => c.status === 'SUBMITTED').length;
  const underVerification = complaints.filter((c) => c.status === 'UNDER_VERIFICATION').length;
  const verified = complaints.filter((c) => c.status === 'VERIFIED').length;
  const assigned = complaints.filter((c) => c.status === 'ASSIGNED').length;
  const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CITIZEN_FEEDBACK'
  ).length;

  const monthlyTrends = MOCK_ANALYTICS.monthlyTrends;
  const categoryData = MOCK_ANALYTICS.categoryBreakdown;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-indigo-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Central Municipal Administration Desk</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Municipal Operations Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
            Monitor real-time civic grievance traffic across all 8 municipal wards, dispatch field crews, and track statutory resolution SLA compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all"
          >
            Manage Grievances
          </Link>
          <Link
            to="/admin/workers"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
          >
            Dispatch Workers
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard title="Total Grievances" value={total} color="blue" />
        <StatCard title="New Unreviewed" value={newReports} color="amber" />
        <StatCard title="Under Verify" value={underVerification} color="purple" />
        <StatCard title="Ready to Assign" value={verified} color="indigo" />
        <StatCard title="In Progress" value={inProgress + assigned} color="blue" />
        <StatCard title="Total Resolved" value={resolved} color="emerald" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Inflow vs Resolution Trend
              </h3>
              <p className="text-xs text-slate-400">Total reported vs successfully fixed</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
              Demo Metrics
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
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
                <Bar dataKey="submitted" name="Reports Filed" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Issues Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Grievances by Category
              </h3>
              <p className="text-xs text-slate-400">Problem category frequency</p>
            </div>
          </div>

          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="count"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, idx) => (
                    <Cell key={`cat-${idx}`} fill={entry.color} />
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
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] pt-2 border-t border-slate-100">
            {categoryData.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center space-x-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-slate-600 truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Grievance Feed</h3>
            <p className="text-xs text-slate-500">Live stream of incoming citizen complaints</p>
          </div>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>Full Complaint Manager</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <ComplaintTable
          complaints={complaints.slice(0, 5)}
          linkPrefix="/admin/complaints"
          showCitizen={true}
          showWorker={true}
        />
      </div>
    </div>
  );
}
