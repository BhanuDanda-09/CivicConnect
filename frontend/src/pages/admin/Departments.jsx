// ==============================================================================
// Municipal Departments Directory (Departments.jsx)
// Operational governance view for departmental jurisdiction, workforce & SLA metrics
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { adminAnalyticsAPI } from '../../services/api';
import {
  Building2,
  Users,
  Clock,
  ShieldCheck,
  Search,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const MUNICIPAL_DEPARTMENTS = [
  {
    id: 'dept-roads',
    name: 'Roads, Bridges & Urban Infrastructure',
    code: 'PWD-RDS',
    head: 'Er. S. Venkat Rao (Superintending Engineer)',
    phone: '+91 40 2345 6781',
    email: 'roads.infra@civicconnect.gov.in',
    activeTickets: 34,
    slaTarget: '24–48 Hours',
    adherenceRate: '92.4%',
    categories: ['Road and Potholes', 'Footpaths', 'Dividers', 'Bridges'],
    staffCount: 48,
  },
  {
    id: 'dept-water',
    name: 'Water Supply and Sewerage Board',
    code: 'MWSSB-WAT',
    head: 'Er. Ananya Deshmukh (Chief Executive)',
    phone: '+91 40 2345 6782',
    email: 'watersupply@civicconnect.gov.in',
    activeTickets: 21,
    slaTarget: '12–24 Hours',
    adherenceRate: '95.1%',
    categories: ['Water Leakage', 'Contamination', 'Pressure Drop', 'Tanker Dispatch'],
    staffCount: 62,
  },
  {
    id: 'dept-drainage',
    name: 'Urban Stormwater & Drainage Directorate',
    code: 'SWM-DRN',
    head: 'Er. Rajeshwar Reddy (Executive Engineer)',
    phone: '+91 40 2345 6783',
    email: 'drainage.ops@civicconnect.gov.in',
    activeTickets: 19,
    slaTarget: '18–36 Hours',
    adherenceRate: '89.8%',
    categories: ['Drainage Overflow', 'Choked Manholes', 'Monsoon Flood Inlets'],
    staffCount: 36,
  },
  {
    id: 'dept-waste',
    name: 'Solid Waste Management Corporation',
    code: 'SWMC-SAN',
    head: 'Dr. Kavitha Sharma (Director of Sanitation)',
    phone: '+91 40 2345 6784',
    email: 'waste.sanitation@civicconnect.gov.in',
    activeTickets: 28,
    slaTarget: '24–36 Hours',
    adherenceRate: '94.2%',
    categories: ['Garbage Collection', 'Open Dumping', 'Community Bins', 'Litter Debris'],
    staffCount: 110,
  },
  {
    id: 'dept-lighting',
    name: 'Electrical & Public Lighting Utility',
    code: 'EPLU-LGT',
    head: 'Er. Mohammed Tariq (Divisional Engineer)',
    phone: '+91 40 2345 6785',
    email: 'streetlighting@civicconnect.gov.in',
    activeTickets: 15,
    slaTarget: '24–48 Hours',
    adherenceRate: '96.0%',
    categories: ['Streetlights', 'High-Mast Lights', 'Sparking Transformers', 'Dark Corridors'],
    staffCount: 42,
  },
  {
    id: 'dept-health',
    name: 'Public Health & Preventive Hygiene',
    code: 'PHPD-HLT',
    head: 'Dr. Arvind Swaminathan (Chief Medical Officer)',
    phone: '+91 40 2345 6786',
    email: 'publichealth@civicconnect.gov.in',
    activeTickets: 12,
    slaTarget: '24–72 Hours',
    adherenceRate: '91.5%',
    categories: ['Vector Fogging', 'Public Restrooms', 'Open Defecation', 'Disinfection'],
    staffCount: 55,
  },
];

export default function Departments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState(MUNICIPAL_DEPARTMENTS);

  const filteredDepts = departments.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(term) ||
      d.code.toLowerCase().includes(term) ||
      d.head.toLowerCase().includes(term) ||
      d.categories.some((c) => c.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Municipal Administrative Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Municipal Departments</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Directory of specialized civic directorates, workforce allocations, active complaint queues, and SLA enforcement.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search department, head officer, code, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-700 dark:text-slate-200">{filteredDepts.length}</span> Departments
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => (
          <div
            key={dept.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-black px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  {dept.code}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{dept.adherenceRate} SLA</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Head: {dept.head}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{dept.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{dept.email}</span>
                </div>
              </div>

              {/* Categories Covered */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Jurisdiction Scope
                </span>
                <div className="flex flex-wrap gap-1">
                  {dept.categories.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-base font-black text-slate-900 dark:text-white">{dept.activeTickets}</div>
                <div className="text-[10px] text-slate-400">Active Tasks</div>
              </div>
              <div>
                <div className="text-base font-black text-slate-900 dark:text-white">{dept.staffCount}</div>
                <div className="text-[10px] text-slate-400">Personnel</div>
              </div>
              <div>
                <div className="text-xs font-bold text-sky-600 dark:text-sky-400">{dept.slaTarget}</div>
                <div className="text-[10px] text-slate-400">Target SLA</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

