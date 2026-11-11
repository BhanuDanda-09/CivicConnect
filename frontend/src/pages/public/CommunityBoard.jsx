// ==============================================================================
// Public Community Awareness Board (CommunityBoard.jsx)
// Privacy-sanitized stream of civic issues with community upvoting and local updates
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Users, ThumbsUp, MapPin, Search, Filter, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { communityAPI } from '../../services/api';
import { INDIAN_STATES_AND_UT } from '../../utils/indianGeoData';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';

export default function CommunityBoard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { user } = useAuth();
  const { t } = useLanguage();

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await communityAPI.getFeed({
        state: selectedState || undefined,
        category: selectedCategory || undefined,
        limit: 30,
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setComplaints(res.data.data);
      }
    } catch {
      toast.error('Unable to refresh community feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [selectedState, selectedCategory]);

  const handleUpvote = async (complaintId) => {
    if (!user) {
      toast.info('Please log in as a citizen to upvote community grievances.');
      return;
    }

    // Optimistic UI update
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.complaintId === complaintId) {
          const wasUpvoted = c.isUpvoted;
          return {
            ...c,
            isUpvoted: !wasUpvoted,
            upvoteCount: wasUpvoted ? Math.max(0, c.upvoteCount - 1) : c.upvoteCount + 1,
          };
        }
        return c;
      })
    );

    try {
      const res = await communityAPI.toggleUpvote(complaintId);
      if (res.data?.success) {
        toast.success(res.data.message);
      }
    } catch {
      toast.error('Failed to update upvote.');
      loadFeed(); // Rollback
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.title?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term) ||
      c.complaintId?.toLowerCase().includes(term) ||
      c.city?.toLowerCase().includes(term) ||
      c.ward?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-semibold tracking-wider uppercase">
                <Users className="w-3.5 h-3.5" />
                <span>Pan-India Public Awareness Stream</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Community Civic Grievance Board
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
                Discover reported municipal issues in your district, endorse community priorities, and monitor public resolution progress. Citizen contact privacy is strictly preserved.
              </p>
            </div>
            <Link
              to="/citizen/submit-complaint"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs shadow-md transition-colors shrink-0"
            >
              Report a Civic Issue
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by area, ward, description, or Tracking ID..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer flex-1 md:flex-initial"
            >
              <option value="">All States & UTs</option>
              {INDIAN_STATES_AND_UT.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer flex-1 md:flex-initial"
            >
              <option value="">All Categories</option>
              <option value="pothole">Road & Potholes</option>
              <option value="garbage">Garbage Collection</option>
              <option value="water_leakage">Water Leakage</option>
              <option value="drainage">Drainage Issues</option>
              <option value="street_light">Streetlights</option>
              <option value="sanitation">Public Sanitation</option>
              <option value="other">Other Civic Infrastructure</option>
            </select>
          </div>
        </div>

        {/* Complaints Stream Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Loading community civic issues...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">No Active Issues Matching Filter</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No public grievances found matching your search. Be the first to report an issue in your locality!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComplaints.map((item) => (
              <div
                key={item.complaintId}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">
                      {item.complaintId}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {item.ward} • {item.city || item.district || 'India'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {/* Upvote Button */}
                  <button
                    type="button"
                    onClick={() => handleUpvote(item.complaintId)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer ${
                      item.isUpvoted
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${item.isUpvoted ? 'fill-sky-600 text-sky-600' : ''}`} />
                    <span>{item.upvoteCount} {t('upvoteCountLabel', 'citizens affected')}</span>
                  </button>

                  <Link
                    to={`/track?id=${item.complaintId}`}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 underline underline-offset-2"
                  >
                    Track Progress →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
