import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [followerRange, setFollowerRange] = useState({ min: '', max: '' });
  const [engagementRange, setEngagementRange] = useState({ min: '', max: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  const [availableOptions, setAvailableOptions] = useState({
    countries: [],
    categories: [],
    min_followers: 0,
    max_followers: 500_000_000,
    min_engagement: 0,
    max_engagement: 30
  });

  const [compareList, setCompareList] = useState([]);
  const [enrichmentEnabled, setEnrichmentEnabled] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Load filter options on mount
  useEffect(() => {
    refreshFilterOptions();
  }, []);

  const refreshFilterOptions = async () => {
    try {
      setLoadingOptions(true);
      const data = await api.getFilterOptions();
      setAvailableOptions(data);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const clearAllFilters = () => {
    setSelectedCountries([]);
    setSelectedCategories([]);
    setFollowerRange({ min: '', max: '' });
    setEngagementRange({ min: '', max: '' });
    setSearchQuery('');
  };

  const addToCompare = (creator) => {
    if (!creator) return;
    setCompareList((prev) => {
      if (prev.some((c) => c.id === creator.id)) return prev;
      if (prev.length >= 5) {
        alert('You can compare a maximum of 5 influencers at a time.');
        return prev;
      }
      return [...prev, creator];
    });
  };

  const removeFromCompare = (id) => {
    setCompareList((prev) => prev.filter((c) => c.id !== id));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const toggleEnrichmentMode = async (enabled) => {
    try {
      await api.toggleEnrichment(enabled);
      setEnrichmentEnabled(enabled);
      await refreshFilterOptions();
    } catch (err) {
      console.error('Failed to toggle enrichment:', err);
    }
  };

  const hasActiveFilters = Boolean(
    selectedCountries.length > 0 ||
    selectedCategories.length > 0 ||
    followerRange.min !== '' ||
    followerRange.max !== '' ||
    engagementRange.min !== '' ||
    engagementRange.max !== '' ||
    searchQuery.trim() !== ''
  );

  const activeFilterCount = (
    selectedCountries.length +
    selectedCategories.length +
    (followerRange.min || followerRange.max ? 1 : 0) +
    (engagementRange.min || engagementRange.max ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0)
  );

  return (
    <FilterContext.Provider
      value={{
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
        activeFilterCount,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        enrichmentEnabled,
        toggleEnrichmentMode,
        refreshFilterOptions,
        loadingOptions
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
