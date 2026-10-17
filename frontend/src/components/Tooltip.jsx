import React, { useState } from 'react';
import { Info } from 'lucide-react';

export default function Tooltip({
  text,
  whyItMatters,
  children,
  className = '',
  position = 'top',
  align = 'center'
}) {
  const [visible, setVisible] = useState(false);

  // Position classes
  const isBottom = position === 'bottom';
  const posClass = isBottom ? 'top-full mt-2' : 'bottom-full mb-2';

  // Alignment classes
  let alignClass = 'left-1/2 -translate-x-1/2';
  let arrowAlignClass = 'left-1/2 -translate-x-1/2';

  if (align === 'right') {
    alignClass = 'right-0';
    arrowAlignClass = 'right-3';
  } else if (align === 'left') {
    alignClass = 'left-0';
    arrowAlignClass = 'left-3';
  }

  // Arrow classes
  const arrowPosClass = isBottom
    ? 'bottom-full border-b-slate-900 border-t-transparent'
    : 'top-full border-t-slate-900 border-b-transparent';

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children || (
        <button
          type="button"
          aria-label="Information tooltip"
          className="text-slate-400 hover:text-indigo-600 transition-colors ml-1 p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-help"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      )}

      {visible && (
        <div
          className={`absolute z-50 ${posClass} ${alignClass} w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-2xl border border-slate-700 pointer-events-none transition-opacity duration-150 animate-fadeIn text-left font-normal`}
        >
          {text && (
            <p className="font-medium text-slate-200 leading-relaxed mb-1">{text}</p>
          )}
          {whyItMatters && (
            <p className="text-indigo-300 font-normal leading-relaxed border-t border-slate-800 pt-1">
              <span className="font-semibold text-indigo-200">Why it matters:</span> {whyItMatters}
            </p>
          )}
          <div
            className={`absolute ${arrowPosClass} ${arrowAlignClass} border-4 border-transparent`}
          />
        </div>
      )}
    </div>
  );
}
