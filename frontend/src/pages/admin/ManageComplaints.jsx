import React, { useState, useEffect } from 'react';
import {
  getStoredComplaints,
  updateComplaintStatusInStore,
  assignWorkerInStore,
  MOCK_WORKERS,
} from '../../utils/mockData';
import { adminComplaintAPI } from '../../services/api';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { ClipboardList, ShieldCheck, UserCheck, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState(MOCK_WORKERS[0].id);

  const reloadData = async () => {
    setIsLoading(true);
    try {
      const res = await adminComplaintAPI.getAll({ limit: 100 });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setComplaints(res.data.data);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable; loading local mock complaints:', err.message);
    }
    setComplaints(getStoredComplaints());
    setIsLoading(false);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Admin verifies complaint
  const handleVerify = async (id) => {
    try {
      await adminComplaintAPI.verify(id, { remarks: 'Inspected and verified by municipal desk.' });
      toast.success(`Complaint #${id} successfully VERIFIED!`);
    } catch (err) {
      console.warn('API verify failed; updating local mock store:', err.message);
      updateComplaintStatusInStore(
        id,
        'VERIFIED',
        'Complaint verified by municipal admin desk. Approved for field dispatch.',
        'Priya Deshmukh (Admin)'
      );
      toast.success(`Complaint #${id} VERIFIED (Offline Demo Mode)!`);
    }
    reloadData();
  };

  // Admin opens assign modal
  const handleOpenAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalOpen(true);
  };

  // Admin confirms assignment
  const handleConfirmAssign = async () => {
    if (!selectedComplaint) return;
    const worker = MOCK_WORKERS.find((w) => w.id === selectedWorkerId);

    try {
      await adminComplaintAPI.assign(selectedComplaint.id || selectedComplaint._id, {
        workerId: selectedWorkerId,
        priority: selectedComplaint.priority || 'MEDIUM',
        remarks: `Assigned to field worker ${worker?.name || 'Worker'}`,
      });
      toast.success(`Complaint #${selectedComplaint.id} assigned to ${worker?.name || 'Worker'}!`);
    } catch (err) {
      console.warn('API assign failed; updating local mock store:', err.message);
      assignWorkerInStore(selectedComplaint.id, worker, 'Priya Deshmukh (Admin)');
      toast.success(`Complaint #${selectedComplaint.id} assigned (Offline Demo Mode)!`);
    }

    setAssignModalOpen(false);
    setSelectedComplaint(null);
    reloadData();
  };

  // Admin opens reject modal
  const handleOpenReject = (complaint) => {
    setSelectedComplaint(complaint);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  // Admin confirms rejection
  const handleConfirmReject = async () => {
    if (!selectedComplaint) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      toast.error('Please enter a valid rejection reason (minimum 5 characters)');
      return;
    }

    try {
      await adminComplaintAPI.reject(selectedComplaint.id || selectedComplaint._id, {
        rejectionReason: rejectionReason.trim(),
      });
      toast.success(`Complaint #${selectedComplaint.id} marked as REJECTED.`);
    } catch (err) {
      console.warn('API reject failed; updating local mock store:', err.message);
      updateComplaintStatusInStore(
        selectedComplaint.id,
        'REJECTED',
        rejectionReason.trim(),
        'Priya Deshmukh (Admin)'
      );
      toast.success(`Complaint #${selectedComplaint.id} REJECTED (Offline Demo Mode).`);
    }

    setRejectModalOpen(false);
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
            Connected to CivicConnect REST API with automated audit trails and RBAC verification.
          </span>
        </span>
        <span className="font-mono text-[10px] bg-indigo-100 px-2 py-0.5 rounded text-indigo-800">
          Role: Municipal Admin
        </span>
      </div>

      {/* Loading indicator */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          <p className="text-xs font-medium">Synchronizing municipal complaint ledger...</p>
        </div>
      ) : (
        /* Full Complaint Management Table */
        <ComplaintTable
          complaints={complaints.map((c) => ({
            ...c,
            id: c.complaintId || c.id || c._id,
            imageUrl: c.imageUrl || (c.images && c.images[0]) || '',
          }))}
          linkPrefix="/citizen/complaints"
          showCitizen={true}
          showWorker={true}
          onVerify={handleVerify}
          onAssign={handleOpenAssign}
          onReject={handleOpenReject}
        />
      )}

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

      {/* Complaint Rejection Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Grievance #${selectedComplaint?.id}`}
        footer={
          <>
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              onClick={handleConfirmReject}
            >
              Confirm Rejection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-900">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Provide Formal Rejection Reason</span>
            </p>
            <p className="text-[11px] text-rose-700 mt-1">
              Citizens receive this explanation when their complaint is marked out-of-scope or duplicate.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Duplicate report of ongoing pipeline overhaul; private property out of municipal jurisdiction..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
