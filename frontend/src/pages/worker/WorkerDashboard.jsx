// ==============================================================================
// Field Worker Dashboard (WorkerDashboard.jsx)
// Phase 6 - Personal Metrics, Work Order Queue, Priority Routing & Incident Map
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/dashboard/StatCard';
import ComplaintMap from '../../components/common/ComplaintMap';
import StatusBadge from '../../components/common/StatusBadge';
import { workerComplaintAPI, workerAnalyticsAPI } from '../../services/api';
import { getStoredComplaints } from '../../utils/mockData';
import { formatDate } from '../../utils/formatDate';
import {
  HardHat,
  ClipboardList,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle,
  Play,
  CheckCircle,
  RefreshCw,
  Phone,
  Mail,
  Flame,
  Star,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL');

  const [metrics, setMetrics] = useState({
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0,
    completionRate: 0,
  });

  const loadWorkerData = async () => {
    try {
      setRefreshing(true);

      const [tasksRes, overviewRes, locationRes] = await Promise.allSettled([
        workerComplaintAPI.getAssigned(),
        workerAnalyticsAPI.getOverview(),
        workerAnalyticsAPI.getTaskLocations(),
      ]);

      let loadedTasks = [];
      if (tasksRes.status === 'fulfilled' && tasksRes.value.data?.success && Array.isArray(tasksRes.value.data.data)) {
        loadedTasks = tasksRes.value.data.data;
        setTasks(loadedTasks);
      } else {
        const stored = getStoredComplaints();
        loadedTasks = stored.filter(
          (c) =>
            c.assignedWorker?.id === user?.id ||
            c.assignedWorker?.name === user?.name ||
            ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(c.status)
        );
        setTasks(loadedTasks);
      }

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.success) {
        setMetrics(overviewRes.value.data.data.summary);
      } else {
        const assignedCount = loadedTasks.filter((t) => t.status === 'ASSIGNED').length;
        const inProgressCount = loadedTasks.filter((t) => t.status === 'IN_PROGRESS').length;
        const completedCount = loadedTasks.filter((t) =>
          ['RESOLVED', 'CITIZEN_FEEDBACK'].includes(t.status)
        ).length;
        const urgentCount = loadedTasks.filter(
          (t) => ['EMERGENCY', 'HIGH'].includes(t.priority) && t.status !== 'RESOLVED'
        ).length;
        const total = loadedTasks.length;
        setMetrics({
          totalAssigned: total,
          pending: assignedCount,
          inProgress: inProgressCount,
          completed: completedCount,
          urgent: urgentCount,
          completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
        });
      }

      if (locationRes.status === 'fulfilled' && locationRes.value.data?.success && Array.isArray(locationRes.value.data.data)) {
        setMapLocations(locationRes.value.data.data);
      } else {
        const locs = loadedTasks.map((t) => ({
          id: t.id || t._id,
          complaintId: t.complaintId || t.id,
          title: t.title,
          priority: t.priority,
          status: t.status,
          ward: t.ward,
          address: t.location,
          coordinates: [t.coordinates?.lat || 18.5204, t.coordinates?.lng || 73.8567],
        }));
        setMapLocations(locs);
      }
    } catch (err) {
      console.warn('Worker dashboard notice:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, [user]);

  const handleStartWork = async (taskId) => {
    try {
      const res = await workerComplaintAPI.startWork(taskId);
      if (res.data?.success) {
        toast.success('Task status updated to IN PROGRESS. Work order started!');
        loadWorkerData();
        return;
      }
    } catch (err) {
      // Local fallback for offline/demo
      setTasks((prev) =>
        prev.map((t) => ((t.id === taskId || t._id === taskId) ? { ...t, status: 'IN_PROGRESS' } : t))
      );
      toast.success('Task marked as IN PROGRESS (Local Session)!');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'ASSIGNED') return t.status === 'ASSIGNED';
    if (filterTab === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
    if (filterTab === 'RESOLVED') return t.status === 'RESOLVED' || t.status === 'CITIZEN_FEEDBACK';
    if (filterTab === 'URGENT') return ['EMERGENCY', 'HIGH'].includes(t.priority);
    return true;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Worker Banner & Profile Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Municipal Field Operations Hub • {user?.trade || 'Roads & Works Specialization'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Officer {user?.name || user?.fullName || 'Ramesh Patel'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Review dispatched civic repair tickets, inspect GIS coordinates on map, execute on-site remediation, and upload photographic evidence for resolution closure.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Zone: {user?.ward || 'Ward 1 - Central Market'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Performance: 4.9 / 5.0</span>
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>On-Duty & Available</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          <button
            onClick={loadWorkerData}
            disabled={refreshing}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <Link
            to="/worker/tasks"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Task Registry ({tasks.length})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="New Dispatched"
          value={metrics.pending || 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting on-site start"
        />
        <StatCard
          title="Active in Progress"
          value={metrics.inProgress || 0}
          icon={Wrench}
          color="purple"
          subtitle="Currently under repair"
        />
        <StatCard
          title="Completed & Closed"
          value={metrics.completed || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`${metrics.completionRate || 0}% resolution rate`}
        />
        <StatCard
          title="Urgent Escalations"
          value={metrics.urgent || 0}
          icon={Flame}
          color="red"
          subtitle="Emergency & High priority"
        />
      </div>

      {/* Geospatial Task Map */}
      <ComplaintMap
        locations={mapLocations}
        height="380px"
        title="Assigned Task Locations Map"
        subtitle="GPS pins for active work orders assigned to your crew across your municipal beat"
        role="worker"
      />

      {/* Task Queue with Inline Actions & Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Work Order Action Queue</h3>
            <p className="text-xs text-slate-400">Immediate repair tasks assigned to your mobile unit</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: 'All Tasks', value: 'ALL' },
              { label: 'Assigned', value: 'ASSIGNED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'RESOLVED' },
              { label: 'Urgent', value: 'URGENT' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterTab(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterTab === tab.value
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Task / Ticket</th>
                <th className="py-3 px-4">Location / Ward</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reported On</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No work orders found matching this filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id || task._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{task.title}</div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {task.complaintId || task.id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs">
                      <div className="truncate">{task.location || task.ward}</div>
                      {(task.latitude || task.coordinates?.lat) && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude || task.coordinates.lat},${task.longitude || task.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[10px] text-sky-600 hover:text-sky-700 font-bold mt-0.5"
                        >
                          <Navigation className="w-2.5 h-2.5" />
                          <span>GPS Route</span>
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          task.priority === 'EMERGENCY'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'HIGH'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {formatDate(task.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {task.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleStartWork(task.id || task._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-slate-950" />
                          <span>Start</span>
                        </button>
                      )}

                      {task.status === 'IN_PROGRESS' && (
                        <Link
                          to={`/worker/tasks/${task.id || task._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Resolve</span>
                        </Link>
                      )}

                      <Link
                        to={`/worker/tasks/${task.id || task._id}`}
                        className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
