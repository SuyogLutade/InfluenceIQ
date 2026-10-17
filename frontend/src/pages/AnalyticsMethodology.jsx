import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  formatCompactNumber,
  formatPercent,
  getCategoryColor
} from '../utils/formatters';
import {
  BookOpen,
  Sliders,
  ShieldCheck,
  HelpCircle,
  Calculator,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Trophy
} from 'lucide-react';

export default function AnalyticsMethodology() {
  // Custom Scoring Model Weights (defaults: 0.35, 0.45, 0.20)
  const [weightFollowers, setWeightFollowers] = useState(35);
  const [weightEngagement, setWeightEngagement] = useState(45);
  const [weightInfluence, setWeightInfluence] = useState(20);
  const [customRankings, setCustomRankings] = useState([]);
  const [calculating, setCalculating] = useState(false);

  const totalRawWeight = weightFollowers + weightEngagement + weightInfluence;
  const pctFollowers = totalRawWeight > 0 ? Math.round((weightFollowers / totalRawWeight) * 100) : 33;
  const pctEngagement = totalRawWeight > 0 ? Math.round((weightEngagement / totalRawWeight) * 100) : 34;
  const pctInfluence = totalRawWeight > 0 ? Math.round((weightInfluence / totalRawWeight) * 100) : 33;

  const runCustomScoring = async () => {
    try {
      setCalculating(true);
      const res = await api.calculateCustomScore({
        weight_followers: weightFollowers / 100,
        weight_engagement: weightEngagement / 100,
        weight_influence: weightInfluence / 100
      });
      setCustomRankings(res.slice(0, 10)); // Top 10
    } catch (err) {
      console.error('Failed to calculate custom score', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    runCustomScoring();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Transparency & Mathematical Foundations</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Analytics Methodology & Scoring Model
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          InfluenceIQ operates strictly on authentic data from the Kaggle Top Instagram Influencers dataset. We believe in complete algorithmic transparency: every metric, formula, and edge case is documented below without black-box metrics.
        </p>
      </div>

      {/* Interactive Custom Scoring Tool */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Interactive Weighted Ranking Simulator</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Build Your Brand’s Tailored Influencer Score
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust the weights according to your campaign objectives (e.g., prioritize Engagement for conversions or Followers for brand awareness).
              </p>
            </div>
            <button
              onClick={runCustomScoring}
              disabled={calculating}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-2xs self-start md:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
              <span>{calculating ? 'Recalculating...' : 'Recalculate Rankings'}</span>
            </button>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 pt-4 border-t border-indigo-100">
            {/* Slider 1: Followers */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Audience Scale (Followers)</span>
                <span className="font-bold text-indigo-600">{pctFollowers}% weight</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weightFollowers}
                onChange={(e) => setWeightFollowers(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[11px] text-slate-500">
                Min-Max normalized reach [0–100] across all 200 accounts.
              </p>
            </div>

            {/* Slider 2: Engagement Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">60-Day Engagement Rate</span>
                <span className="font-bold text-emerald-600">{pctEngagement}% weight</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weightEngagement}
                onChange={(e) => setWeightEngagement(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-[11px] text-slate-500">
                Min-Max normalized percentage of audience interacting actively.
              </p>
            </div>

            {/* Slider 3: Influence Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Dataset Influence Score</span>
                <span className="font-bold text-purple-600">{pctInfluence}% weight</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weightInfluence}
                onChange={(e) => setWeightInfluence(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-[11px] text-slate-500">
                Normalized index score provided in the Kaggle dataset.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Rankings Results */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Top 10 Re-Ranked Creators by Your Custom Formula
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Formula: (Norm_Fol × {pctFollowers}%) + (Norm_Eng × {pctEngagement}%) + (Norm_Inf × {pctInfluence}%)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Influencer</th>
                  <th className="py-2.5 px-3">Composite Score</th>
                  <th className="py-2.5 px-3">Followers (Norm)</th>
                  <th className="py-2.5 px-3">Engagement (Norm)</th>
                  <th className="py-2.5 px-3">Influence (Norm)</th>
                  <th className="py-2.5 px-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customRankings.map((inf) => (
                  <tr key={inf.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      #{inf.custom_rank}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">@{inf.username}</div>
                      <div className="text-[10px] text-slate-400">{inf.influencer_name}</div>
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-indigo-600">
                      <div className="flex items-center gap-2">
                        <span className="w-9 font-mono">{inf.composite_score.toFixed(1)}</span>
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, inf.composite_score)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-slate-700">{inf.norm_followers}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({formatCompactNumber(inf.followers)})</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-emerald-600 font-semibold">{inf.norm_engagement}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({formatPercent(inf.engagement_rate)})</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-purple-600">{inf.norm_influence}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getCategoryColor(inf.category)}`}>
                        {inf.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Metric Definitions & Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
              01
            </span>
            <h3 className="text-sm font-bold text-slate-900">60-Day Engagement Rate</h3>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs text-indigo-900 border border-slate-200">
            Engagement Rate = (Avg Likes + Avg Comments) / Total Followers
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Measures the percentage of an influencer’s total audience that actively reacts to recent posts. In the raw Kaggle dataset, comments were omitted from collection, so the rate is derived strictly from verified 60-day like volume relative to followers.
          </p>
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200/60">
            <strong>Typical Benchmarks:</strong> &gt; 3% is exceptional for accounts with &gt; 10M followers; 1–2% is standard for mega-celebrities.
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-xs">
              02
            </span>
            <h3 className="text-sm font-bold text-slate-900">Follower Count &amp; Scale Normalization</h3>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs text-purple-900 border border-slate-200">
            Norm_Followers = (Followers - Min_Fol) / (Max_Fol - Min_Fol) × 100
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Followers represent gross audience reach. To prevent mega-accounts (such as Cristiano Ronaldo or Kylie Jenner) from completely overwhelming smaller creators in comparative scoring, we utilize min-max scaling to project reach onto an interpretable [0, 100] scale.
          </p>
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200/60">
            <strong>Data Cleaning Note:</strong> Follower numbers with strings such as &quot;485m&quot; or &quot;98.2m&quot; are strictly parsed to 64-bit floating point numbers.
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xs">
              03
            </span>
            <h3 className="text-sm font-bold text-slate-900">New Post Avg Likes vs Historical Average</h3>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs text-emerald-900 border border-slate-200">
            Momentum Ratio = New Post Avg Likes / Historical Avg Likes
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Comparing likes on new posts versus lifetime average likes exposes recent algorithm resonance. A ratio &gt; 1.0 indicates that recent content is outperforming historical baseline, while &lt; 1.0 indicates temporary post fatigue or algorithm decay.
          </p>
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200/60">
            <strong>Safeguard:</strong> If Historical Avg Likes is 0 or null, division is protected by returning a null indicator rather than throwing <code>ZeroDivisionError</code>.
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-xs">
              04
            </span>
            <h3 className="text-sm font-bold text-slate-900">Kaggle Influence Score</h3>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs text-amber-900 border border-slate-200">
            Dataset Field: influence_score ∈ [0, 100]
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Supplied directly in the Kaggle dataset, this composite index measures holistic creator authority across the platform. InfluenceIQ preserves this original metric while allowing marketers to weigh it against direct engagement metrics.
          </p>
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200/60">
            <strong>Fidelity:</strong> When Raw Mode is toggled, InfluenceIQ displays exact values without alteration.
          </div>
        </div>
      </div>

      {/* Data Integrity & Ethical Limitations */}
      <div className="bg-slate-900 text-slate-300 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>System Ethics &amp; Methodological Limitations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/60">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Zero Synthetic Fabrication
            </h4>
            <p className="text-slate-400">
              Unlike many commercial dashboards that generate fake comment counts or hallucinated demographic breakdowns, InfluenceIQ strictly marks missing fields as &quot;Not available&quot;.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/60">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Static Dataset Snapshot
            </h4>
            <p className="text-slate-400">
              The Kaggle dataset captures a snapshot of the top 200 accounts. It does not reflect day-to-day real-time Instagram Stories, Reels video completion rates, or private DM shares.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/60">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              Bot &amp; Follower Quality
            </h4>
            <p className="text-slate-400">
              Gross follower counts can be inflated by inactive or automated accounts. We recommend prioritizing the 60-Day Engagement Rate and utilizing the Campaign Simulator before committing ad dollars.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
