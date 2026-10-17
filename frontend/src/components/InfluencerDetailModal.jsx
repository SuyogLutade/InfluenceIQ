import React, { useEffect, useState } from 'react';
import { X, GitCompare, ExternalLink, Award, Users, Heart, Flame, MessageSquare, BarChart2, Check } from 'lucide-react';
import { api } from '../api/client';
import { formatCompactNumber, formatPercentage, getCategoryBadgeColor } from '../utils/formatters';
import { useFilter } from '../context/FilterContext';
import LoadingSpinner from './LoadingSpinner';

export default function InfluencerDetailModal({ influencerId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { compareList, addToCompare, removeFromCompare } = useFilter();

  useEffect(() => {
    if (!influencerId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.getInfluencerDetail(influencerId)
      .then(res => {
        if (isMounted) setData(res);
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Failed to load influencer details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [influencerId]);

  if (!influencerId) return null;

  const isCompared = data?.profile && compareList.some(c => c.id === data.profile.id);

  const toggleCompare = () => {
    if (!data?.profile) return;
    if (isCompared) {
      removeFromCompare(data.profile.id);
    } else {
      addToCompare(data.profile);
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-fadeIn my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="py-6 text-slate-300">Loading profile...</div>
          ) : error ? (
            <div className="py-6 text-rose-300">{error}</div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                  {data.profile.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/30">
                      Rank #{data.profile.rank || 'N/A'}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getCategoryBadgeColor(data.profile.category)}`}>
                      {data.profile.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {data.profile.influencer_name}
                  </h3>
                  <p className="text-sm text-indigo-300">@{data.profile.username} • {data.profile.country}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleCompare}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                  isCompared
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isCompared ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
                <span>{isCompared ? 'In Compare List' : 'Add to Compare'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {loading ? (
          <LoadingSpinner message="Fetching creator performance metrics..." />
        ) : error ? (
          <div className="p-6 text-center text-sm text-rose-600">{error}</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  Followers
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCompactNumber(data.profile.followers)}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  {data.standings.followers_percentile !== null && (
                    <span className="text-indigo-600 font-semibold">
                      Top {100 - data.standings.followers_percentile}% globally
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  60-Day Eng. Rate
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatPercentage(data.profile.engagement_rate)}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Avg: {formatPercentage(data.benchmarks.avg_engagement_rate)}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  Average Likes
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCompactNumber(data.profile.average_likes)}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Per post metric
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  Influence Score
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {data.profile.influence_score ?? 'N/A'}/100
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Algorithmic reach score
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  Total Posts
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCompactNumber(data.profile.posts)}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cumulative uploads
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  Total Likes
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCompactNumber(data.profile.total_likes)}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Account lifetime likes
                </p>
              </div>
            </div>

            {/* Benchmarking vs Dataset Averages */}
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                Benchmark Analysis Against Dataset Average
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="bg-white p-3 rounded-lg border border-indigo-100/80">
                  <span className="text-slate-500 block mb-0.5">Audience Size vs Mean</span>
                  <span className="font-semibold text-slate-900">
                    {formatCompactNumber(data.profile.followers)}
                  </span>{' '}
                  <span className="text-slate-500">
                    (Dataset avg: {formatCompactNumber(data.benchmarks.avg_followers)})
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-100/80">
                  <span className="text-slate-500 block mb-0.5">Engagement vs Mean</span>
                  <span className="font-semibold text-slate-900">
                    {formatPercentage(data.profile.engagement_rate)}
                  </span>{' '}
                  <span className="text-slate-500">
                    (Dataset avg: {formatPercentage(data.benchmarks.avg_engagement_rate)})
                  </span>
                </div>
              </div>
            </div>

            {/* Data Availability Transparency Notice */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs space-y-2">
              <h5 className="font-semibold text-slate-800">Dataset Availability Notice:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span><strong>Average Comments:</strong> Not available in dataset</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span><strong>Campaign ROI / Spend:</strong> Private metric</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200/60 pt-2">
                Metrics shown reflect the verified Kaggle Top 200 Instagram Influencers dataset. Missing columns are never fabricated as zero.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
