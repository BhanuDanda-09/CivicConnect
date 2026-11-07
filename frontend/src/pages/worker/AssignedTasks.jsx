import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getStoredComplaints } from '../../utils/mockData';
import { workerComplaintAPI } from '../../services/api';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { PRIORITY_LEVELS } from '../../utils/constants';
import { HardHat, MapPin, Calendar, ArrowRight, Eye, LayoutGrid, ListFilter, Loader2 } from 'lucide-react';

export default function AssignedTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards');

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const res = await workerComplaintAPI.getAssigned();
        if (res.data?.success && Array.isArray(res.data.data)) {
          setTasks(res.data.data);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend unavailable; loading local mock tasks:', err.message);
      }
      setTasks(getStoredComplaints());
      setIsLoading(false);
    };

    fetchTasks();
  }, [user]);

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ASSIGNED') return t.status === 'ASSIGNED';
    if (activeTab === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
    if (activeTab === 'RESOLVED') return t.status === 'RESOLVED' || t.status === 'CITIZEN_FEEDBACK';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <HardHat className="w-7 h-7 text-amber-600" />
          <span>My Assigned Field Tasks</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review dispatched civic infrastructure repair tasks, navigate on site, and document completion.
        </p>
      </div>

      {/* Tabs & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All Tasks (${tasks.length})` },
            {
              id: 'ASSIGNED',
              label: `Dispatched (${tasks.filter((t) => t.status === 'ASSIGNED').length})`,
            },
            {
              id: 'IN_PROGRESS',
              label: `In Progress (${tasks.filter((t) => t.status === 'IN_PROGRESS').length})`,
            },
            {
              id: 'RESOLVED',
              label: `Completed (${
                tasks.filter((t) => t.status === 'RESOLVED' || t.status === 'CITIZEN_FEEDBACK')
                  .length
              })`,
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

      {/* Content */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
          <p className="text-xs font-medium">Fetching dispatched worker assignments...</p>
        </div>
      ) : viewMode === 'cards' ? (
        filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            No tasks found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <ComplaintCard
                key={task.complaintId || task._id || task.id}
                complaint={{
                  ...task,
                  id: task.complaintId || task.id || task._id,
                  imageUrl: task.imageUrl || (task.images && task.images[0]) || '',
                }}
                linkPrefix="/worker/tasks"
              />
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Task ID</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTasks.map((item) => {
                  const targetId = item.complaintId || item.id || item._id;
                  return (
                    <tr key={targetId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {targetId}
                      </td>
                      <td className="py-3 px-4 max-w-xs font-medium text-slate-800 truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.categoryLabel || item.category}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {item.location}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            PRIORITY_LEVELS[item.priority]?.color || ''
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/worker/tasks/${targetId}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect & Update</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
