import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS, PRIORITY_LEVELS } from '../../utils/constants';
import { Search, Filter, Eye, ArrowUpDown, ChevronRight, Inbox } from 'lucide-react';

export default function ComplaintTable({
  complaints = [],
  linkPrefix = '/citizen/complaints',
  showCitizen = false,
  showWorker = false,
  onAssign = null,
  onVerify = null,
  onReject = null,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return complaints.map((item) => ({
      ...item,
      id: item.id || item.complaintId || item._id?.toString() || 'CC-UNKNOWN',
      title: item.title || '',
      location: item.location || '',
      citizenName: item.citizenName || item.citizen?.name || item.citizen?.fullName || '',
    })).filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.citizenName && item.citizenName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      return matchSearch && matchCategory && matchStatus && matchPriority;
    });
  }, [complaints, searchTerm, categoryFilter, statusFilter, priorityFilter]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-50/50 dark:bg-slate-950/60">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, title, locality, or citizen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="ALL">All Categories</option>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id} className="dark:bg-slate-900">
                {c.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="ALL">All Statuses</option>
            {Object.keys(COMPLAINT_STATUS).map((key) => (
              <option key={key} value={key} className="dark:bg-slate-900">
                {COMPLAINT_STATUS[key].label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="ALL">All Priorities</option>
            {Object.keys(PRIORITY_LEVELS).map((key) => (
              <option key={key} value={key} className="dark:bg-slate-900">
                {PRIORITY_LEVELS[key].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Body */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No complaints found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No complaints match your active filters or search terms. Try clearing the filters or searching with different keywords.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Complaint ID</th>
                <th className="py-3.5 px-4">Details</th>
                {showCitizen && <th className="py-3.5 px-4">Citizen</th>}
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Priority</th>
                {showWorker && <th className="py-3.5 px-4">Worker</th>}
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                  {/* ID */}
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {item.id}
                  </td>

                  {/* Title & Location */}
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{item.location}</p>
                  </td>

                  {/* Citizen info if enabled */}
                  {showCitizen && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{item.citizenName || 'N/A'}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.citizenPhone || ''}</p>
                    </td>
                  )}

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {item.categoryLabel || item.category}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={item.status} size="sm" />
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        PRIORITY_LEVELS[item.priority]?.color || ''
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  {/* Worker if enabled */}
                  {showWorker && (
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {item.assignedWorker ? (
                        <span className="font-medium text-slate-900 dark:text-white">{item.assignedWorker.name || item.assignedWorker}</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                  )}

                  {/* Date */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {formatDate(item.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                    {onVerify && (item.status === 'SUBMITTED' || item.status === 'UNDER_VERIFICATION') && (
                      <button
                        onClick={() => onVerify(item.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer border border-transparent dark:border-blue-800"
                      >
                        Verify
                      </button>
                    )}

                    {onReject && (item.status === 'SUBMITTED' || item.status === 'UNDER_VERIFICATION') && (
                      <button
                        onClick={() => onReject(item)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer border border-transparent dark:border-rose-800"
                      >
                        Reject
                      </button>
                    )}

                    {onAssign && item.status === 'VERIFIED' && (
                      <button
                        onClick={() => onAssign(item)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer border border-transparent dark:border-indigo-800"
                      >
                        Assign
                      </button>
                    )}

                    <Link
                      to={`${linkPrefix}/${item.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer Summary */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing <strong>{filtered.length}</strong> of <strong>{complaints.length}</strong> records
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
          CivicConnect Municipal Data View
        </span>
      </div>
    </div>
  );
}
