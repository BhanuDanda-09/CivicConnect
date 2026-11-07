import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/dashboard/StatCard';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import { getStoredComplaints } from '../../utils/mockData';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    // Load stored complaints
    const data = getStoredComplaints();
    setComplaints(data);
  }, []);

  const total = complaints.length;
  const pending = complaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_VERIFICATION' || c.status === 'VERIFIED'
  ).length;
  const inProgress = complaints.filter(
    (c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS'
  ).length;
  const resolved = complaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CITIZEN_FEEDBACK'
  ).length;

  const chartData = [
    { name: 'Pending Review', value: pending, color: '#f59e0b' },
    { name: 'Active Repair', value: inProgress, color: '#3b82f6' },
    { name: 'Resolved', value: resolved, color: '#10b981' },
  ].filter((d) => d.value > 0);

  const recentComplaints = complaints.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Citizen Dashboard • Ward 4</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Citizen'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Report local civic infrastructure hazards and track resolution progress with photo verification.
          </p>
        </div>

        <Link
          to="/citizen/submit-complaint"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20 transition-all shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reports"
          value={total}
          icon={FileText}
          color="blue"
          subtitle="All filed grievances"
        />
        <StatCard
          title="Pending Verification"
          value={pending}
          icon={Clock}
          color="amber"
          subtitle="Under desk review"
        />
        <StatCard
          title="Active Repairs"
          value={inProgress}
          icon={Wrench}
          color="purple"
          subtitle="Crew on site"
        />
        <StatCard
          title="Resolved Issues"
          value={resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Completed with photos"
        />
      </div>

      {/* Analytics & Quick Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Status Distribution Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Grievance Status Breakdown
            </h3>
            <p className="text-xs text-slate-500">Live proportional distribution of reports</p>
          </div>

          <div className="h-56 my-2 flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">No grievance data available</div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Resolution Rate</span>
            <span className="font-bold text-emerald-600">
              {total > 0 ? `${Math.round((resolved / total) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Quick Help & Citizen Rights Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-2.5 py-0.5 rounded-md">
              Citizen Charter
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Municipal Resolution Time Guarantees (SLA)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Under the Municipal Service Guarantee, civic problems reported with GPS coordinates and photographic evidence are bound by statutory resolution timelines:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900">Road Potholes & Pavement</p>
              <p className="text-slate-500 mt-0.5">SLA: <strong>48 hours</strong> from verification</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900">Garbage Accumulation</p>
              <p className="text-slate-500 mt-0.5">SLA: <strong>24 hours</strong> clearing timeline</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900">Water Pipeline Leakage</p>
              <p className="text-slate-500 mt-0.5">SLA: <strong>12 to 24 hours</strong> dispatch</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900">Streetlight Outages</p>
              <p className="text-slate-500 mt-0.5">SLA: <strong>24 hours</strong> lineman check</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>City Municipal Corporation Service Charter</span>
            <Link to="/about" className="text-sky-600 hover:text-sky-700 font-bold">
              Read More →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Recent Grievances</h3>
            <p className="text-xs text-slate-500">Latest issues submitted from your profile</p>
          </div>
          <Link
            to="/citizen/complaints"
            className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>View All ({complaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No grievances filed yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't reported any civic problems yet. If you see broken roads, trash, or water leaks, file a report!
            </p>
            <Link
              to="/citizen/submit-complaint"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report First Issue</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentComplaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} linkPrefix="/citizen/complaints" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

