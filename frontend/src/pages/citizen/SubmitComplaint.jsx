import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import { createMockComplaint } from '../../utils/mockData';
import { useAuth } from '../../hooks/useAuth';
import { FilePlus, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmitComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data) => {
    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const created = createMockComplaint(data, user);
        setIsSubmitting(false);
        toast.success(`Complaint #${created.id} submitted successfully!`);
        navigate(`/citizen/complaints/${created.id}`);
      } catch (err) {
        setIsSubmitting(false);
        toast.error('Failed to submit complaint. Please try again.');
      }
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="space-y-1">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <FilePlus className="w-7 h-7 text-sky-600" />
          <span>File a Civic Grievance</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Provide accurate details, pin the problem location on OpenStreetMap, and upload photographic evidence.
        </p>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-start space-x-3 text-xs text-sky-900">
        <ShieldAlert className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">Municipal Verification Process</p>
          <p className="text-sky-800 text-[11px] mt-0.5">
            Every submitted complaint undergoes verification by municipal desk officers. Adding clear photographs and precise map locations ensures faster worker dispatch.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs">
        <ComplaintForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}

