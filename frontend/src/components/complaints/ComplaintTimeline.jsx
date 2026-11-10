import React from 'react';
import { formatDateTime } from '../../utils/formatDate';
import { COMPLAINT_STATUS } from '../../utils/constants';
import {
  Clock,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Wrench,
  CheckCircle2,
  MessageSquare,
  XCircle,
  Check
} from 'lucide-react';

const WORKFLOW_STEPS = [
  'SUBMITTED',
  'UNDER_VERIFICATION',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CITIZEN_FEEDBACK'
];

export default function ComplaintTimeline({ timeline, history, currentStatus = 'SUBMITTED' }) {
  const events = (Array.isArray(timeline) && timeline.length > 0 ? timeline : Array.isArray(history) ? history : []) || [];
  const isRejected = currentStatus === 'REJECTED';
  const currentStepIndex = WORKFLOW_STEPS.indexOf(currentStatus);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between">
        <span>Resolution Workflow Tracker</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Status: {COMPLAINT_STATUS[currentStatus]?.label || currentStatus}
        </span>
      </h3>

      {/* Horizontal Progress Bar for Standard Desktop Steps */}
      {!isRejected ? (
        <div className="hidden md:block mb-8">
          <div className="grid grid-cols-7 gap-2">
            {WORKFLOW_STEPS.map((stepKey, idx) => {
              const stepConfig = COMPLAINT_STATUS[stepKey];
              const isCompleted = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={stepKey} className="text-center">
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isCurrent
                          ? 'bg-sky-600 text-white ring-4 ring-sky-100 dark:ring-sky-950/70 animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                  </div>
                  <p
                    className={`mt-2 text-[11px] font-semibold tracking-tight ${
                      isCurrent
                        ? 'text-sky-700 dark:text-sky-400 font-bold'
                        : isCompleted
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {stepConfig?.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 mb-6 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center space-x-3 text-sm">
          <XCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div>
            <p className="font-bold">Complaint Rejected</p>
            <p className="text-xs text-rose-700 dark:text-rose-300">This complaint has been reviewed and flagged as invalid or out-of-jurisdiction.</p>
          </div>
        </div>
      )}

      {/* Detailed Vertical Event Log */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {events.map((event, index) => {
          const statusKey = event.status || event.newStatus;
          const config = COMPLAINT_STATUS[statusKey] || {};
          const isLatest = index === events.length - 1;

          return (
            <div key={index} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs flex items-center justify-center ${
                  isLatest ? 'bg-sky-600 ring-4 ring-sky-100 dark:ring-sky-950/70' : 'bg-slate-400 dark:bg-slate-600'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Event Content */}
              <div className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {config.label || statusKey}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{event.note || event.remarks || 'Status updated.'}</p>
                {event.actor && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                    Action by: <span className="text-slate-600 dark:text-slate-400">{event.actor}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
