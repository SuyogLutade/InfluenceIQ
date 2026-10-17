import React from 'react';
import Tooltip from './Tooltip';

export default function KPICard({
  title,
  value,
  subtitle,
  tooltipText,
  whyItMatters,
  icon: Icon,
  badgeText,
  badgeType = 'neutral',
  disclaimer
}) {
  const badgeClasses = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            {(tooltipText || whyItMatters) && (
              <Tooltip text={tooltipText} whyItMatters={whyItMatters} />
            )}
          </div>
          {Icon && (
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
          {badgeText && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeClasses[badgeType] || badgeClasses.neutral}`}>
              {badgeText}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {disclaimer && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <p className="text-[11px] text-amber-700 bg-amber-50/70 px-2 py-1 rounded border border-amber-200/60 leading-tight">
            ⚠️ {disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
