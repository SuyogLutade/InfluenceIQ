import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Eye,
  ShoppingBag,
  Percent,
  Sparkles,
  Info,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import KPICard from '../components/KPICard';

export default function CampaignPerformance() {
  const PRESETS = [
    {
      name: 'Macro Influencer Awareness',
      spend: 25000,
      impressions: 2500000,
      clicks: 50000,
      conversions: 1250,
      revenue: 62500,
      description: 'High reach campaign prioritizing brand awareness with moderate direct conversion.'
    },
    {
      name: 'Micro Influencer Direct Response',
      spend: 5000,
      impressions: 300000,
      clicks: 15000,
      conversions: 600,
      revenue: 18000,
      description: 'Niche creator campaign with high engagement and higher conversion efficiency.'
    },
    {
      name: 'Product Launch Blitz',
      spend: 12000,
      impressions: 950000,
      clicks: 28500,
      conversions: 850,
      revenue: 34000,
      description: 'Multi-creator coordinated campaign driving immediate ecommerce checkout volume.'
    },
    {
      name: 'Underperforming Campaign (Stress Test)',
      spend: 10000,
      impressions: 400000,
      clicks: 6000,
      conversions: 80,
      revenue: 4000,
      description: 'Stress test scenario demonstrating negative ROI and high acquisition costs.'
    }
  ];

  const [inputs, setInputs] = useState({
    spend: 25000,
    impressions: 2500000,
    clicks: 50000,
    conversions: 1250,
    revenue: 62500
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateSimulator = async (overrideInputs = null) => {
    const payload = overrideInputs || inputs;
    try {
      setLoading(true);
      const res = await api.simulateCampaign(payload);
      setResults(res);
    } catch (err) {
      console.error('Failed to simulate campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSimulator();
  }, []);

  const handleInputChange = (field, value) => {
    const numericVal = Math.max(0, Number(value) || 0);
    const updated = { ...inputs, [field]: numericVal };
    setInputs(updated);
    calculateSimulator(updated);
  };

  const applyPreset = (preset) => {
    const nextInputs = {
      spend: preset.spend,
      impressions: preset.impressions,
      clicks: preset.clicks,
      conversions: preset.conversions,
      revenue: preset.revenue
    };
    setInputs(nextInputs);
    calculateSimulator(nextInputs);
  };

  const metrics = results?.calculated_metrics;
  const isProfitable = (metrics?.net_profit || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
          <Calculator className="w-4 h-4" />
          <span>Strategic Decision Support Tool</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Campaign Performance Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Model ad spend, click-through rates, acquisition costs, and estimated return on ad spend (ROAS). Test scenario assumptions before contracting influencers.
        </p>

        {/* Dataset Disclosure Notice */}
        <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-lg flex items-start gap-2.5 text-xs text-indigo-950">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p>
            <strong>Methodology Transparency Notice:</strong> Private brand campaign performance metrics (e.g. ad spend, conversions, and client revenue) are not present in public Instagram/Kaggle datasets. InfluenceIQ provides this standard financial simulator to bridge creator discovery with ROI planning.
          </p>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Scenario Presets:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-xs group cursor-pointer"
            >
              <div className="font-bold text-slate-900 group-hover:text-indigo-700">
                {p.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {p.description}
              </div>
              <div className="mt-2 text-[10px] font-mono text-indigo-600 font-semibold">
                Spend: ${p.spend.toLocaleString()} | Rev: ${p.revenue.toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Inputs Form */}
        <div className="lg:col-span-1 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Campaign Parameters</h3>
            <button
              onClick={() => applyPreset(PRESETS[0])}
              className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Input 1: Spend */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Campaign Budget / Influencer Fee ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={inputs.spend}
                  onChange={(e) => handleInputChange('spend', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                />
              </div>
            </div>

            {/* Input 2: Impressions */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estimated Campaign Impressions
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={inputs.impressions}
                onChange={(e) => handleInputChange('impressions', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Total post views / impressions across feed &amp; stories
              </p>
            </div>

            {/* Input 3: Clicks */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Link / Profile Clicks
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={inputs.clicks}
                onChange={(e) => handleInputChange('clicks', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
              />
            </div>

            {/* Input 4: Conversions */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Conversions / Orders
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={inputs.conversions}
                onChange={(e) => handleInputChange('conversions', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
              />
            </div>

            {/* Input 5: Revenue */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Attributed Gross Revenue ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={inputs.revenue}
                  onChange={(e) => handleInputChange('revenue', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Outcomes & Funnel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Output KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-4 rounded-xl border ${isProfitable ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'}`}>
              <div className="text-slate-500 text-[11px] font-semibold mb-1">Net Profit / Margin</div>
              <div className={`text-xl font-extrabold ${isProfitable ? 'text-emerald-700' : 'text-rose-700'}`}>
                ${metrics ? metrics.net_profit.toLocaleString() : '0'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Revenue - Spend</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-[11px] font-semibold mb-1">ROI (%)</div>
              <div className={`text-xl font-extrabold ${(metrics?.roi_percent || 0) >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                {metrics ? `${metrics.roi_percent}%` : '0%'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Net Return on Spend</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-[11px] font-semibold mb-1">ROAS Multiple</div>
              <div className="text-xl font-extrabold text-purple-600">
                {metrics ? `${metrics.roas}x` : '0x'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Gross Rev / Spend</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-[11px] font-semibold mb-1">Cost Per Acquisition</div>
              <div className="text-xl font-extrabold text-slate-900">
                ${metrics ? metrics.cpa.toFixed(2) : '0.00'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Spend / Conversions</div>
            </div>
          </div>

          {/* Marketing Conversion Funnel */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Marketing Conversion Funnel Efficiency
            </h3>

            <div className="space-y-3">
              {/* Stage 1: Impressions */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-800">1. Impressions</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-900">
                  {inputs.impressions.toLocaleString()} views
                </div>
              </div>

              {/* Conversion Step 1 -> 2 */}
              <div className="flex items-center justify-center text-[11px] text-slate-500 font-medium gap-2">
                <span>↓ CTR: <strong>{metrics ? `${metrics.ctr_percent}%` : '0%'}</strong></span>
                <span>•</span>
                <span>CPC: <strong>${metrics ? metrics.cpc.toFixed(2) : '0.00'}</strong></span>
              </div>

              {/* Stage 2: Clicks */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800">2. Clicks (Traffic)</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-900">
                  {inputs.clicks.toLocaleString()} clicks
                </div>
              </div>

              {/* Conversion Step 2 -> 3 */}
              <div className="flex items-center justify-center text-[11px] text-slate-500 font-medium gap-2">
                <span>↓ CVR: <strong>{metrics ? `${metrics.conversion_rate_percent}%` : '0%'}</strong></span>
                <span>•</span>
                <span>CPA: <strong>${metrics ? `$${metrics.cpa.toFixed(2)}` : '$0.00'}</strong></span>
              </div>

              {/* Stage 3: Conversions */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-800">3. Conversions</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-900">
                  {inputs.conversions.toLocaleString()} orders (${inputs.revenue.toLocaleString()})
                </div>
              </div>
            </div>
          </div>

          {/* Formulas Reference Accordion */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Standard Digital Marketing Formulas Applied:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                CTR = (Clicks / Impressions) × 100
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                CPC = Total Spend / Clicks
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                CVR = (Conversions / Clicks) × 100
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                CPA = Total Spend / Conversions
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                ROI = ((Revenue - Spend) / Spend) × 100
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                ROAS = Total Revenue / Spend
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
