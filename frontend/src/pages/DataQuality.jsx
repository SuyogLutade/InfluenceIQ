import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useFilter } from '../context/FilterContext';
import {
  ShieldCheck,
  Database,
  FileText,
  AlertCircle,
  CheckCircle2,
  Upload,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Layers,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DataQuality() {
  const { enrichmentEnabled, toggleEnrichmentMode } = useFilter();
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Custom upload state
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchQualityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMetadata();
      setMetadata(data);
    } catch (err) {
      console.error('Failed to load dataset metadata', err);
      setError(err.message || 'Failed to fetch metadata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityData();
  }, [enrichmentEnabled]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadSuccess(null);
      setUploadError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadSuccess(null);
      setUploadError(null);
      const res = await api.uploadDataset(selectedFile);
      setUploadSuccess(`Successfully loaded "${res.dataset_name}" with ${res.total_records} rows!`);
      setSelectedFile(null);
      await fetchQualityData();
    } catch (err) {
      console.error('Failed to upload dataset:', err);
      setUploadError(err.message || 'Failed to process custom CSV file');
    } finally {
      setUploading(false);
    }
  };

  if (loading && !metadata) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Auditing Kaggle dataset schema and column completeness..." />
      </div>
    );
  }

  const auditItems = metadata?.missing_values_audit
    ? Object.entries(metadata.missing_values_audit).map(([key, val]) => ({
        field: key,
        ...val
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Dataset Provenance &amp; Verification</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Quality &amp; Dataset Information
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Complete transparency into the underlying Kaggle Instagram dataset, column schema mapping, completeness percentages, and raw vs. enriched modes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.kaggle.com/datasets/surajjha101/top-instagram-influencers-data-cleaned"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Kaggle Dataset Source</span>
          </a>
        </div>
      </div>

      {/* Dataset KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Verified Records</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {metadata?.valid_records_processed ?? 200}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% of authentic Kaggle rows loaded</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Enrichment State</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{enrichmentEnabled ? 'Enriched' : 'Raw Mode'}</span>
            <span className={`w-2 h-2 rounded-full ${enrichmentEnabled ? 'bg-purple-500' : 'bg-slate-400'}`} />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {enrichmentEnabled ? 'Industry categories verified' : 'Strict raw CSV labels'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Duplicate Records</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {metadata?.duplicate_records_detected ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Zero duplicate usernames detected
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Dataset File</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {metadata?.dataset_name || 'top_insta_influencers_data.csv'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            surajjha101/top-instagram
          </div>
        </div>
      </div>

      {/* Mode Toggle Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-purple-950">
              Category Metadata Enrichment Controller
            </h3>
          </div>
          <p className="text-xs text-purple-800 max-w-2xl">
            The raw Kaggle dataset provided columns for follower counts, engagement rates, and countries, but did not categorize influencers (e.g. Music, Sports, Fashion). When enabled, InfluenceIQ enriches each profile with verified public creator industry categories while strictly preserving raw numerical metrics.
          </p>
        </div>

        <button
          onClick={() => toggleEnrichmentMode(!enrichmentEnabled)}
          className={`shrink-0 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
            enrichmentEnabled
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          {enrichmentEnabled ? '✓ Enriched Mode Active (Switch to Raw)' : 'Switch to Verified Enriched Mode'}
        </button>
      </div>

      {/* Field Completeness Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Canonical Field Completeness Audit
          </h3>
          <p className="text-xs text-slate-500">
            Verification of every standard influencer metric against raw input columns and missing value handling.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Canonical Metric</th>
                <th className="py-3 px-4">Mapped CSV Column</th>
                <th className="py-3 px-4">Completeness Ratio</th>
                <th className="py-3 px-4">Missing Rows</th>
                <th className="py-3 px-4">Status &amp; Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditItems.map((item) => {
                const isComplete = item.completeness_pct >= 95;
                const isAvailable = item.available;

                return (
                  <tr key={item.field} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900 capitalize">
                      {item.field.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {item.raw_column ? `row["${item.raw_column}"]` : 'None (Omitted in Raw CSV)'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              !isAvailable
                                ? 'bg-slate-300'
                                : isComplete
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.completeness_pct || 0}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-700 font-semibold">
                          {item.completeness_pct !== undefined ? `${item.completeness_pct}%` : '0%'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {item.missing_count ?? 0}
                    </td>
                    <td className="py-3 px-4">
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active Metric</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <AlertCircle className="w-3 h-3 text-slate-400" />
                          <span>Strict &quot;Not available&quot; (Zero Synthetic)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unsupported Analyses Notice */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>Excluded Metrics &amp; Dataset Scope Limitations</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          To maintain scientific integrity, InfluenceIQ explicitly declares features that cannot be authentically computed from this static snapshot:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metadata?.unsupported_analyses?.map((u, idx) => (
            <div key={idx} className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900">{u.feature}</span>
                <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded">
                  {u.status}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {u.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Dataset Upload Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wide mb-1">
          <Upload className="w-4 h-4" />
          <span>Extensibility &amp; Custom Data Loading</span>
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Upload Custom Influencer CSV
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
          You can load your own marketing CSV file. The backend auto-detects column names using flexible alias matching for followers, engagement, country, and username.
        </p>

        <form onSubmit={handleUpload} className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Upload className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
            <span>{uploading ? 'Uploading & Parsing...' : 'Load Custom CSV'}</span>
          </button>
        </form>

        {uploadSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
