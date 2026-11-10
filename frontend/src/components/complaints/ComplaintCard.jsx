import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { MapPin, Calendar, User, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { PRIORITY_LEVELS } from '../../utils/constants';

export default function ComplaintCard({ complaint, linkPrefix = '/citizen/complaints' }) {
  const priorityConfig = PRIORITY_LEVELS[complaint.priority] || PRIORITY_LEVELS.MEDIUM;
  const complaintIdentifier = complaint.complaintId || complaint.id || complaint._id;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Card Header Image / Badge */}
        <div className="relative h-44 bg-slate-100 dark:bg-slate-950 overflow-hidden">
          {complaint.imageUrl || (complaint.images && complaint.images[0]) ? (
            <img
              src={complaint.imageUrl || complaint.images[0]}
              alt={complaint.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-xs">No Photo Uploaded</span>
            </div>
          )}
          {/* Overlay Status Badge */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={complaint.status} size="sm" />
          </div>

          {/* Priority Flag */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${priorityConfig.color}`}>
              {complaint.priority}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {complaintIdentifier}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(complaint.createdAt)}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {complaint.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <span className="truncate">{complaint.location}</span>
            </div>

            {complaint.assignedWorker && (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Worker: <strong>{complaint.assignedWorker.name || complaint.assignedWorker}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {complaint.categoryLabel || complaint.category}
        </span>
        <Link
          to={`${linkPrefix}/${complaintIdentifier}`}
          className="inline-flex items-center text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 group-hover:translate-x-0.5 transition-all"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
}
