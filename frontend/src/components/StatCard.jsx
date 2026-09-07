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
      icon: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      highlight: 'text-indigo-600'
    },
    blue: {
      icon: 'bg-blue-50 text-blue-600 border-blue-100',
      highlight: 'text-blue-600'
    },
    emerald: {
      icon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      highlight: 'text-emerald-600'
    },
    amber: {
      icon: 'bg-amber-50 text-amber-600 border-amber-100',
      highlight: 'text-amber-600'
    },
    purple: {
      icon: 'bg-purple-50 text-purple-600 border-purple-100',
      highlight: 'text-purple-600'
    },
    rose: {
      icon: 'bg-rose-50 text-rose-600 border-rose-100',
      highlight: 'text-rose-600'
    }
  };

  const style = accentStyles[accentColor] || accentStyles.indigo;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${style.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="truncate">{subtext}</span>
        {trend && (
          <span
            className={`font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] border ${
              trendPositive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {trendPositive ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
