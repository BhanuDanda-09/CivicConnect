import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import { createMockComplaint } from '../../utils/mockData';
import { useAuth } from '../../hooks/useAuth';
import { complaintAPI } from '../../services/api';
import { FilePlus, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmitComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // 1. Build FormData payload supporting multipart image uploads and structured Indian address
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('categoryLabel', data.categoryLabel || data.category);
      formData.append('location', data.location);
      formData.append('ward', data.ward);
      formData.append('priority', data.priority || 'MEDIUM');

      if (data.state) formData.append('state', data.state);
      if (data.district) formData.append('district', data.district);
      if (data.city) formData.append('city', data.city);
      if (data.pincode) formData.append('pincode', data.pincode);
      if (data.landmark) formData.append('landmark', data.landmark);

      if (data.coordinates) {
        formData.append('latitude', data.coordinates.lat);
        formData.append('longitude', data.coordinates.lng);
      }

      if (data.imageFile) {
        formData.append('images', data.imageFile);
      } else if (data.imageUrl) {
        formData.append('imageUrl', data.imageUrl);
      }

      // 2. Call backend REST API
      const res = await complaintAPI.create(formData);

      if (res.data?.success) {
        const createdComplaint = res.data.data;
        const targetId = createdComplaint.complaintId || createdComplaint._id || createdComplaint.id;
        toast.success(`Complaint #${targetId} submitted successfully to municipal desk!`);
        navigate(`/citizen/complaints/${targetId}`);
        return;
      }
    } catch (err) {
      console.warn('Backend complaint submission failed or offline; using local mock storage:', err.message);

      // Graceful offline fallback
      try {
        const fallbackCreated = createMockComplaint(data, user);
        toast.success(`Complaint #${fallbackCreated.id} recorded in offline demo mode!`);
        navigate(`/citizen/complaints/${fallbackCreated.id}`);
        return;
      } catch (mockErr) {
        const errMsg = err.response?.data?.message || 'Failed to submit complaint. Please check form values.';
        toast.error(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 transition-colors">
      {/* Page Title */}
      <div className="space-y-1">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <FilePlus className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          <span>File a Civic Grievance</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Provide accurate details, pin the problem location on OpenStreetMap, and upload photographic evidence.
        </p>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800 flex items-start space-x-3 text-xs text-sky-900 dark:text-sky-200">
        <ShieldAlert className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">Municipal Verification Process</p>
          <p className="text-sky-800 dark:text-sky-300 text-[11px] mt-0.5">
            Every submitted complaint undergoes verification by municipal desk officers. Adding clear photographs and precise map locations ensures faster worker dispatch.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xs transition-colors">
        <ComplaintForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
