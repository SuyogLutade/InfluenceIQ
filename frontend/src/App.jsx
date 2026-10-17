import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import OverviewDashboard from './pages/OverviewDashboard';
import InfluencerExplorer from './pages/InfluencerExplorer';
import CompareInfluencers from './pages/CompareInfluencers';
import CountryCategoryAnalysis from './pages/CountryCategoryAnalysis';
import AnalyticsMethodology from './pages/AnalyticsMethodology';
import DataQuality from './pages/DataQuality';
import CampaignPerformance from './pages/CampaignPerformance';

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <BrowserRouter>
      <FilterProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          
          <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
            <Navbar setMobileOpen={setMobileOpen} />
            
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Routes>
                <Route path="/" element={<OverviewDashboard />} />
                <Route path="/explorer" element={<InfluencerExplorer />} />
                <Route path="/compare" element={<CompareInfluencers />} />
                <Route path="/analysis" element={<CountryCategoryAnalysis />} />
                <Route path="/methodology" element={<AnalyticsMethodology />} />
                <Route path="/data-quality" element={<DataQuality />} />
                <Route path="/campaign" element={<CampaignPerformance />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </FilterProvider>
    </BrowserRouter>
  );
}
