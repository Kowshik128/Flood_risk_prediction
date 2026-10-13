import React from 'react';
import { Menu, Activity, RefreshCw, AlertTriangle, CloudRain } from 'lucide-react';

export default function Header({
  activeTabTitle,
  setIsMobileOpen,
  backendConnected,
  onRefresh,
  isRefreshing
}) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#071120]/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <span>AP Flood Risk Analytics</span>
            <span className="text-slate-400 font-normal">/</span>
            <span className="text-cyan-400 font-medium">{activeTabTitle}</span>
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Government of Andhra Pradesh • Coastal Zone Disaster Early Warning Protocol
          </p>
        </div>
      </div>

      {/* Right: Status Badges and Refresh */}
      <div className="flex items-center gap-2.5">
        {/* Real dataset badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-mono">
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          <span>ap_flood_dataset.csv</span>
        </div>

        {/* Backend Connectivity Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
            backendConnected
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span className="hidden sm:inline">
            {backendConnected ? 'Backend Connected' : 'API Offline'}
          </span>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-cyan-300 border border-slate-700/50 transition-all"
          title="Refresh real metrics from backend"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </header>
  );
}
