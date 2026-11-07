import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStoredComplaints, addFeedbackInStore } from '../../utils/mockData';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import MapPicker from '../../components/common/MapPicker';
import Button from '../../components/common/Button';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { PRIORITY_LEVELS, COMPLAINT_CATEGORIES } from '../../utils/constants';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  HardHat,
  Star,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    const list = getStoredComplaints();
    const found = list.find((c) => c.id === id);
    setComplaint(found || null);
  }, [id]);

  if (!complaint) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested complaint identifier (#{id}) could not be located in local store.
        </p>
        <Link
          to="/citizen/complaints"
          className="inline-flex items-center text-xs font-bold text-sky-600 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to All Complaints</span>
        </Link>
      </div>
    );
  }

  const priorityConfig = PRIORITY_LEVELS[complaint.priority] || PRIORITY_LEVELS.MEDIUM;
  const isResolved = complaint.status === 'RESOLVED' || complaint.status === 'CITIZEN_FEEDBACK';

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) {
      toast.error('Please enter a brief feedback comment');
      return;
    }

    setIsSubmittingFeedback(true);
    setTimeout(() => {
      const updated = addFeedbackInStore(complaint.id, feedbackRating, feedbackComment);
      if (updated) {
        setComplaint(updated);
        toast.success('Thank you! Your feedback has been recorded.');
      }
      setIsSubmittingFeedback(false);
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Grievance List</span>
        </button>

        <div className="flex items-center space-x-2">
          <StatusBadge status={complaint.status} size="lg" />
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${priorityConfig.color}`}>
            {complaint.priority} Priority
          </span>
        </div>
      </div>

      {/* Main Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-500">
              <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-800">
                Grievance #{complaint.id}
              </span>
              <span>•</span>
              <span>Filed {formatDate(complaint.createdAt)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              {complaint.title}
            </h1>
          </div>

          <div className="text-left md:text-right shrink-0">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
              Category
            </span>
            <span className="text-sm font-bold text-slate-800">
              {complaint.categoryLabel || complaint.category}
            </span>
          </div>
        </div>

        {/* Location & Metadata Pill Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
              <p className="font-semibold text-slate-800">{complaint.location}</p>
              <p className="text-[11px] text-slate-500">{complaint.ward}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Submission Timestamp</p>
              <p className="font-semibold text-slate-800">{formatDateTime(complaint.createdAt)}</p>
              <p className="text-[11px] text-slate-500">Updated: {formatDate(complaint.updatedAt)}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <HardHat className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Field Crew</p>
              {complaint.assignedWorker ? (
                <>
                  <p className="font-semibold text-slate-800">{complaint.assignedWorker.name}</p>
                  <p className="text-[11px] text-slate-500">{complaint.assignedWorker.trade}</p>
                </>
              ) : (
                <p className="font-medium text-slate-400 italic">Pending municipal assignment</p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Report Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
            {complaint.description}
          </p>
        </div>

        {/* Photographic Evidence Grid: Before vs After */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Photographic Evidence
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Initial Citizen Photo */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Citizen Report Photo (Before)</span>
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-56 bg-slate-100">
                {complaint.imageUrl ? (
                  <img
                    src={complaint.imageUrl}
                    alt="Problem Evidence"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span>No image attached</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Completion Photo */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Worker Proof Photo (After Resolution)</span>
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-56 bg-slate-100">
                {complaint.completionImageUrl ? (
                  <img
                    src={complaint.completionImageUrl}
                    alt="Resolution Evidence"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span>Awaiting field worker completion photograph</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Map Location */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Interactive OpenStreetMap Location
          </h3>
          <MapPicker
            initialLat={complaint.coordinates?.lat || 18.5204}
            initialLng={complaint.coordinates?.lng || 73.8567}
            readOnly={true}
            height="220px"
          />
        </div>
      </div>

      {/* Resolution Stepper Timeline */}
      <ComplaintTimeline timeline={complaint.timeline} currentStatus={complaint.status} />

      {/* Citizen Feedback Section */}
      {isResolved && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-sky-600 font-bold text-sm">
            <MessageSquare className="w-5 h-5" />
            <span>Citizen Quality Feedback</span>
          </div>

          {complaint.feedback ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
              <div className="flex items-center space-x-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < complaint.feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-emerald-800 ml-2">
                  Rating: {complaint.feedback.rating} / 5 Stars
                </span>
              </div>
              <p className="text-xs text-slate-700 italic">"{complaint.feedback.comment}"</p>
              <p className="text-[10px] text-slate-400">
                Submitted on {formatDateTime(complaint.feedback.submittedAt)}
              </p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                This grievance has been resolved! Please rate the promptness and quality of the municipal repair.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Satisfaction Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= feedbackRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {feedbackRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Comments or Suggestions
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Road was patched cleanly, debris removed promptly..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <Button
                type="submit"
                variant="success"
                size="md"
                isLoading={isSubmittingFeedback}
              >
                Submit Citizen Feedback
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
