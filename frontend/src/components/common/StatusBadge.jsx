import React from 'react';
import { COMPLAINT_STATUS } from '../../utils/constants';
import { CheckCircle2, Clock, AlertCircle, Wrench, ShieldCheck, UserCheck, MessageSquare, XCircle } from 'lucide-react';

const STATUS_ICONS = {
  SUBMITTED: Clock,
  UNDER_VERIFICATION: AlertCircle,
  VERIFIED: ShieldCheck,
  ASSIGNED: UserCheck,
  IN_PROGRESS: Wrench,
  RESOLVED: CheckCircle2,
  CITIZEN_FEEDBACK: MessageSquare,
  REJECTED: XCircle,
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = COMPLAINT_STATUS[status] || {
    label: status || 'Unknown',
    color: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const Icon = STATUS_ICONS[status] || Clock;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-wide transition-all ${config.color} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}

