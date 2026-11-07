import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoredComplaints, addFeedbackInStore } from '../../utils/mockData';
import Button from '../../components/common/Button';
import { Star, MessageSquare, CheckCircle2, ArrowRight, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Feedback() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const list = getStoredComplaints();
    const eligible = list.filter((c) => c.status === 'RESOLVED' || c.status === 'CITIZEN_FEEDBACK');
    setComplaints(eligible);
    if (eligible.length > 0) {
      setSelectedComplaintId(eligible[0].id);
    }
  }, []);

  const handleSubmit = (e) => {
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
    setTimeout(() => {
      addFeedbackInStore(selectedComplaintId, rating, comment);
      setIsSubmitting(false);
      toast.success('Your civic feedback has been recorded! Thank you.');
      setComment('');
      // refresh
      const refreshed = getStoredComplaints().filter(
        (c) => c.status === 'RESOLVED' || c.status === 'CITIZEN_FEEDBACK'
      );
      setComplaints(refreshed);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-sky-600" />
          <span>Citizen Resolution Feedback</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review resolved infrastructure grievances to evaluate municipal performance and ensure ground-level quality.
        </p>
      </div>

      {complaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Resolved Issues Awaiting Feedback</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Feedback can only be submitted after a municipal worker completes the work and marks the grievance as Resolved.
          </p>
          <Link
            to="/citizen/complaints"
            className="inline-flex items-center text-xs font-bold text-sky-600 hover:underline pt-2"
          >
            <span>View My Active Complaints</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Complaint */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Resolved Complaint
              </label>
              <select
                value={selectedComplaintId}
                onChange={(e) => setSelectedComplaintId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                {complaints.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.id}] {c.title} — {c.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Stars */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Rate Service Quality & Promptness
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-slate-800 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Feedback Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Feedback & Comments
              </label>
              <textarea
                rows={4}
                placeholder="How satisfied are you with the quality of repair? Was the problem resolved properly? Any remaining issues?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <Button
              type="submit"
              variant="teal"
              size="md"
              isLoading={isSubmitting}
              className="w-full"
            >
              Submit Citizen Feedback
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

