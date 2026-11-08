import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getStoredComplaints, updateComplaintStatusInStore } from '../../utils/mockData';
import { workerComplaintAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import MapPicker from '../../components/common/MapPicker';
import Button from '../../components/common/Button';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { PRIORITY_LEVELS } from '../../utils/constants';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Wrench,
  CheckCircle2,
  UploadCloud,
  X,
  AlertCircle,
  HardHat,
  Image as ImageIcon,
  Loader2,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionImageFile, setCompletionImageFile] = useState(null);
  const [completionImagePreview, setCompletionImagePreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      try {
        const res = await workerComplaintAPI.getById(id);
        if (res.data?.success && res.data.data) {
          const comp = res.data.data;
          setTask({
            ...comp,
            id: comp.complaintId || comp._id,
            imageUrl: comp.imageUrl || (comp.images && comp.images[0]) || '',
            coordinates: comp.latitude && comp.longitude ? { lat: comp.latitude, lng: comp.longitude } : { lat: 18.5204, lng: 73.8567 },
          });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend unavailable; loading local stored task:', err.message);
      }

      // Offline fallback
      const list = getStoredComplaints();
      const found = list.find((c) => c.id === id || c.complaintId === id);
      setTask(found || null);
      setIsLoading(false);
    };

    fetchTask();
  }, [id]);

  // Action: Mark as IN_PROGRESS
  const handleStartWork = async () => {
    setIsUpdating(true);
    try {
      const res = await workerComplaintAPI.startWork(task.id || task._id, {
        remarks: 'Field crew arrived on site. Commenced repair & remediation work.',
      });
      if (res.data?.success) {
        const updated = res.data.data;
        setTask((prev) => ({
          ...prev,
          status: updated.status,
        }));
        toast.success(`Task #${task.id} marked as IN PROGRESS!`);
        setIsUpdating(false);
        return;
      }
    } catch (err) {
      console.warn('API startWork failed; updating local mock store:', err.message);
      const updated = updateComplaintStatusInStore(
        task.id,
        'IN_PROGRESS',
        'Field crew arrived on site. Commenced repair & remediation work.',
        user ? `${user.name} (Field Worker)` : 'Field Worker'
      );
      if (updated) {
        setTask(updated);
        toast.success(`Task #${task.id} marked as IN PROGRESS (Offline Demo)!`);
      }
    }
    setIsUpdating(false);
  };

  // Image Upload Handler for Completion Proof
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Evidence photo must be under 5MB');
        return;
      }
      setCompletionImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Action: Mark as RESOLVED
  const handleCompleteWork = async (e) => {
    e.preventDefault();
    if (!completionNotes.trim()) {
      toast.error('Please describe the work completed in the notes field');
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('resolutionRemarks', completionNotes.trim());
      if (completionImageFile) {
        formData.append('resolutionImages', completionImageFile);
      } else if (completionImagePreview) {
        formData.append('resolutionImageUrl', completionImagePreview);
      } else {
        formData.append(
          'resolutionImageUrl',
          'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'
        );
      }

      const res = await workerComplaintAPI.resolve(task.id || task._id, formData);
      if (res.data?.success) {
        const updated = res.data.data;
        setTask((prev) => ({
          ...prev,
          status: updated.status,
          resolutionRemarks: updated.resolutionRemarks,
          resolutionImages: updated.resolutionImages,
        }));
        toast.success(`Task #${task.id} marked as RESOLVED with proof photo!`);
        setIsUpdating(false);
        return;
      }
    } catch (err) {
      console.warn('API resolve failed; updating local mock store:', err.message);
      const proofUrl =
        completionImagePreview ||
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80';

      const updated = updateComplaintStatusInStore(
        task.id,
        'RESOLVED',
        `Work completed on site: ${completionNotes}`,
        user ? `${user.name} (Field Worker)` : 'Field Worker',
        { completionImageUrl: proofUrl }
      );

      if (updated) {
        setTask(updated);
        toast.success(`Task #${task.id} marked as RESOLVED (Offline Demo)!`);
      }
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <p className="text-xs font-medium">Loading field task dossier...</p>
      </div>
    );
  }

  const priorityConfig = PRIORITY_LEVELS[task.priority] || PRIORITY_LEVELS.MEDIUM;
  const isResolved = task.status === 'RESOLVED' || task.status === 'CITIZEN_FEEDBACK';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Task Registry</span>
        </button>

        <div className="flex items-center space-x-2">
          <StatusBadge status={task.status} size="lg" />
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${priorityConfig.color}`}>
            {task.priority} Priority
          </span>
        </div>
      </div>

      {/* Main Task Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="font-mono text-xs font-bold text-slate-400">
            Work Order #{task.id}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 leading-snug">
            {task.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Category: <strong>{task.categoryLabel || task.category}</strong> • Ward: <strong>{task.ward}</strong>
          </p>
        </div>

        {/* Location & Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Task Site Location</p>
              <p className="text-slate-600 mt-0.5">{task.location}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Assigned Timeline</p>
              <p className="text-slate-600 mt-0.5">
                Reported: {formatDate(task.createdAt)} • Updated: {formatDate(task.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Issue Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {task.description}
          </p>
        </div>

        {/* Map Location & GPS Navigation */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              On-Site Navigation Coordinates
            </h3>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${task.coordinates?.lat || 18.5204},${task.coordinates?.lng || 73.8567}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition-colors w-fit"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
              <span>Open Turn-by-Turn GPS Directions</span>
            </a>
          </div>
          <MapPicker
            initialLat={task.coordinates?.lat || 18.5204}
            initialLng={task.coordinates?.lng || 73.8567}
            readOnly={true}
            height="220px"
          />
        </div>

        {/* Evidence Photos */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Photographic Evidence Comparison
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Initial Problem Photo (Before)</span>
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-56 bg-slate-100">
                {task.imageUrl ? (
                  <img
                    src={task.imageUrl}
                    alt="Before Repair"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                    No before photo
                  </div>
                )}
              </div>
            </div>

            {/* After Photo */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Resolution Completion Photo (After)</span>
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-56 bg-slate-100">
                {task.completionImageUrl ? (
                  <img
                    src={task.completionImageUrl}
                    alt="After Resolution"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-400 p-4 text-center">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span>Upload completion photo below when work is finished</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Worker Status Update Controls */}
        <div className="pt-6 border-t border-slate-100 space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <span>Update Task Status & Upload Proof</span>
          </h3>

          {task.status === 'ASSIGNED' && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
              <p className="text-xs font-bold text-amber-900">
                Ready to commence work on site?
              </p>
              <p className="text-xs text-amber-800">
                Marking this task as "In Progress" notifies municipal dispatch and the citizen that repairs have started.
              </p>
              <Button
                variant="primary"
                size="md"
                isLoading={isUpdating}
                onClick={handleStartWork}
                icon={Wrench}
              >
                Mark Task as "In Progress"
              </Button>
            </div>
          )}

          {task.status === 'IN_PROGRESS' && (
            <form onSubmit={handleCompleteWork} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold text-slate-900">
                Complete Work Order & Upload Photographic Proof
              </p>

              {/* Upload Completion Proof */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Resolution Photo Evidence
                </label>
                {completionImagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-900 max-w-sm">
                    <img
                      src={completionImagePreview}
                      alt="Proof Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCompletionImagePreview(null)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl cursor-pointer bg-white transition-colors max-w-sm">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Upload completion photo</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Remediation Summary & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Pothole filled with cold mix bitumen, rolled flat. Debris cleared from roadway."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <Button
                type="submit"
                variant="success"
                size="md"
                isLoading={isUpdating}
                icon={CheckCircle2}
              >
                Mark Task as "RESOLVED"
              </Button>
            </form>
          )}

          {isResolved && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-xs text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Work Successfully Completed & Closed</p>
                <p className="text-[11px] text-emerald-800">
                  This work order is closed. Resolution proof has been submitted to municipal archives and the citizen has been prompted for feedback.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      <ComplaintTimeline timeline={task.timeline} currentStatus={task.status} />
    </div>
  );
}

