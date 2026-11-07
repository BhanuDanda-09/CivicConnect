import React from 'react';
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
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Analytics() {
  const { monthlyTrends, categoryBreakdown, priorityDistribution, resolutionPerformance } =
    MOCK_ANALYTICS;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-indigo-600" />
          <span>Municipal Civic Analytics & Redressal Performance</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics, SLA resolution turnarounds, and cross-departmental efficiency indicators.
        </p>
      </div>

      {/* Demo Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <span>
            Demonstration Figures: All metrics reflect simulated municipal workload for presentation and benchmarking.
          </span>
        </span>
        <span className="font-mono text-[10px] text-slate-500 font-semibold">City Corp SLA v2.4</span>
      </div>

      {/* Top 2 Charts: Monthly Line & Department Turnaround */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Grievance Volume & Resolution Trajectory
              </h3>
              <p className="text-xs text-slate-400">Monthly progression over 6 months</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
                  name="Grievances Reported"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Grievances Resolved"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Turnaround Performance */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Department SLA Turnaround (Hours)
            </h3>
            <p className="text-xs text-slate-400">Average resolution hours vs statutory target</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  dataKey="department"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={11}
                  width={90}
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="avgHours" name="Actual Avg (Hrs)" fill="#0284c7" radius={[0, 4, 4, 0]} />
                <Bar dataKey="targetHours" name="Target SLA (Hrs)" fill="#94a3b8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom 2 Charts: Category Distribution & Priority Share */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Share */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Category Share</h3>
            <p className="text-xs text-slate-400">Total complaints categorized by civic asset</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  dataKey="count"
                  paddingAngle={3}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {categoryBreakdown.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="truncate">{c.name}</span>
                </span>
                <span className="font-bold text-slate-800">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Urgency Classification</h3>
            <p className="text-xs text-slate-400">Percentage distribution across priority levels</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {priorityDistribution.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </span>
                <span className="font-bold text-slate-800">{p.value} cases</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

