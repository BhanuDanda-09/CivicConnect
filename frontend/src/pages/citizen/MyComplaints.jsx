import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoredComplaints } from '../../utils/mockData';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import { PlusCircle, LayoutGrid, ListFilter, ClipboardList } from 'lucide-react';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  useEffect(() => {
    setComplaints(getStoredComplaints());
  }, []);

  const tabFiltered = complaints.filter((c) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') {
      return ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'].includes(
        c.status
      );
    }
    if (activeTab === 'RESOLVED') {
      return ['RESOLVED', 'CITIZEN_FEEDBACK'].includes(c.status);
    }
    if (activeTab === 'REJECTED') {
      return c.status === 'REJECTED';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-sky-600" />
            <span>My Reported Grievances</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status updates, dispatched field personnel, and resolution evidence for your submissions.
          </p>
        </div>

        <Link
          to="/citizen/submit-complaint"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Filter Tabs & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All (${complaints.length})` },
            {
              id: 'ACTIVE',
              label: `In Progress (${
                complaints.filter((c) =>
                  ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'].includes(
                    c.status
                  )
                ).length
              })`,
            },
            {
              id: 'RESOLVED',
              label: `Resolved (${
                complaints.filter((c) => ['RESOLVED', 'CITIZEN_FEEDBACK'].includes(c.status)).length
              })`,
            },
            {
              id: 'REJECTED',
              label: `Rejected (${complaints.filter((c) => c.status === 'REJECTED').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Table View"
          >
            <ListFilter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Display Content */}
      {viewMode === 'cards' ? (
        tabFiltered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            No complaints found in this tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tabFiltered.map((c) => (
              <ComplaintCard key={c.id} complaint={c} linkPrefix="/citizen/complaints" />
            ))}
          </div>
        )
      ) : (
        <ComplaintTable
          complaints={tabFiltered}
          linkPrefix="/citizen/complaints"
          showWorker={true}
        />
      )}
    </div>
  );
}

