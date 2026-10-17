import React from 'react';
import { FilterX } from 'lucide-react';

export default function EmptyState({
  title = 'No records match your criteria',
  description = 'Try adjusting your filters, clearing active search tags, or broadening your follower/engagement ranges.',
  onReset
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto shadow-xs my-6">
      <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <FilterX className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-5">{description}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}
