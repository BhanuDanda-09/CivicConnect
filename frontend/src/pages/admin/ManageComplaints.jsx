import React, { useState, useEffect } from 'react';
import {
  getStoredComplaints,
  updateComplaintStatusInStore,
  assignWorkerInStore,
  MOCK_WORKERS
} from '../../utils/mockData';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { ClipboardList, ShieldCheck, XCircle, UserCheck, HardHat } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(MOCK_WORKERS[0].id);

  const reloadData = () => {
    setComplaints(getStoredComplaints());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Admin verifies complaint
  const handleVerify = (id) => {
    updateComplaintStatusInStore(
      id,
      'VERIFIED',
      'Complaint verified by municipal admin desk. Approved for field dispatch.',
      'Priya Deshmukh (Admin)'
    );
    toast.success(`Complaint #${id} successfully VERIFIED!`);
    reloadData();
  };

  // Admin opens assign modal
  const handleOpenAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalOpen(true);
  };

  // Admin confirms assignment
  const handleConfirmAssign = () => {
    if (!selectedComplaint) return;
    const worker = MOCK_WORKERS.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    assignWorkerInStore(selectedComplaint.id, worker, 'Priya Deshmukh (Admin)');
    toast.success(`Complaint #${selectedComplaint.id} assigned to ${worker.name}!`);
    setAssignModalOpen(false);
    setSelectedComplaint(null);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-indigo-600" />
          <span>Municipal Grievance Manager</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, authenticate, verify, and dispatch civic infrastructure grievances across all wards.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Demonstration Mode: Status changes and worker assignments persist in browser local storage.
          </span>
        </span>
        <span className="font-mono text-[10px] bg-indigo-100 px-2 py-0.5 rounded text-indigo-800">
          Role: Municipal Admin
        </span>
      </div>

      {/* Full Complaint Management Table */}
      <ComplaintTable
        complaints={complaints}
        linkPrefix="/citizen/complaints"
        showCitizen={true}
        showWorker={true}
        onVerify={handleVerify}
        onAssign={handleOpenAssign}
      />

      {/* Worker Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Dispatch Field Worker for #${selectedComplaint?.id}`}
        footer={
          <>
            <Button
              variant="primary"
              size="sm"
              icon={UserCheck}
              onClick={handleConfirmAssign}
            >
              Confirm Assignment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <p className="font-bold text-slate-800">{selectedComplaint?.title}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Location: {selectedComplaint?.location}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Field Officer / Crew Leader
            </label>
            <div className="space-y-2">
              {MOCK_WORKERS.map((worker) => (
                <label
                  key={worker.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedWorkerId === worker.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="worker"
                      value={worker.id}
                      checked={selectedWorkerId === worker.id}
                      onChange={() => setSelectedWorkerId(worker.id)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{worker.name}</p>
                      <p className="text-[10px] text-slate-500">{worker.trade} • {worker.assignedZone}</p>
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="font-semibold text-slate-700">
                      {worker.activeTasks} active tasks
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-bold">
                      {worker.status}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
