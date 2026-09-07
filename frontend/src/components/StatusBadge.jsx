import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  const norm = String(status || '').toLowerCase();

  const statusStyles = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    assigned: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    in_transit: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    cancelled: 'bg-slate-800 text-slate-400 border-slate-700',
    idle: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    refueling: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    planned: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  };

  const priorityStyles = {
    1: 'bg-slate-800/80 text-slate-300 border-slate-700',
    2: 'bg-sky-500/15 text-sky-300 border-sky-500/30 font-semibold',
    3: 'bg-rose-500/15 text-rose-300 border-rose-500/40 font-bold'
  };

  const truckTypeStyles = {
    mini: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    medium: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    large: 'bg-purple-500/15 text-purple-300 border-purple-500/30 font-semibold'
  };

  let badgeClass = statusStyles[norm] || 'bg-slate-800 text-slate-300 border-slate-700';
  let label = status;

  if (type === 'priority') {
    badgeClass = priorityStyles[status] || priorityStyles[1];
    label = status === 3 ? 'Urgent / Priority' : status === 2 ? 'Medium' : 'Standard';
  } else if (type === 'truckType') {
    badgeClass = truckTypeStyles[norm] || truckTypeStyles.mini;
    label = norm === 'large' ? 'Heavy Container' : norm === 'medium' ? 'Medium Box' : 'Express Van';
  } else if (norm === 'in_transit') {
    label = 'In Transit';
  } else if (norm === 'idle') {
    label = 'Idle / Standby';
  }

  const isPulsing = norm === 'in_transit';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border capitalize tracking-wide shadow-xs ${badgeClass}`}
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
