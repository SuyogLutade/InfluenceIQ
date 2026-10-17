import React, { useState, useRef, useEffect } from 'react';
import { useFilter } from '../context/FilterContext';
import { Filter, X, ChevronDown, Search, RotateCcw, Check } from 'lucide-react';
import { formatCompactNumber } from '../utils/formatters';

export default function GlobalFilterBar() {
  const {
    selectedCountries,
    setSelectedCountries,
    selectedCategories,
    setSelectedCategories,
    followerRange,
    setFollowerRange,
    engagementRange,
    setEngagementRange,
    searchQuery,
    setSearchQuery,
    availableOptions,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount
  } = useFilter();

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const countryRef = useRef(null);
  const categoryRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setCountryDropdownOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCountry = (country) => {
    setSelectedCountries(prev => 
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const filteredCountries = availableOptions.countries.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCategories = availableOptions.categories.filter(c => 
    c.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs mb-6 relative z-20">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Filter Influencer Dataset
            </h4>
            <p className="text-[11px] text-slate-500">
              Country & Category operate concurrently via <span className="font-semibold text-indigo-600">AND</span> logic.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All Filters ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Filter controls row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3">
        {/* Search */}
        <div className="relative">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Search Creator
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Handle or Name..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Country Multi-Select Dropdown */}
        <div className={`relative ${countryDropdownOpen ? 'z-40' : 'z-10'}`} ref={countryRef}>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Country ({selectedCountries.length > 0 ? selectedCountries.length : 'All'})
          </label>
          <button
            type="button"
            onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
            className="w-full flex items-center justify-between py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-left text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="truncate">
              {selectedCountries.length === 0
                ? 'All Countries'
                : `${selectedCountries.length} selected`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {countryDropdownOpen && (
            <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-2xl p-2 animate-fadeIn">
              <input
                type="text"
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredCountries.map(country => (
                  <label
                    key={country}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country)}
                      onChange={() => toggleCountry(country)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="truncate select-none">{country}</span>
                  </label>
                ))}
                {filteredCountries.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No countries found</p>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCountryDropdownOpen(false)}
                  className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold cursor-pointer hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category Multi-Select Dropdown */}
        <div className={`relative ${categoryDropdownOpen ? 'z-40' : 'z-10'}`} ref={categoryRef}>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Category ({selectedCategories.length > 0 ? selectedCategories.length : 'All'})
          </label>
          <button
            type="button"
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            className="w-full flex items-center justify-between py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-left text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="truncate">
              {selectedCategories.length === 0
                ? 'All Categories'
                : `${selectedCategories.length} selected`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {categoryDropdownOpen && (
            <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2 animate-fadeIn">
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredCategories.map(cat => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="truncate select-none">{cat}</span>
                  </label>
                ))}
                {filteredCategories.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No categories found</p>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(false)}
                  className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold cursor-pointer hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Min Followers Range */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Min Followers
          </label>
          <input
            type="number"
            min="0"
            step="1000000"
            placeholder="e.g. 50000000"
            value={followerRange.min}
            onChange={(e) => setFollowerRange({ ...followerRange, min: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>

        {/* Min Engagement Rate % */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Min Engagement Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="e.g. 1.0%"
            value={engagementRange.min}
            onChange={(e) => setEngagementRange({ ...engagementRange, min: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Active Filter Tags Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 mr-1">Active Filters:</span>
          {selectedCountries.map(c => (
            <span
              key={c}
              className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200"
            >
              Country: {c}
              <button
                type="button"
                onClick={() => toggleCountry(c)}
                className="text-slate-400 hover:text-slate-600 ml-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {selectedCategories.map(cat => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200"
            >
              Category: {cat}
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className="text-indigo-400 hover:text-indigo-600 ml-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {followerRange.min && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              Min Followers: {formatCompactNumber(followerRange.min)}
              <button
                type="button"
                onClick={() => setFollowerRange({ ...followerRange, min: '' })}
                className="text-emerald-400 hover:text-emerald-600 ml-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {engagementRange.min && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">
              Min Eng: {engagementRange.min}%
              <button
                type="button"
                onClick={() => setEngagementRange({ ...engagementRange, min: '' })}
                className="text-violet-400 hover:text-violet-600 ml-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
              Search: "{searchQuery}"
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-amber-400 hover:text-amber-600 ml-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
