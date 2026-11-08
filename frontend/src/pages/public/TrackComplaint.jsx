import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import { getStoredComplaints } from '../../utils/mockData';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import {
  Search,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  HardHat,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [trackingId, setTrackingId] = useState(initialId);
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeSearch = async (queryId) => {
    const idToSearch = (queryId || trackingId).trim();
    if (!idToSearch) {
      toast.error('Please enter a Complaint Tracking ID');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setHasSearched(true);
    setSearchParams({ id: idToSearch });

    try {
      const res = await complaintAPI.trackPublic(idToSearch);
      if (res.data?.success && res.data.data) {
        setComplaint(res.data.data);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Public API tracking returned notice; checking offline cache:', err.message);
    }

    // Offline demo fallback: search local stored complaints
    const localComplaints = getStoredComplaints();
    const found = localComplaints.find(
      (c) =>
        (c.complaintId && c.complaintId.toLowerCase() === idToSearch.toLowerCase()) ||
        (c.id && c.id.toLowerCase() === idToSearch.toLowerCase()) ||
        (c._id && c._id.toString().toLowerCase() === idToSearch.toLowerCase())
    );

    if (found) {
      setComplaint({
        ...found,
        id: found.complaintId || found.id,
        categoryLabel: found.categoryLabel || found.category,
        imageUrl: found.imageUrl || (found.images && found.images[0]) || '',
      });
      toast.success('Found grievance in municipal cache!');
    } else {
      setComplaint(null);
      setErrorMessage(`No civic grievance found matching Tracking ID: "${idToSearch}". Please check the ID and try again.`);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (initialId) {
      executeSearch(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const sampleIds = ['CC-2026-0001', 'CC-2026-0002', 'CC-2026-0003'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 px-4">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>Real-Time Citizen Grievance Tracker</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Track Your Municipal Complaint
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Enter your unique Complaint Tracking ID below to view real-time department verification, worker dispatch, and resolution evidence.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-lg shadow-slate-900/5">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. CC-2026-0001 or MongoDB Grievance ID"
              className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/25 transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? <LoadingSpinner size="sm" color="text-white" /> : <Search className="w-4 h-4" />}
            <span>Track Progress</span>
          </button>
        </form>

        {/* Sample IDs Pill Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Sample Tracking IDs to test:</span>
          {sampleIds.map((sId) => (
            <button
              key={sId}
              type="button"
              onClick={() => {
                setTrackingId(sId);
                executeSearch(sId);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {sId}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Display */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" message="Retrieving real-time dispatch records from municipality..." />
        </div>
      ) : complaint ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-8 animate-fadeIn">
          {/* Top Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                  {complaint.complaintId || complaint.id}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  {complaint.ward || 'Central Municipal Ward'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                {complaint.title}
              </h2>
              <p className="text-xs text-slate-500">
                Category: <strong className="text-slate-700">{complaint.categoryLabel || complaint.category}</strong> • Priority:{' '}
                <strong className="text-slate-700">{complaint.priority}</strong>
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
              <StatusBadge status={complaint.status} size="lg" />
              <span className="text-[11px] text-slate-400">
                Filed on {formatDate(complaint.createdAt)}
              </span>
            </div>
          </div>

          {/* Description & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Reported Incident Site</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {complaint.location || 'Municipal street location'}
              </p>
              {complaint.latitude && complaint.longitude && (
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  GPS: {Number(complaint.latitude).toFixed(4)}, {Number(complaint.longitude).toFixed(4)}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Last Updated Status</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {formatDateTime(complaint.updatedAt || complaint.createdAt)}
              </p>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified in Municipal Audit Registry</span>
              </div>
            </div>
          </div>

          {/* Photo Evidence (Before & After) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Photographic Evidence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">Initial Problem Photo (Before)</span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-100">
                  {complaint.imageUrl || (complaint.images && complaint.images[0]) ? (
                    <img
                      src={complaint.imageUrl || complaint.images[0]}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      No photograph attached
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">Municipal Remediation Photo (After)</span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-100">
                  {complaint.resolutionPhotos && complaint.resolutionPhotos.length > 0 ? (
                    <img
                      src={complaint.resolutionPhotos[0]}
                      alt="After Resolution"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 space-y-1">
                      <HardHat className="w-6 h-6 text-slate-300" />
                      <span className="text-xs font-medium">Pending On-Site Work Completion</span>
                      <span className="text-[10px] text-slate-400">Will be uploaded upon task resolution</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lifecycle Audit Timeline */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Official Grievance Audit Trail
            </h3>
            <ComplaintTimeline
              currentStatus={complaint.status}
              history={complaint.timeline || complaint.history || []}
            />
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/citizen/submit-complaint"
              className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-700"
            >
              <span>Have another issue to report? File New Grievance</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>

            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Sign In to Full Dashboard
            </Link>
          </div>
        </div>
      ) : hasSearched && errorMessage ? (
        <ErrorState
          title="Grievance Not Found"
          message={errorMessage}
          onRetry={() => executeSearch()}
          retryLabel="Search Again"
        />
      ) : (
        /* Helpful empty state instructions */
        <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Every Complaint Has a Unique Tracking ID
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            When you submit a complaint via CivicConnect, an SMS and email notification with your tracking ID (e.g. <code>CC-2026-0001</code>) is issued. You can track it here anytime without logging in.
          </p>
        </div>
      )}
    </div>
  );
}

