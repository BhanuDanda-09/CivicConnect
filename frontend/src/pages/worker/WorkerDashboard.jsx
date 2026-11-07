import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/dashboard/StatCard';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import { getStoredComplaints } from '../../utils/mockData';
import {
  HardHat,
  ClipboardList,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const list = getStoredComplaints();
    // Filter tasks assigned to worker (or all active tasks in demo mode)
    const myTasks = list.filter(
      (c) =>
        c.assignedWorker?.id === user?.id ||
        c.assignedWorker?.name === user?.name ||
        c.status === 'ASSIGNED' ||
        c.status === 'IN_PROGRESS' ||
        (c.status === 'RESOLVED' && c.assignedWorker)
    );
    setTasks(myTasks.length > 0 ? myTasks : list.slice(0, 3));
  }, [user]);

  const assignedCount = tasks.filter((t) => t.status === 'ASSIGNED').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter(
    (t) => t.status === 'RESOLVED' || t.status === 'CITIZEN_FEEDBACK'
  ).length;

  return (
    <div className="space-y-8">
      {/* Worker Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Field Worker Mobile Station • {user?.trade || 'Roads & Works'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, Officer {user?.name || 'Ramesh'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Review dispatched civic work orders, navigate to field coordinates, execute repairs, and upload resolution photographs.
          </p>
        </div>

        <Link
          to="/worker/tasks"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all shrink-0 active:scale-95"
        >
          <ClipboardList className="w-4 h-4" />
          <span>View All Tasks ({tasks.length})</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="New Dispatched Tasks"
          value={assignedCount}
          icon={Clock}
          color="amber"
          subtitle="Awaiting on-site start"
        />
        <StatCard
          title="Active in Progress"
          value={inProgressCount}
          icon={Wrench}
          color="purple"
          subtitle="Currently under repair"
        />
        <StatCard
          title="Completed & Closed"
          value={completedCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Work proof verified"
        />
      </div>

      {/* Dispatched Task Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Immediate Task Queue</h3>
            <p className="text-xs text-slate-500">Urgent grievances assigned to your crew</p>
          </div>
          <Link
            to="/worker/tasks"
            className="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            <span>Open Task Registry</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.slice(0, 3).map((task) => (
            <ComplaintCard key={task.id} complaint={task} linkPrefix="/worker/tasks" />
          ))}
        </div>
      </div>
    </div>
  );
}
