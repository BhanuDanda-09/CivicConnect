import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  color = 'blue',
  subtitle,
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', iconBg: 'bg-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', iconBg: 'bg-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', iconBg: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', iconBg: 'bg-rose-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', iconBg: 'bg-purple-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', iconBg: 'bg-indigo-600' },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-bold ${
              trend > 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>

      {(subtitle || trendLabel) && (
        <p className="mt-1 text-xs text-slate-400">
          {subtitle || `${trendLabel}`}
        </p>
      )}
    </div>
  );
}
