// ==============================================================================
// Citizen Feedback & Resolution Review Page (Feedback.jsx)
// Phase 7 - Real-Time MongoDB Feedback Loop, 5-Star Ratings & Satisfaction Audit
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI, feedbackAPI } from '../../services/api';
import { getStoredComplaints, addFeedbackInStore } from '../../utils/mockData';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, MessageSquare, CheckCircle2, ArrowRight, Inbox, Sparkles, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Feedback() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEligibleComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await complaintAPI.getMyComplaints();
      if (res.data?.success && Array.isArray(res.data.data)) {
        const eligible = res.data.data.filter(
          (c) => c.status === 'RESOLVED' || c.status === 'CITIZEN_FEEDBACK'
        );
        setComplaints(eligible);
        if (eligible.length > 0) {
          setSelectedComplaintId(eligible[0].complaintId || eligible[0]._id);
        }
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend notice: loading local stored complaints for feedback:', err.message);
    }

    const list = getStoredComplaints();
    const eligible = list.filter((c) => c.status === 'RESOLVED' || c.status === 'CITIZEN_FEEDBACK');
    setComplaints(eligible);
    if (eligible.length > 0) {
      setSelectedComplaintId(eligible[0].id || eligible[0].complaintId);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadEligibleComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaintId) {
      toast.error('Please select an issue to review');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please share your thoughts on the resolution');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await feedbackAPI.submit(selectedComplaintId, {
        rating,
        comment: comment.trim(),
      });

      if (res.data?.success) {
        toast.success('Your civic feedback has been saved to the municipal registry! Thank you.');
        setComment('');
        await loadEligibleComplaints();
        return;
      }
    } catch (err) {
      // Local fallback in demo mode
      addFeedbackInStore(selectedComplaintId, rating, comment);
      toast.success('Your civic feedback has been recorded! Thank you.');
      setComment('');
      const refreshed = getStoredComplaints().filter(
        (c) => c.status === 'RESOLVED' || c.status === 'CITIZEN_FEEDBACK'
      );
      setComplaints(refreshed);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading resolved grievances for quality review..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-sky-600" />
          <span>Citizen Resolution Feedback</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review resolved infrastructure grievances to evaluate municipal performance and ensure ground-level repair quality.
        </p>
      </div>

      {complaints.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Resolved Issues Awaiting Feedback"
          description="When your reported civic problems (potholes, garbage, streetlights) are resolved by municipal crews, they will appear here for your satisfaction rating."
          actionText="View My Active Reports"
          actionLink="/citizen/my-complaints"
        />
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Select Complaint */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Resolved Grievance to Rate *
            </label>
            <select
              value={selectedComplaintId}
              onChange={(e) => setSelectedComplaintId(e.target.value)}
              className="w-full px-4 py-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              {complaints.map((c) => (
                <option key={c._id || c.id || c.complaintId} value={c.complaintId || c._id || c.id}>
                  {c.complaintId || c.id} • {c.title} ({c.ward})
                </option>
              ))}
            </select>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Overall Resolution Satisfaction Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-xs font-bold text-slate-700">
                {rating === 5 && '🌟 Outstanding Work'}
                {rating === 4 && '👍 Satisfactory Resolution'}
                {rating === 3 && '😐 Average Quality'}
                {rating === 2 && '👎 Substandard Remediation'}
                {rating === 1 && '⚠️ Unacceptable / Incomplete'}
              </span>
            </div>
          </div>

          {/* Feedback Comments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Ground-Level Experience & Observations *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe whether the pothole was smoothly asphalted, debris was completely cleared, or if any remnants remain on the road..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            ></textarea>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Your feedback is audited by the Municipal Commissioner's office.
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Recording Feedback...' : 'Submit Official Review'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
