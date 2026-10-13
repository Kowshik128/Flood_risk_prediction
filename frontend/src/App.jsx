import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DatasetExplorer from './pages/DatasetExplorer';
import EDAPage from './pages/EDAPage';
import CorrelationPage from './pages/CorrelationPage';
import RegressionPage from './pages/RegressionPage';
import PredictionPage from './pages/PredictionPage';
import DistrictAnalysisPage from './pages/DistrictAnalysisPage';
import RiskMapPage from './pages/RiskMapPage';
import AboutPage from './pages/AboutPage';
import api from './api';

const TAB_TITLES = {
  dashboard: 'Executive Dashboard',
  dataset: 'Dataset Explorer (ap_flood_dataset.csv)',
  eda: 'Exploratory Data Analysis (EDA)',
  correlation: 'Statistical Correlation Analysis',
  regression: 'Multiple Linear Regression (OLS)',
  prediction: 'Flood Risk Prediction Calculator',
  districts: 'District Hydraulic Analysis',
  map: 'Interactive GIS Risk Map',
  about: 'About & Methodology (JNTUK / APDMA)'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkHealth();
  }, [refreshKey]);

  async function checkHealth() {
    try {
      setIsRefreshing(true);
      await api.getKPI();
      setBackendConnected(true);
    } catch (err) {
      console.warn('Backend connection ping failed:', err);
      setBackendConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshKey(k => k + 1);
  }

  return (
    <div className="min-h-screen bg-[#070e1c] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan-500 selection:text-navy-950">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Sticky Header */}
        <Header
          activeTabTitle={TAB_TITLES[activeTab] || 'Command Center'}
          setIsMobileOpen={setIsMobileOpen}
          backendConnected={backendConnected}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} key={refreshKey} />}
          {activeTab === 'dataset' && <DatasetExplorer key={refreshKey} />}
          {activeTab === 'eda' && <EDAPage key={refreshKey} />}
          {activeTab === 'correlation' && <CorrelationPage key={refreshKey} />}
          {activeTab === 'regression' && <RegressionPage key={refreshKey} />}
          {activeTab === 'prediction' && <PredictionPage key={refreshKey} />}
          {activeTab === 'districts' && <DistrictAnalysisPage key={refreshKey} />}
          {activeTab === 'map' && <RiskMapPage key={refreshKey} />}
          {activeTab === 'about' && <AboutPage key={refreshKey} />}
        </main>
      </div>
    </div>
  );
}
