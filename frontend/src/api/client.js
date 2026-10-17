/**
 * InfluenceIQ API Client
 * Centralized fetch functions for communicating with the FastAPI backend.
 */

// Uses Vite environment variable if provided, defaulting to '/api' for local proxy and Vercel services rewrite
const BASE_URL = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      let errMsg = `Server error ${res.status}`;
      try {
        const errorJson = await res.json();
        errMsg = errorJson.detail || errMsg;
      } catch (e) {
        // fallback
      }
      throw new Error(errMsg);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    throw err;
  }
}

export const api = {
  getHealth: () => request('/health'),
  getMetadata: () => request('/metadata'),
  getFilterOptions: () => request('/filters/options'),
  
  getInfluencers: (params = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.countries && params.countries.length > 0) {
      params.countries.forEach(c => searchParams.append('country', c));
    }
    if (params.categories && params.categories.length > 0) {
      params.categories.forEach(c => searchParams.append('category', c));
    }
    if (params.min_followers !== undefined && params.min_followers !== null && params.min_followers !== '') {
      searchParams.append('min_followers', params.min_followers);
    }
    if (params.max_followers !== undefined && params.max_followers !== null && params.max_followers !== '') {
      searchParams.append('max_followers', params.max_followers);
    }
    if (params.min_engagement !== undefined && params.min_engagement !== null && params.min_engagement !== '') {
      searchParams.append('min_engagement', params.min_engagement);
    }
    if (params.max_engagement !== undefined && params.max_engagement !== null && params.max_engagement !== '') {
      searchParams.append('max_engagement', params.max_engagement);
    }
    if (params.search) {
      searchParams.append('search', params.search);
    }
    if (params.sort_by) {
      searchParams.append('sort_by', params.sort_by);
    }
    if (params.sort_order) {
      searchParams.append('sort_order', params.sort_order);
    }
    if (params.page) {
      searchParams.append('page', params.page);
    }
    if (params.page_size) {
      searchParams.append('page_size', params.page_size);
    }

    const queryStr = searchParams.toString();
    return request(`/influencers${queryStr ? `?${queryStr}` : ''}`);
  },

  getInfluencerDetail: (idOrUsername) => request(`/influencers/${idOrUsername}`),

  getOverviewAnalytics: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.countries && params.countries.length > 0) {
      params.countries.forEach(c => searchParams.append('country', c));
    }
    if (params.categories && params.categories.length > 0) {
      params.categories.forEach(c => searchParams.append('category', c));
    }
    if (params.min_followers) searchParams.append('min_followers', params.min_followers);
    if (params.max_followers) searchParams.append('max_followers', params.max_followers);
    if (params.min_engagement) searchParams.append('min_engagement', params.min_engagement);
    if (params.max_engagement) searchParams.append('max_engagement', params.max_engagement);
    if (params.search) searchParams.append('search', params.search);

    const queryStr = searchParams.toString();
    return request(`/analytics/overview${queryStr ? `?${queryStr}` : ''}`);
  },

  getCategoryAnalytics: () => request('/analytics/categories'),
  getCountryAnalytics: () => request('/analytics/countries'),

  compareInfluencers: (influencerIds) => request('/analytics/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ influencer_ids: influencerIds })
  }),

  calculateCustomScore: (weights) => request('/analytics/custom-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(weights)
  }),

  simulateCampaign: (inputs) => request('/campaign/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs)
  }),

  toggleEnrichment: (enabled) => request('/dataset/toggle-enrichment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  }),

  uploadDataset: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${BASE_URL}/dataset/upload`, {
      method: 'POST',
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    });
  }
};
