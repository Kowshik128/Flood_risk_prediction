import React from 'react';
import {
  LayoutDashboard,
  Database,
  BarChart2,
  GitCommit,
  TrendingUp,
  Cpu,
  Building2,
  Map,
  BookOpen,
  Waves,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'dataset', label: 'Dataset Explorer', icon: Database, badge: '500' },
  { id: 'eda', label: 'Exploratory EDA', icon: BarChart2, badge: null },
  { id: 'correlation', label: 'Correlation Analysis', icon: GitCommit, badge: null },
  { id: 'regression', label: 'ML Regression (OLS)', icon: TrendingUp, badge: 'R² 95%' },
  { id: 'prediction', label: 'Flood Risk Predictor', icon: Cpu, badge: 'Live' },
  { id: 'districts', label: 'District Analysis', icon: Building2, badge: '9' },
  { id: 'map', label: 'Interactive Risk Map', icon: Map, badge: 'GIS' },
  { id: 'about', label: 'About & Methodology', icon: BookOpen, badge: 'JNTUK' },
];

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#091528] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 bg-[#071120]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                AP Flood Risk
                <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-semibold">
                  v1.0
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Prediction & Analytics System</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-cyan-300/80 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-900/40 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>APDMA Decision Support Model</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation Sections
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#071120] text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              FastAPI Engine
            </span>
            <span className="font-mono text-[10px] text-slate-400">Port 8000</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            DataSource: <span className="text-slate-400 font-mono">ap_flood_dataset.csv</span>
          </div>
        </div>
      </aside>
    </>
  );
}
