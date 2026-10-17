import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  GitCompare,
  PieChart,
  BookOpen,
  ShieldCheck,
  Calculator,
  Camera,
  Sparkles
} from 'lucide-react';
import { useFilter } from '../context/FilterContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { compareList, enrichmentEnabled } = useFilter();

  const navItems = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/explorer', label: 'Influencer Explorer', icon: Compass },
    { 
      to: '/compare', 
      label: 'Compare Influencers', 
      icon: GitCompare,
      badge: compareList.length > 0 ? compareList.length : null
    },
    { to: '/analysis', label: 'Country & Category', icon: PieChart },
    { to: '/methodology', label: 'Analytics Methodology', icon: BookOpen },
    { to: '/data-quality', label: 'Data Quality & Info', icon: ShieldCheck },
    { to: '/campaign', label: 'Campaign Simulator', icon: Calculator },
  ];

  const handleLinkClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              InfluenceIQ
              <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Instagram Analytics</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-400/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Status footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Kaggle Top 200 Live
            </span>
            <span className="text-slate-500 font-mono text-[10px]">v1.0.0</span>
          </div>
          <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60 text-[10px]">
            <span className="font-semibold text-slate-300">Dataset Source:</span>
            <p className="text-slate-400 truncate">surajjha101/top-instagram</p>
            <div className="flex items-center gap-1 text-indigo-400 mt-1">
              <Sparkles className="w-3 h-3" />
              <span>Enrichment: {enrichmentEnabled ? 'Active' : 'Raw Mode'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
