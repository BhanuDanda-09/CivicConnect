// ==============================================================================
// Municipal Field Crew Registry (ManageWorkers.jsx)
// Phase 6 - Dynamic Worker Dispatch, Workload Monitoring & Registry
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { MOCK_WORKERS } from '../../utils/mockData';
import { CITY_WARDS } from '../../utils/constants';
import { adminWorkerAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { HardHat, PlusCircle, Star, Phone, Mail, CheckCircle, Clock, Shield, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newWorker, setNewWorker] = useState({
    name: '',
    email: '',
    phone: '',
    trade: 'Roads & Public Infrastructure',
    assignedZone: CITY_WARDS[0],
    password: '',
  });

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const res = await adminWorkerAPI.getAll();
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setWorkers(res.data.data);
        return;
      }
    } catch (err) {
      console.warn('Worker registry notice:', err.message);
    }
    setWorkers(MOCK_WORKERS);
    setLoading(false);
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!newWorker.name.trim() || !newWorker.email.trim()) {
      toast.error('Worker name and email are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await adminWorkerAPI.create({
        fullName: newWorker.name.trim(),
        email: newWorker.email.trim(),
        mobileNumber: newWorker.phone ? newWorker.phone.trim() : '+91 98000 00000',
        trade: newWorker.trade,
        ward: newWorker.assignedZone,
        password: newWorker.password || 'Worker@12345',
      });

      if (res.data?.success) {
        toast.success(`Worker ${newWorker.name} registered successfully!`);
        await loadWorkers();
        setIsModalOpen(false);
        setNewWorker({
          name: '',
          email: '',
          phone: '',
          trade: 'Roads & Public Infrastructure',
          assignedZone: CITY_WARDS[0],
          password: '',
        });
        return;
      }
    } catch (err) {
      // Local fallback in demo mode
      const created = {
        id: `usr_w${Date.now()}`,
        name: newWorker.name,
        email: newWorker.email,
        phone: newWorker.phone || '+91 99000 11223',
        trade: newWorker.trade,
        assignedZone: newWorker.assignedZone,
        activeTasks: 0,
        completedTasks: 0,
        rating: 5.0,
        status: 'Available',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      };
      setWorkers([created, ...workers]);
      toast.success(`Worker ${created.name} registered! (Local Session)`);
      setIsModalOpen(false);
      setNewWorker({
        name: '',
        email: '',
        phone: '',
        trade: 'Roads & Public Infrastructure',
        assignedZone: CITY_WARDS[0],
        password: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <HardHat className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Municipal Field Crew Registry</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage municipal field technicians, view real-time task allocations, and assign trade specializations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadWorkers}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
            title="Reload Workers"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => setIsModalOpen(true)}
          >
            Add Field Worker
          </Button>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {workers.map((worker) => (
          <div
            key={worker.id || worker._id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header with status */}
              <div className="flex items-start justify-between">
                <div className="relative">
                  <img
                    src={
                      worker.avatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={worker.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-xs"
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                      worker.status === 'Available'
                        ? 'bg-emerald-500'
                        : worker.status === 'Busy'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  ></span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    worker.status === 'Available'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                      : worker.status === 'Busy'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {worker.status || 'Active'}
                </span>
              </div>

              {/* Name & Trade */}
              <div className="mt-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{worker.name}</h3>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">{worker.trade}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{worker.assignedZone}</p>
              </div>

              {/* Contact info */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{worker.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{worker.phone || worker.mobileNumber}</span>
                </div>
              </div>
            </div>

            {/* Performance Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Active Tasks</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{worker.activeTasks ?? 0}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Completed</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{worker.completedTasks ?? 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Worker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Municipal Field Officer"
      >
        <form onSubmit={handleAddWorker} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra Patel"
              value={newWorker.name}
              onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
              Official Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="worker@civicconnect.org"
              value={newWorker.email}
              onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
              Mobile Contact Number
            </label>
            <input
              type="tel"
              placeholder="+91 98000 12345"
              value={newWorker.phone}
              onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
              Trade Specialization
            </label>
            <select
              value={newWorker.trade}
              onChange={(e) => setNewWorker({ ...newWorker, trade: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Roads & Public Infrastructure">Roads & Public Infrastructure</option>
              <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
              <option value="Water Supply & Pipeline">Water Supply & Pipeline</option>
              <option value="Electrical & Street Lighting">Electrical & Street Lighting</option>
              <option value="Drainage & Sewage Works">Drainage & Sewage Works</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
              Assigned Municipal Ward
            </label>
            <select
              value={newWorker.assignedZone}
              onChange={(e) => setNewWorker({ ...newWorker, assignedZone: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {CITY_WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
