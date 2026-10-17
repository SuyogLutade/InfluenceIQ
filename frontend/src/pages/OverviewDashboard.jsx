import React, { useEffect, useState } from 'react';
import {
  Users,
  Eye,
  Activity,
  Globe2,
  Tag,
  Heart,
  TrendingUp,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend
} from 'recharts';

import { api } from '../api/client';
import { useFilter } from '../context/FilterContext';
import GlobalFilterBar from '../components/GlobalFilterBar';
import KPICard from '../components/KPICard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Tooltip from '../components/Tooltip';
import { formatCompactNumber, formatPercentage } from '../utils/formatters';

const CHART_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981',
  '#F59E0B', '#06B6D4', '#84CC16', '#F97316', '#64748B'
];

export default function OverviewDashboard() {
  const {
    selectedCountries,
    selectedCategories,
    followerRange,
    engagementRange,
    searchQuery,
    clearAllFilters
  } = useFilter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.getOverviewAnalytics({
      countries: selectedCountries,
      categories: selectedCategories,
      min_followers: followerRange.min,
      max_followers: followerRange.max,
      min_engagement: engagementRange.min,
      max_engagement: engagementRange.max,
      search: searchQuery
    })
      .then(res => {
        if (isMounted) setData(res);
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Failed to load analytics overview');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [
    selectedCountries,
    selectedCategories,
    followerRange.min,
    followerRange.max,
    engagementRange.min,
    engagementRange.max,
    searchQuery
  ]);

  if (loading && !data) {
    return (
      <div className="p-6">
        <GlobalFilterBar />
        <LoadingSpinner message="Calculating dataset statistics and aggregations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <GlobalFilterBar />
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl text-center">
          <p className="font-semibold mb-2">Error Loading Analytics</p>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  const { kpis, charts, filtered_record_count, total_dataset_count } = data;

  if (filtered_record_count === 0) {
    return (
      <div className="p-6">
        <GlobalFilterBar />
        <EmptyState onReset={clearAllFilters} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Global Filter Bar */}
      <GlobalFilterBar />

      {/* Dataset Filter Coverage Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600">
        <div>
          Showing <span className="font-bold text-slate-900">{filtered_record_count}</span> of{' '}
          <span className="font-bold text-slate-900">{total_dataset_count}</span> total influencers in dataset
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Calculated directly from verified Kaggle records</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard
          title="Total Influencers"
          value={kpis.total_influencers}
          subtitle="Filtered cohort sample size"
          tooltipText="The count of creator profiles matching active filters."
          whyItMatters="Determines the statistical sample size available for campaign candidate selection."
          icon={Users}
        />

        <KPICard
          title="Total Followers"
          value={formatCompactNumber(kpis.total_followers)}
          subtitle="Cumulative gross followers"
          tooltipText="Sum of reported follower counts for all influencers in this group."
          whyItMatters="Reflects maximum gross reach, but contains high multi-creator audience duplication."
          disclaimer="Sum includes overlapping audiences; not unique reach."
          icon={Eye}
        />

        <KPICard
          title="Avg Followers"
          value={formatCompactNumber(kpis.average_followers)}
          subtitle="Mean audience per creator"
          tooltipText="Average follower count across the selected cohort."
          whyItMatters="Assists in setting baseline audience expectations for campaign tier classification."
          icon={TrendingUp}
        />

        <KPICard
          title="Avg Engagement"
          value={formatPercentage(kpis.average_engagement_rate)}
          subtitle={`Median: ${formatPercentage(kpis.median_engagement_rate)}`}
          tooltipText="Average 60-day engagement rate recorded across profiles."
          whyItMatters="Higher engagement indicates stronger active resonance, critical for conversion campaigns."
          badgeText={kpis.average_engagement_rate > 2 ? 'Strong' : 'Moderate'}
          badgeType={kpis.average_engagement_rate > 2 ? 'positive' : 'neutral'}
          icon={Activity}
        />

        <KPICard
          title="Countries"
          value={kpis.total_countries}
          subtitle="Unique origins represented"
          tooltipText="Count of distinct creator countries in the active filter selection."
          whyItMatters="Essential for regional localization and geo-targeted brand campaigns."
          icon={Globe2}
        />

        <KPICard
          title="Categories"
          value={kpis.total_categories}
          subtitle="Distinct industry niches"
          tooltipText="Count of unique categories represented among selected influencers."
          whyItMatters="Ensures sufficient cross-industry creator coverage for diversified campaigns."
          icon={Tag}
        />
      </div>

      {/* Charts Grid - Row 1: Top Creators by Followers & Engagement Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Influencers by Followers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  Top Influencers by Follower Count
                  <Tooltip
                    text="Ranks influencers by total reported followers in the dataset."
                    whyItMatters="Identifies the largest top-of-funnel reach creators for brand awareness campaigns."
                  />
                </h3>
                <p className="text-xs text-slate-500">Gross follower size (millions)</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.top_by_followers}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    tickFormatter={(val) => formatCompactNumber(val)}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="influencer_name"
                    width={110}
                    tick={{ fontSize: 11, fill: '#334155' }}
                  />
                  <RechartsTooltip
                    formatter={(val) => [formatCompactNumber(val), 'Followers']}
                    labelFormatter={(name) => `Creator: ${name}`}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="followers" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
            <span className="font-semibold text-slate-700">Interpretation:</span> Top accounts offer mass awareness, but huge follower counts do not guarantee high conversion or engaged post interactions.
          </div>
        </div>

        {/* Top Influencers by Engagement Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  Top Influencers by 60-Day Engagement Rate
                  <Tooltip
                    text="Displays creators with the highest proportion of active audience interactions relative to followers."
                    whyItMatters="High engagement signals active community connection, ideal for consideration and direct-response campaigns."
                  />
                </h3>
                <p className="text-xs text-slate-500">Documented 60-day interaction percentage (%)</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.top_by_engagement}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="influencer_name"
                    width={110}
                    tick={{ fontSize: 11, fill: '#334155' }}
                  />
                  <RechartsTooltip
                    formatter={(val) => [`${Number(val).toFixed(2)}%`, 'Engagement Rate']}
                    labelFormatter={(name) => `Creator: ${name}`}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="engagement_rate" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
            <span className="font-semibold text-slate-700">Interpretation:</span> Creators in this chart maintain higher audience responsiveness per follower. This signals high content resonance, but does not guarantee lower acquisition costs without testing.
          </div>
        </div>
      </div>

      {/* Charts Grid - Row 2: Followers vs Engagement Rate Scatter Plot */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              Followers vs. Engagement Rate Correlation
              <Tooltip
                text="Scatter plot positioning creators by Audience Size (X-axis) vs Engagement Rate (Y-axis)."
                whyItMatters="Reveals whether larger influencers suffer from audience fatigue or maintain high interaction."
              />
            </h3>
            <p className="text-xs text-slate-500">Examines audience size trade-offs</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                type="number"
                dataKey="followers"
                name="Followers"
                tickFormatter={(val) => formatCompactNumber(val)}
                tick={{ fontSize: 11, fill: '#64748B' }}
                label={{ value: 'Followers (Audience Scale)', position: 'insideBottom', offset: -10, fontSize: 12, fill: '#64748B' }}
              />
              <YAxis
                type="number"
                dataKey="engagement_rate"
                name="Engagement Rate"
                tickFormatter={(val) => `${val}%`}
                tick={{ fontSize: 11, fill: '#64748B' }}
                label={{ value: 'Engagement Rate (%)', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748B' }}
              />
              <ZAxis range={[50, 150]} />
              <RechartsTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const pt = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700">
                      <p className="font-bold text-white mb-1">{pt.influencer_name} (@{pt.username})</p>
                      <p className="text-slate-300">Category: <span className="text-indigo-300">{pt.category}</span></p>
                      <p className="text-slate-300">Followers: <span className="font-semibold">{formatCompactNumber(pt.followers)}</span></p>
                      <p className="text-slate-300">Engagement: <span className="font-semibold text-emerald-400">{formatPercentage(pt.engagement_rate)}</span></p>
                      <p className="text-slate-300">Avg Likes: <span className="font-semibold">{formatCompactNumber(pt.average_likes)}</span></p>
                    </div>
                  );
                }}
              />
              <Scatter name="Influencers" data={charts.scatter_followers_vs_engagement} fill="#8B5CF6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
          <span className="font-semibold text-slate-700">Insight:</span> Notice the clustering: top mega-influencers (above 200M followers) typically cluster around 0.5%–2% engagement, while creators with higher percentage spikes often operate in specific high-resonance niches.
        </div>
      </div>

      {/* Charts Grid - Row 3: Category & Country Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-1.5">
              Influencer Distribution by Category
              <Tooltip
                text="Breakdown of top influencers grouped by content niche."
                whyItMatters="Shows industry representation in the dataset for campaign alignment."
              />
            </h3>
            <p className="text-xs text-slate-500 mb-4">Sample counts and proportion</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.category_distribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {charts.category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val, name, entry) => [
                      `${val} creators (${entry.payload.percentage}%)`,
                      entry.payload.name
                    ]}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
            <span className="font-semibold text-slate-700">Sample Count Note:</span> High representation in a category (e.g., Music or Sports) reflects dataset composition, not consumer spending dominance.
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-1.5">
              Geographic Distribution (Top Countries)
              <Tooltip
                text="Top countries represented by influencer count in this dataset."
                whyItMatters="Highlights regional markets with creator availability."
              />
            </h3>
            <p className="text-xs text-slate-500 mb-4">Creators per documented origin country</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.country_distribution} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    formatter={(val, name, entry) => [`${val} creators (${entry.payload.percentage}%)`, 'Count']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
            <span className="font-semibold text-slate-700">Geographic Note:</span> The presence of many creators from a country does not measure audience demand or purchasing power in that territory.
          </div>
        </div>
      </div>
    </div>
  );
}
