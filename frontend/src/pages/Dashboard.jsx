import React, { useState, useEffect } from 'react';
import {
  Database,
  Building2,
  CloudRain,
  Waves,
  Droplet,
  Gauge,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ExternalLink
} from 'lucide-react';
import PlotlyChart from '../components/PlotlyChart';
import api from '../api';

export default function Dashboard({ setActiveTab }) {
  const [kpi, setKpi] = useState(null);
  const [eda, setEda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);
      const [kpiRes, edaRes] = await Promise.all([
        api.getKPI(),
        api.getEDA()
      ]);
      setKpi(kpiRes);
      setEda(edaRes);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Aggregating live telemetry from ap_flood_dataset.csv...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-rose-200">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
          <h3 className="text-lg font-semibold">Backend Communication Failed</h3>
        </div>
        <p className="text-sm text-rose-300/80 mb-4">{error}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Risk distribution pie/donut chart data
  const dist = kpi.risk_distribution || {};
  const riskLabels = ['Low (0–30)', 'Moderate (31–60)', 'High (61–80)', 'Very High (81–100)'];
  const riskValues = [
    dist['Low'] || 0,
    dist['Moderate'] || 0,
    dist['High'] || 0,
    dist['Very High'] || 0
  ];
  const riskColors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

  const donutPlotData = [
    {
      labels: riskLabels,
      values: riskValues,
      type: 'pie',
      hole: 0.58,
      marker: { colors: riskColors },
      textinfo: 'percent',
      hoverinfo: 'label+value+percent',
      textposition: 'inside',
    }
  ];

  // District Comparison Bar Chart
  const districtList = eda?.district_comparison || [];
  const barPlotData = [
    {
      x: districtList.map(d => d.avg_risk_score),
      y: districtList.map(d => d.district),
      type: 'bar',
      orientation: 'h',
      marker: {
        color: districtList.map(d =>
          d.avg_risk_score > 60 ? '#ef4444' : d.avg_risk_score > 45 ? '#f97316' : d.avg_risk_score > 30 ? '#f59e0b' : '#10b981'
        )
      },
      text: districtList.map(d => `${d.avg_risk_score}/100`),
      textposition: 'auto',
      hoverinfo: 'y+x'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-navy-900 to-slate-900 border border-cyan-800/40 p-6 md:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Operational Surveillance System
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            AP Coastal Flood Risk Prediction & Analytics
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Real-time multi-factorial predictive modeling and geospatial risk intelligence serving the 9 coastal districts of Andhra Pradesh, powered by Multiple Linear Regression (OLS) and validated against historical monsoonal metrics.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('prediction')}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Gauge className="w-4 h-4" />
              Launch Risk Predictor
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-xs border border-slate-700 transition flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              Open Interactive Risk Map
            </button>
            <button
              onClick={() => setActiveTab('regression')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-xs border border-slate-700 transition flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              View ML OLS Model (R² 0.954)
            </button>
          </div>
        </div>
        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 -bottom-10 w-96 bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Records */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Records</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{kpi.total_records}</div>
          <div className="text-[11px] text-cyan-400/90 mt-1">Telemetry Samples</div>
        </div>

        {/* Monitored Districts */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Districts</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{kpi.unique_districts}</div>
          <div className="text-[11px] text-blue-400/90 mt-1">Coastal Mandals</div>
        </div>

        {/* Average Rainfall */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Rainfall</span>
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {kpi.avg_rainfall} <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <div className="text-[11px] text-sky-400/90 mt-1">Precipitation Index</div>
        </div>

        {/* Average River Level */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg River Level</span>
            <Waves className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {kpi.avg_river_level} <span className="text-xs font-normal text-slate-400">m</span>
          </div>
          <div className="text-[11px] text-indigo-400/90 mt-1">Hydraulic Head</div>
        </div>

        {/* Average Soil Permeability */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Soil Perm.</span>
            <Droplet className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {kpi.avg_soil_permeability} <span className="text-xs font-normal text-slate-400">mm/h</span>
          </div>
          <div className="text-[11px] text-teal-400/90 mt-1">Infiltration Rate</div>
        </div>

        {/* Average Risk Score */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Risk Score</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {kpi.avg_risk_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-amber-400/90 mt-1">Moderate Risk Tier</div>
        </div>
      </div>

      {/* Analytics Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Donut */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Project Risk Classification Breakdown</h3>
              <p className="text-xs text-slate-400">Dataset records categorized into project-defined risk bands</p>
            </div>
            <button
              onClick={() => setActiveTab('dataset')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              Dataset <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <PlotlyChart
              data={donutPlotData}
              layout={{
                showlegend: true,
                legend: { orientation: 'h', y: -0.1, x: 0 },
                margin: { t: 10, b: 20, l: 10, r: 10 }
              }}
              className="w-full h-full"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
            <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">Low</span>
              <p className="text-sm font-bold text-white font-mono">{dist['Low'] || 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-800/40">
              <span className="text-[10px] text-amber-400 uppercase font-semibold">Moderate</span>
              <p className="text-sm font-bold text-white font-mono">{dist['Moderate'] || 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-orange-950/30 border border-orange-800/40">
              <span className="text-[10px] text-orange-400 uppercase font-semibold">High</span>
              <p className="text-sm font-bold text-white font-mono">{dist['High'] || 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40">
              <span className="text-[10px] text-rose-400 uppercase font-semibold">Very High</span>
              <p className="text-sm font-bold text-white font-mono">{dist['Very High'] || 0}</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center italic">
            * Note: These are project-defined categories for analytical visualization, NOT official government thresholds.
          </p>
        </div>

        {/* District Risk Rankings Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Mean Flood Risk by District</h3>
              <p className="text-xs text-slate-400">Ranking of all 9 coastal districts from historical observations</p>
            </div>
            <button
              onClick={() => setActiveTab('districts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              Analyze <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72">
            <PlotlyChart
              data={barPlotData}
              layout={{
                yaxis: { automargin: true },
                xaxis: { title: 'Mean Risk Score (0-100)', range: [0, 80] },
                margin: { t: 10, b: 40, l: 110, r: 20 }
              }}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Advisory & Methodology Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-900/40 border border-cyan-700/40 text-cyan-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Decision Support Protocol: Multiple Linear Regression (OLS)
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Model accounts for precipitation volume ($X_1$), river head ($X_2$), and aquifer infiltration ($X_3$). Negative coefficient on soil permeability confirms natural drainage attenuation.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('about')}
          className="shrink-0 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-cyan-700/40 transition flex items-center gap-1.5"
        >
          View Methodology <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
