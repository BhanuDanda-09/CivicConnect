// ==============================================================================
// Civic Knowledge Center & Help Desk (HelpCenter.jsx)
// Searchable FAQ, complaint lifecycle guide, municipal contacts, and 112 advisory
// ==============================================================================

import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, AlertTriangle, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'How do I submit a civic grievance on CivicConnect?',
    a: 'Sign in to your citizen account, click "Report Grievance", describe the issue, select a category, and pin the exact spot on our pan-India interactive map. You can optionally upload up to 5 photographs.',
    category: 'filing',
  },
  {
    q: 'Can I track a complaint without logging in?',
    a: 'Yes! Simply visit the "Track Status" page, enter your 11-character Tracking ID (e.g. CC-2026-0001), and review current status, assigned crew, and progress milestones.',
    category: 'tracking',
  },
  {
    q: 'What do the different complaint statuses mean?',
    a: '1. SUBMITTED: Received by desk. 2. UNDER_VERIFICATION: Admin verifying legitimacy. 3. VERIFIED: Approved for municipal work. 4. ASSIGNED: Dispatched to field crew. 5. IN_PROGRESS: Ground repair underway. 6. RESOLVED: Repaired with proof photo. 7. CITIZEN_FEEDBACK: Citizen rates satisfaction.',
    category: 'lifecycle',
  },
  {
    q: 'What are the SLA resolution targets?',
    a: 'Critical safety hazards (live wires, open trenches) are targeted within 24 hours. High priority issues (potable water bursts, main road craters) within 48 hours. Medium issues (streetlights, drainage) within 5 days. Low priority issues within 10 days.',
    category: 'sla',
  },
  {
    q: 'What should I do in a life-threatening emergency?',
    a: 'CivicConnect is an asynchronous municipal governance portal and DOES NOT replace emergency services. For fires, medical crises, building collapses, or crime, dial 112 (National Emergency Helpline) immediately.',
    category: 'emergency',
  },
  {
    q: 'Can I report public infrastructure using a QR code on an asset?',
    a: 'Yes! Public streetlights, waste bins, and water pumps with CivicConnect QR tags can be scanned with any smartphone camera to open a pre-filled reporting page instantly.',
    category: 'filing',
  },
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedCat, setSelectedCat] = useState('all');

  const filtered = FAQS.filter((faq) => {
    const matchesCat = selectedCat === 'all' || faq.category === selectedCat;
    const matchesSearch =
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Civic Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How can we assist your community today?
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto">
            Search verified municipal guidelines, resolution timelines, and tracking documentation.
          </p>

          {/* Search Box */}
          <div className="relative max-w-lg mx-auto pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search help topics (e.g. pothole SLA, track grievance, 112 emergency)..."
              className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-lg"
            />
          </div>
        </div>

        {/* Emergency Alert Box */}
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Life-Safety Emergency Notice</h4>
            <p className="leading-relaxed">
              CivicConnect is dedicated to municipal civil grievances. If you are experiencing a life-threatening crisis, fire, electrocution risk, or accident, dial <strong>112 (National Unified Emergency Number)</strong> immediately for instant dispatch.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          {[
            { id: 'all', label: 'All FAQs' },
            { id: 'filing', label: 'Filing Complaints' },
            { id: 'tracking', label: 'Tracking & Lookups' },
            { id: 'lifecycle', label: 'Resolution Stages' },
            { id: 'sla', label: 'SLAs & Timelines' },
            { id: 'emergency', label: 'Emergency Guidance' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCat === cat.id
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filtered.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-sky-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Channels Footer */}
        <div className="bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">Still have questions?</h4>
            <p className="text-slate-500 mt-0.5">Our national civic support team is here to assist your local body.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:support@civicconnect.gov.in"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-sky-600" />
              <span>Email Support</span>
            </a>
            <Link
              to="/citizen/submit-complaint"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors shadow-xs"
            >
              <span>Submit Grievance</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

