import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  const norm = String(status || '').toLowerCase();

  const statusStyles = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    assigned: 'bg-blue-50 text-blue-800 border-blue-200',
    in_transit: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    failed: 'bg-rose-50 text-rose-800 border-rose-200',
    delayed: 'bg-rose-50 text-rose-800 border-rose-200',
    waiting: 'bg-slate-100 text-slate-700 border-slate-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
    idle: 'bg-slate-100 text-slate-700 border-slate-200',
    refueling: 'bg-amber-50 text-amber-800 border-amber-200',
    planned: 'bg-sky-50 text-sky-800 border-sky-200',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  };

  const priorityStyles = {
    1: 'bg-slate-100 text-slate-700 border-slate-200',
    2: 'bg-blue-50 text-blue-800 border-blue-200 font-semibold',
    3: 'bg-rose-50 text-rose-800 border-rose-200 font-bold'
  };

  const truckTypeStyles = {
    mini: 'bg-sky-50 text-sky-800 border-sky-200',
    medium: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    large: 'bg-purple-50 text-purple-800 border-purple-200 font-semibold'
  };

  let badgeClass = statusStyles[norm] || 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  if (type === 'priority') {
    badgeClass = priorityStyles[status] || priorityStyles[1];
    label = status === 3 ? 'Urgent / Tier 3' : status === 2 ? 'Medium / Tier 2' : 'Standard / Tier 1';
  } else if (type === 'truckType') {
    badgeClass = truckTypeStyles[norm] || truckTypeStyles.mini;
    label = norm === 'large' ? 'Heavy Container' : norm === 'medium' ? 'Medium Box Truck' : 'Express Van';
  } else if (norm === 'in_transit') {
    label = 'In Transit';
  } else if (norm === 'idle') {
    label = 'Idle / Standby';
  }

  const isPulsing = norm === 'in_transit';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border capitalize tracking-wide shadow-xs ${badgeClass}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full bg-current ${
          isPulsing ? 'animate-pulse' : 'opacity-80'
        }`}
      />
      {label}
    </span>
  );
}
