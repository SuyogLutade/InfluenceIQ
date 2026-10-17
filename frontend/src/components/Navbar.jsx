import React from 'react';
import { Menu, GitCompare, Sparkles, Database } from 'lucide-react';
import { useFilter } from '../context/FilterContext';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ setMobileOpen }) {
  const { compareList, enrichmentEnabled, toggleEnrichmentMode, hasActiveFilters, activeFilterCount } = useFilter();
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Overview Dashboard';
      case '/explorer': return 'Influencer Explorer';
      case '/compare': return 'Compare Influencers';
      case '/analysis': return 'Country & Category Analysis';
      case '/methodology': return 'Analytics Methodology';
      case '/data-quality': return 'Data Quality & Dataset Info';
      case '/campaign': return 'Campaign Performance Simulator';
      default: return 'Instagram Influencer Analytics';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle(location.pathname)}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            Evidence-based influencer benchmarking using real Kaggle dataset metrics
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Enrichment Mode Toggle Pill */}
        <button
          type="button"
          onClick={() => toggleEnrichmentMode(!enrichmentEnabled)}
          title={enrichmentEnabled ? 'Switch to Strict Raw CSV Mode' : 'Enable Verified Category & Name Enrichment'}
          className={`hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
            enrichmentEnabled
              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>{enrichmentEnabled ? 'Enriched Metadata' : 'Strict Raw Mode'}</span>
        </button>

        {/* Comparison Indicator Button */}
        {compareList.length > 0 && (
          <Link
            to="/compare"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Compare ({compareList.length})</span>
          </Link>
        )}

        {/* Dataset Source badge */}
        <Link
          to="/data-quality"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Dataset Audit</span>
        </Link>
      </div>
    </header>
  );
}
