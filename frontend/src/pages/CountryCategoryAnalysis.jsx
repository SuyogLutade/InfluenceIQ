import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  formatCompactNumber,
  formatPercent,
  getEngagementColor,
  getCategoryBadgeColor
} from '../utils/formatters';
import {
  PieChart,
  Globe,
  Tag,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CountryCategoryAnalysis() {
  const [activeTab, setActiveTab] = useState('category'); // 'category' | 'country'
  const [categoryData, setCategoryData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('avg_engagement'); // 'avg_engagement' | 'avg_followers' | 'count'
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [catRes, countryRes] = await Promise.all([
          api.getCategoryAnalytics(),
          api.getCountryAnalytics()
        ]);

        const rawCats = catRes?.category_performance || (Array.isArray(catRes) ? catRes : []);
        const rawCountries = countryRes?.country_performance || (Array.isArray(countryRes) ? countryRes : []);

        const normalizedCats = rawCats.map((item) => ({
          ...item,
          count: item.sample_count ?? item.count ?? 0,
          avg_engagement: item.avg_engagement_rate ?? item.avg_engagement ?? 0,
          avg_followers: item.avg_followers ?? 0,
          avg_likes: item.avg_likes ?? 0,
        }));

        const normalizedCountries = rawCountries.map((item) => ({
          ...item,
          count: item.sample_count ?? item.count ?? 0,
          avg_engagement: item.avg_engagement_rate ?? item.avg_engagement ?? 0,
          avg_followers: item.avg_followers ?? 0,
          avg_likes: item.avg_likes ?? 0,
        }));

        setCategoryData(normalizedCats);
        setCountryData(normalizedCountries);
      } catch (err) {
        console.error('Failed to load category/country analytics', err);
        setError(err.message || 'Failed to fetch macro analytics');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentDataset = activeTab === 'category' ? categoryData : countryData;

  const sortedData = [...currentDataset].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (aVal === undefined || aVal === null) aVal = 0;
    if (bVal === undefined || bVal === null) bVal = 0;
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Top performers for insights
  const topEngItem = [...currentDataset].sort((a, b) => (b.avg_engagement || 0) - (a.avg_engagement || 0))[0];
  const topFollowersItem = [...currentDataset].sort((a, b) => (b.avg_followers || 0) - (a.avg_followers || 0))[0];
  const largestCohort = [...currentDataset].sort((a, b) => (b.count || 0) - (a.count || 0))[0];

  // Chart data
  const chartItems = sortedData.slice(0, 10).map((item) => ({
    name: activeTab === 'category' ? (item.category || 'Uncategorized') : (item.country || 'Unknown'),
    engagementPct: Number((item.avg_engagement || 0).toFixed(2)),
    followersM: Number(((item.avg_followers || 0) / 1_000_000).toFixed(1)),
    count: item.count || 0
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6', '#64748b'];

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Aggregating macroeconomic metrics across Kaggle Top 200..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl">
        <h3 className="font-bold text-base mb-1">Failed to load analytics</h3>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <PieChart className="w-4 h-4" />
            <span>Macro Aggregations & Cohort Benchmarking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Country & Category Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Evaluate which creator niches and geographic origins offer the most engaged audiences and highest average followings across the authentic Kaggle dataset.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => { setActiveTab('category'); setSortBy('avg_engagement'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'category'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>By Category ({categoryData.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('country'); setSortBy('avg_engagement'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'country'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>By Country ({countryData.length})</span>
          </button>
        </div>
      </div>

      {/* Insights Highlight Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Highest Average Engagement</span>
          </div>
          <div className="text-lg font-bold text-emerald-950 truncate">
            {topEngItem ? (activeTab === 'category' ? topEngItem.category : topEngItem.country) : '—'}
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            Avg Engagement Rate:{' '}
            <span className="font-bold">
              {topEngItem ? formatPercent(topEngItem.avg_engagement) : '—'}
            </span>{' '}
            (n = {topEngItem?.count})
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-indigo-800 text-xs font-semibold mb-1">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Highest Average Audience Reach</span>
          </div>
          <div className="text-lg font-bold text-indigo-950 truncate">
            {topFollowersItem ? (activeTab === 'category' ? topFollowersItem.category : topFollowersItem.country) : '—'}
          </div>
          <div className="text-xs text-indigo-700 mt-1">
            Avg Followers:{' '}
            <span className="font-bold">
              {topFollowersItem ? formatCompactNumber(topFollowersItem.avg_followers) : '—'}
            </span>{' '}
            (n = {topFollowersItem?.count})
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-800 text-xs font-semibold mb-1">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Largest Cohort Representation</span>
          </div>
          <div className="text-lg font-bold text-purple-950 truncate">
            {largestCohort ? (activeTab === 'category' ? largestCohort.category : largestCohort.country) : '—'}
          </div>
          <div className="text-xs text-purple-700 mt-1">
            Influencers in Top 200:{' '}
            <span className="font-bold">{largestCohort?.count} creators</span>
          </div>
        </div>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Top 10 {activeTab === 'category' ? 'Categories' : 'Countries'} by 60-Day Eng Rate (%)
              </h3>
              <p className="text-xs text-slate-500">
                Average engagement percentage across cohort members.
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartItems}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" unit="%" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <RechartsTooltip
                  formatter={(val) => [`${val}%`, 'Avg Engagement']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="engagementPct" radius={[0, 4, 4, 0]}>
                  {chartItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Followers Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Top 10 {activeTab === 'category' ? 'Categories' : 'Countries'} by Avg Audience Size
              </h3>
              <p className="text-xs text-slate-500">
                Average follower volume (Millions) per creator in group.
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartItems}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" unit="M" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <RechartsTooltip
                  formatter={(val) => [`${val}M`, 'Avg Followers']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="followersM" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cohort Ranking Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Complete {activeTab === 'category' ? 'Category' : 'Country'} Performance Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Click column headers to sort by engagement rate, follower reach, or creator count.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Cohorts with n &lt; 3 may exhibit higher statistical variance.</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">
                  {activeTab === 'category' ? 'Category Name' : 'Country Name'}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('count')}>
                  <div className="flex items-center gap-1">
                    <span>Creator Sample (n)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('avg_followers')}>
                  <div className="flex items-center gap-1">
                    <span>Avg Followers</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('avg_engagement')}>
                  <div className="flex items-center gap-1">
                    <span>Avg 60-Day Eng Rate</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">
                  <span>Avg Likes / Post</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedData.map((row, idx) => {
                const label = activeTab === 'category' ? row.category : row.country;
                const isSmallSample = (row.count || 0) < 3;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {activeTab === 'category' ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeColor(label)}`}>
                            {label || 'Uncategorized'}
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-800">
                            {label || 'Unknown'}
                          </span>
                        )}
                        {isSmallSample && (
                          <span
                            title="Small sample size (n < 3)"
                            className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium"
                          >
                            n={row.count}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {row.count}
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">
                      {formatCompactNumber(row.avg_followers)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${getEngagementColor(row.avg_engagement)}`}>
                        {formatPercent(row.avg_engagement)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {formatCompactNumber(row.avg_likes)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
