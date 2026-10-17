/**
 * Utility functions for formatting influencer metrics, numbers, and currencies.
 */

export function formatCompactNumber(val) {
  if (val === null || val === undefined || isNaN(val)) {
    return 'Not available';
  }
  const num = Number(val);
  if (num === 0) return '0';
  if (Math.abs(num) >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function formatPercentage(val) {
  if (val === null || val === undefined || isNaN(val)) {
    return 'Not available';
  }
  const num = Number(val);
  return (num <= 1 && num > 0 ? num * 100 : num).toFixed(2) + '%';
}

export const formatPercent = formatPercentage;

export function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) {
    return 'Not available';
  }
  return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatRank(val) {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }
  return `#${val}`;
}

export function getEngagementColor(rate) {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return 'text-slate-500';
  }
  const val = Number(rate);
  const normalized = val <= 1 && val > 0 ? val * 100 : val;
  if (normalized >= 3.0) return 'text-emerald-600 font-bold';
  if (normalized >= 1.5) return 'text-indigo-600 font-semibold';
  return 'text-amber-600';
}

export function getCategoryBadgeColor(category) {
  const map = {
    'Sports': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Music': 'bg-violet-50 text-violet-700 border-violet-200',
    'Fashion & Beauty': 'bg-pink-50 text-pink-700 border-pink-200',
    'Film & Entertainment': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Media & Nature': 'bg-amber-50 text-amber-700 border-amber-200',
    'Apparel & Sportswear': 'bg-blue-50 text-blue-700 border-blue-200',
    'Food & Cooking': 'bg-orange-50 text-orange-700 border-orange-200',
    'Food & Lifestyle': 'bg-amber-50 text-amber-700 border-amber-200',
    'Automotive & Luxury': 'bg-slate-100 text-slate-700 border-slate-300',
    'Science & Technology': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Public Figures': 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return map[category] || 'bg-slate-100 text-slate-700 border-slate-200';
}

export const getCategoryColor = getCategoryBadgeColor;
