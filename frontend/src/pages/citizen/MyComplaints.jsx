import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoredComplaints } from '../../utils/mockData';
import { complaintAPI } from '../../services/api';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import { PlusCircle, LayoutGrid, ListFilter, ClipboardList, Loader2 } from 'lucide-react';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const res = await complaintAPI.getMyComplaints();
        if (res.data?.success && Array.isArray(res.data.data)) {
          setComplaints(res.data.data);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend unavailable; loading local stored complaints:', err.message);
      }
      setComplaints(getStoredComplaints());
      setIsLoading(false);
    };

    fetchComplaints();
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            <span>My Reported Grievances</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track status updates, dispatched field personnel, and resolution evidence for your submissions.
          </p>
        </div>

        <Link
          to="/citizen/submit-complaint"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Filter Tabs & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-end sm:self-auto border border-transparent dark:border-slate-700">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Table View"
          >
            <ListFilter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
          <Loader2 className="w-7 h-7 animate-spin text-sky-600 dark:text-sky-400" />
          <p className="text-xs font-medium">Fetching complaints from municipal registry...</p>
        </div>
      ) : viewMode === 'cards' ? (
        tabFiltered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            No complaints found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tabFiltered.map((c) => (
              <ComplaintCard
                key={c.complaintId || c._id || c.id}
                complaint={{
                  ...c,
                  id: c.complaintId || c.id || c._id,
                  imageUrl: c.imageUrl || (c.images && c.images[0]) || '',
                }}
                linkPrefix="/citizen/complaints"
              />
            ))}
          </div>
        )
      ) : (
        <ComplaintTable
          complaints={tabFiltered.map((c) => ({
            ...c,
            id: c.complaintId || c.id || c._id,
            imageUrl: c.imageUrl || (c.images && c.images[0]) || '',
          }))}
          linkPrefix="/citizen/complaints"
          showWorker={true}
        />
      )}
    </div>
  );
}
