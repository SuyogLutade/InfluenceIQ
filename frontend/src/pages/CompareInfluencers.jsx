import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFilter } from '../context/FilterContext';
import { api } from '../api/client';
import {
  formatCompactNumber,
  formatPercent,
  formatRank,
  getEngagementColor,
  getCategoryBadgeColor
} from '../utils/formatters';
import {
  GitCompare,
  Plus,
  Trash2,
  Trophy,
  TrendingUp,
  Users,
  Heart,
  Globe,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

export default function CompareInfluencers() {
  const { compareList, removeFromCompare, clearCompare, addToCompare } = useFilter();
  const [allInfluencers, setAllInfluencers] = useState([]);
  const [selectorSearch, setSelectorSearch] = useState('');
  const [backendComparison, setBackendComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch influencer candidates for inline quick-add
  useEffect(() => {
    async function loadCandidates() {
      try {
        const res = await api.getInfluencers({ page_size: 200 });
        setAllInfluencers(res.items || []);
      } catch (err) {
        console.error('Failed to load influencer list for comparison', err);
      }
    }
    loadCandidates();
  }, []);

  // When compareList changes, fetch detailed backend comparison if >= 2
  useEffect(() => {
    async function fetchComparison() {
      if (compareList.length < 2) {
        setBackendComparison(null);
        return;
      }
      try {
        setLoading(true);
        const ids = compareList.map((c) => c.id);
        const res = await api.compareInfluencers(ids);
        setBackendComparison(res);
      } catch (err) {
        console.error('Failed to fetch comparison analytics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [compareList]);

  const availableToAdd = allInfluencers.filter(
    (inf) => !compareList.some((c) => c.id === inf.id || (c.username && c.username === inf.username))
  );

  const filteredCandidates = selectorSearch.trim()
    ? availableToAdd.filter(
        (inf) =>
          (inf.username && inf.username.toLowerCase().includes(selectorSearch.toLowerCase())) ||
          (inf.influencer_name && inf.influencer_name.toLowerCase().includes(selectorSearch.toLowerCase()))
      ).slice(0, 10)
    : availableToAdd.slice(0, 10);

  // Chart preparation: normalize for comparative visual
  const chartData = compareList.map((c) => ({
    name: c.influencer_name || `@${c.username}`,
    username: `@${c.username}`,
    followersM: Number(((c.followers || 0) / 1_000_000).toFixed(1)),
    engagementRatePct: Number((c.engagement_rate ?? 0).toFixed(2)),
    avgLikesM: Number(((c.average_likes || 0) / 1_000_000).toFixed(2)),
  }));

  // Identify standout metrics
  const maxFollowers = Math.max(...compareList.map((c) => c.followers || 0));
  const maxEngagement = Math.max(...compareList.map((c) => c.engagement_rate || 0));
  const maxAvgLikes = Math.max(...compareList.map((c) => c.average_likes || 0));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <GitCompare className="w-4 h-4" />
            <span>Side-by-Side Influencer Benchmarking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Compare Creators ({compareList.length} / 5)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Compare 2 to 5 Instagram accounts simultaneously to balance audience scale, engagement health, and estimated campaign suitability.
          </p>
        </div>

        {compareList.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
            <Link
              to="/explorer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            >
              <span>Back to Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Quick Add Selector Bar */}
      {compareList.length < 5 && (
        <div className="bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add another creator to comparison:
            </span>
            <input
              type="text"
              placeholder="Search by username or name..."
              value={selectorSearch}
              onChange={(e) => setSelectorSearch(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredCandidates.map((candidate) => (
              <button
                key={candidate.id}
                onClick={() => addToCompare(candidate)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-slate-800 text-xs font-medium hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-2xs group cursor-pointer"
              >
                <span className="font-semibold text-indigo-600 group-hover:text-indigo-200">
                  #{candidate.rank}
                </span>
                <span>@{candidate.username}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-indigo-100">
                  ({formatCompactNumber(candidate.followers)})
                </span>
                <Plus className="w-3 h-3 text-indigo-500 group-hover:text-white" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* When fewer than 2 items are selected */}
      {compareList.length < 2 && (
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <GitCompare className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              Select at least 2 influencers to unlock comparative insights
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Currently {compareList.length} creator selected. Add more using the quick pills above or browse the{' '}
              <Link to="/explorer" className="text-indigo-600 font-semibold underline">
                Influencer Explorer
              </Link>{' '}
              to click the &quot;Compare&quot; button on any profile.
            </p>
          </div>
        </div>
      )}

      {/* Comparison Grid Cards */}
      {compareList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {compareList.map((creator) => {
            const isTopReach = (creator.followers || 0) === maxFollowers && compareList.length > 1;
            const isTopEng = (creator.engagement_rate || 0) === maxEngagement && compareList.length > 1;
            const isTopLikes = (creator.average_likes || 0) === maxAvgLikes && compareList.length > 1;

            return (
              <div
                key={creator.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow p-4 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Badge for Standout */}
                {isTopReach && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">
                    Max Reach
                  </div>
                )}
                {isTopEng && !isTopReach && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">
                    Top Eng Rate
                  </div>
                )}
                {isTopLikes && !isTopReach && !isTopEng && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">
                    Top Likes
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                        {(creator.username || 'IG').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {creator.influencer_name}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">@{creator.username}</p>
                        <p className="text-[10px] text-indigo-600 font-semibold">{formatRank(creator.rank)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCompare(creator.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryBadgeColor(creator.category)}`}>
                      {creator.category || 'Uncategorized'}
                    </span>
                    <span className="text-[10px] text-slate-500 self-center">
                      {creator.country || 'Unspecified'}
                    </span>
                  </div>

                  {/* Core Metrics list */}
                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">Followers</span>
                      <span className={`font-bold ${isTopReach ? 'text-indigo-600 font-extrabold' : 'text-slate-800'}`}>
                        {formatCompactNumber(creator.followers)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">60-Day Eng Rate</span>
                      <span className={`font-bold ${isTopEng ? 'text-emerald-600 font-extrabold' : getEngagementColor(creator.engagement_rate)}`}>
                        {formatPercent(creator.engagement_rate)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">Avg Likes / Post</span>
                      <span className={`font-semibold ${isTopLikes ? 'text-purple-600 font-extrabold' : 'text-slate-700'}`}>
                        {formatCompactNumber(creator.average_likes)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">Avg Comments</span>
                      <span className="text-slate-400 italic text-[11px]">
                        Not available
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">New Post Likes</span>
                      <span className="font-semibold text-slate-700">
                        {formatCompactNumber(creator.new_post_avg_like)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">Influence Score</span>
                      <span className="font-bold text-slate-900">
                        {creator.influence_score ? `${creator.influence_score}/100` : 'Not available'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[10px] text-slate-500 italic">
                    {(creator.engagement_rate || 0) > 2.0
                      ? 'High responsiveness audience'
                      : 'Mass-market broad reach'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visual Benchmarking Chart */}
      {compareList.length >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Audience Reach vs Average Likes */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Audience Scale (Millions of Followers)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Comparison of follower counts across compared creators.
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis unit="M" tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    formatter={(value) => [`${value}M`, 'Followers']}
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="followersM" fill="#6366f1" radius={[4, 4, 0, 0]} name="Followers (M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: 60-Day Engagement Rate Benchmarking */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              60-Day Engagement Rate (%)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Higher engagement rate indicates a more reactive, loyal audience.
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis unit="%" tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    formatter={(value) => [`${value}%`, 'Engagement Rate']}
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="engagementRatePct" fill="#10b981" radius={[4, 4, 0, 0]} name="Eng Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Comparison Advisory Summary */}
      {compareList.length >= 2 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Campaign Selection Advisory</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-100">
              <div className="font-bold text-indigo-900 mb-1">Max Brand Awareness Pick</div>
              <p className="text-indigo-800">
                <strong>@{compareList.reduce((max, c) => ((c.followers || 0) > (max.followers || 0) ? c : max)).username}</strong>{' '}
                commands the highest audience scale ({formatCompactNumber(maxFollowers)} followers), making them optimal for broad top-of-funnel reach and brand recognition.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <div className="font-bold text-emerald-900 mb-1">Highest Audience Engagement Pick</div>
              <p className="text-emerald-800">
                <strong>@{compareList.reduce((max, c) => ((c.engagement_rate || 0) > (max.engagement_rate || 0) ? c : max)).username}</strong>{' '}
                demonstrates the strongest engagement rate ({formatPercent(maxEngagement)}), which typically drives superior click-throughs and community advocacy.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50/60 border border-purple-100">
              <div className="font-bold text-purple-900 mb-1">Balanced Efficiency Recommendation</div>
              <p className="text-purple-800">
                Evaluating engagement against follower scale reveals influencers with active followings relative to size. Cross-verify with our{' '}
                <Link to="/campaign" className="underline font-semibold">
                  Campaign Simulator
                </Link>{' '}
                to project estimated clicks, conversions, and target CPA.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
