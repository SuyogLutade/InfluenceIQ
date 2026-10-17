import React, { useEffect, useState } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GitCompare,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

import { api } from '../api/client';
import { useFilter } from '../context/FilterContext';
import GlobalFilterBar from '../components/GlobalFilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import InfluencerDetailModal from '../components/InfluencerDetailModal';
import Tooltip from '../components/Tooltip';
import {
  formatCompactNumber,
  formatPercentage,
  getCategoryBadgeColor
} from '../utils/formatters';

export default function InfluencerExplorer() {
  const {
    selectedCountries,
    selectedCategories,
    followerRange,
    engagementRange,
    searchQuery,
    setSearchQuery,
    clearAllFilters,
    compareList,
    addToCompare,
    removeFromCompare
  } = useFilter();

  const [influencers, setInfluencers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected influencer for detail modal
  const [detailModalId, setDetailModalId] = useState(null);

  // Fetch influencers when filters, sorting, or pagination change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.getInfluencers({
      countries: selectedCountries,
      categories: selectedCategories,
      min_followers: followerRange.min,
      max_followers: followerRange.max,
      min_engagement: engagementRange.min,
      max_engagement: engagementRange.max,
      search: searchQuery,
      sort_by: sortBy,
      sort_order: sortOrder,
      page: page,
      page_size: pageSize
    })
      .then(res => {
        if (isMounted) {
          setInfluencers(res.items);
          setTotal(res.total);
          setTotalPages(res.total_pages);
        }
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Failed to load influencer records');
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
    searchQuery,
    sortBy,
    sortOrder,
    page,
    pageSize
  ]);

  // Reset to page 1 if filters or search change
  useEffect(() => {
    setPage(1);
  }, [
    selectedCountries,
    selectedCategories,
    followerRange.min,
    followerRange.max,
    engagementRange.min,
    engagementRange.max,
    searchQuery
  ]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3 h-3 text-indigo-600" />
      : <ArrowDown className="w-3 h-3 text-indigo-600" />;
  };

  const isCreatorCompared = (id) => compareList.some(c => c.id === id);

  return (
    <div className="space-y-6">
      {/* Global Filter Bar */}
      <GlobalFilterBar />

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs relative z-10">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 rounded-t-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Influencer Directory
            </h3>
            <p className="text-xs text-slate-500">
              Showing {total > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total} creators
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error / Empty / Table */}
        {loading ? (
          <LoadingSpinner message="Retrieving influencer records..." />
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm">
            <p className="font-semibold">{error}</p>
          </div>
        ) : influencers.length === 0 ? (
          <EmptyState onReset={clearAllFilters} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="relative z-20">
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th
                    onClick={() => handleSort('rank')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Rank</span>
                      {getSortIcon('rank')}
                    </div>
                  </th>

                  <th className="py-3 px-4">
                    Influencer
                  </th>

                  <th className="py-3 px-4">
                    Category
                  </th>

                  <th className="py-3 px-4">
                    Country
                  </th>

                  <th
                    onClick={() => handleSort('followers')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Followers</span>
                      <Tooltip
                        text="Total followers reported in the dataset."
                        whyItMatters="High audience reach indicator."
                        position="bottom"
                        align="center"
                      />
                      {getSortIcon('followers')}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('engagement_rate')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Eng. Rate</span>
                      <Tooltip
                        text="Documented 60-day engagement rate percentage."
                        whyItMatters="Reflects proportion of followers actively liking and commenting."
                        position="bottom"
                        align="center"
                      />
                      {getSortIcon('engagement_rate')}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('average_likes')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Avg. Likes</span>
                      <Tooltip
                        text="Average likes per post recorded in dataset."
                        whyItMatters="Evaluates content resonance per upload."
                        position="bottom"
                        align="center"
                      />
                      {getSortIcon('average_likes')}
                    </div>
                  </th>

                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span>Avg. Comments</span>
                      <Tooltip
                        text="Average comments per post."
                        whyItMatters="Not available in this dataset. We never display fake zeros."
                        position="bottom"
                        align="right"
                      />
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('influence_score')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Score</span>
                      {getSortIcon('influence_score')}
                    </div>
                  </th>

                  <th className="py-3 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {influencers.map((creator) => {
                  const compared = isCreatorCompared(creator.id);
                  return (
                    <tr
                      key={creator.id}
                      className="hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                        #{creator.rank ?? '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setDetailModalId(creator.id)}
                          className="text-left group cursor-pointer"
                        >
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {creator.influencer_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            @{creator.username}
                          </div>
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${getCategoryBadgeColor(creator.category)}`}>
                          {creator.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {creator.country || 'Unspecified'}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {formatCompactNumber(creator.followers)}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-emerald-600">
                        {formatPercentage(creator.engagement_rate)}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {formatCompactNumber(creator.average_likes)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 italic">
                        Not available
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {creator.influence_score ? `${creator.influence_score}/100` : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailModalId(creator.id)}
                          title="View Profile Details"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (compared) removeFromCompare(creator.id);
                            else addToCompare(creator);
                          }}
                          title={compared ? 'Remove from Compare' : 'Add to Compare'}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            compared
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                          }`}
                        >
                          {compared ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
            <div>
              Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Influencer Profile Detail Modal */}
      {detailModalId && (
        <InfluencerDetailModal
          influencerId={detailModalId}
          onClose={() => setDetailModalId(null)}
        />
      )}
    </div>
  );
}
