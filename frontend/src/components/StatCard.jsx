import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendPositive = true,
  accentColor = 'indigo',
  onClick = null
}) {
  const accentStyles = {
    indigo: {
      icon: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      glow: 'group-hover:border-indigo-500/40',
      highlight: 'text-indigo-400'
    },
    blue: {
      icon: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      glow: 'group-hover:border-sky-500/40',
      highlight: 'text-sky-400'
    },
    emerald: {
      icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      glow: 'group-hover:border-emerald-500/40',
      highlight: 'text-emerald-400'
    },
    amber: {
      icon: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      glow: 'group-hover:border-amber-500/40',
      highlight: 'text-amber-400'
    },
    purple: {
      icon: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      glow: 'group-hover:border-purple-500/40',
      highlight: 'text-purple-400'
    },
    rose: {
      icon: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      glow: 'group-hover:border-rose-500/40',
      highlight: 'text-rose-400'
    }
  };

  const style = accentStyles[accentColor] || accentStyles.indigo;

  return (
    <div
      onClick={onClick}
      className={`bg-[#0C1322] rounded-2xl p-5 border border-slate-800/80 shadow-md transition-all duration-200 group relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${style.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border shadow-inner ${style.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate">{subtext}</span>
        {trend && (
          <span
            className={`font-bold flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${
              trendPositive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {trendPositive ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
