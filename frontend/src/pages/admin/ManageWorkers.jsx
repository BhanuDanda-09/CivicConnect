import React, { useState } from 'react';
import { MOCK_WORKERS } from '../../utils/mockData';
import { CITY_WARDS } from '../../utils/constants';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { HardHat, PlusCircle, Star, Phone, Mail, CheckCircle, Clock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageWorkers() {
  const [workers, setWorkers] = useState(MOCK_WORKERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    email: '',
    phone: '',
    trade: 'Roads & Public Infrastructure',
    assignedZone: CITY_WARDS[0],
  });

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorker.name.trim() || !newWorker.email.trim()) {
      toast.error('Worker name and email are required');
      return;
    }

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
    toast.success(`Worker ${created.name} registered successfully! (Demo Mode)`);
    setIsModalOpen(false);
    setNewWorker({
      name: '',
      email: '',
      phone: '',
      trade: 'Roads & Public Infrastructure',
      assignedZone: CITY_WARDS[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HardHat className="w-7 h-7 text-indigo-600" />
            <span>Municipal Field Crew Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage municipal workers, view live workload distribution, and allocate department trades.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto"
        >
          Add Field Worker
        </Button>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{worker.name}</h3>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    {worker.trade}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <p className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{worker.email}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{worker.phone}</span>
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Zone: <strong>{worker.assignedZone}</strong>
                </p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1 text-center">
              <div className="bg-slate-50 p-1.5 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-medium">Active</span>
                <span className="text-xs font-bold text-sky-600">{worker.activeTasks}</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-medium">Resolved</span>
                <span className="text-xs font-bold text-emerald-600">{worker.completedTasks}</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-medium">Rating</span>
                <span className="text-xs font-bold text-amber-600 flex items-center justify-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {worker.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Worker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Municipal Field Worker"
      >
        <form onSubmit={handleAddWorker} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Full Worker Name
            </label>
            <input
              type="text"
              placeholder="e.g., Dilip Shinde"
              value={newWorker.name}
              onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Email
              </label>
              <input
                type="email"
                placeholder="dilip.worker@civic.org"
                value={newWorker.email}
                onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98111 22334"
                value={newWorker.phone}
                onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Trade / Specialization
            </label>
            <select
              value={newWorker.trade}
              onChange={(e) => setNewWorker({ ...newWorker, trade: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="Roads & Public Infrastructure">Roads & Public Infrastructure</option>
              <option value="Solid Waste & Sanitation">Solid Waste & Sanitation</option>
              <option value="Water Works & Drainage">Water Works & Drainage</option>
              <option value="Electrical & Street Lighting">Electrical & Street Lighting</option>
              <option value="Civil Engineering & Parks">Civil Engineering & Parks</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Assigned Ward
            </label>
            <select
              value={newWorker.assignedZone}
              onChange={(e) => setNewWorker({ ...newWorker, assignedZone: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            >
              {CITY_WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Worker
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
