import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Sliders,
  TrendingUp,
  Layers,
  HelpCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import PlotlyChart from '../components/PlotlyChart';
import api from '../api';

export default function EDAPage() {
  const [edaData, setEdaData] = useState(null);
  const [activeFeature, setActiveFeature] = useState('Rainfall_mm');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEDA();
      setEdaData(res);
    } catch (err) {
      setError(err.message || 'Failed to load EDA data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Generating distribution matrices and boxplot quantiles...</p>
      </div>
    );
  }

  if (error || !edaData) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800 text-rose-200">
        <h3 className="font-bold">EDA Data Loading Failed</h3>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadData} className="mt-3 px-3 py-1.5 bg-rose-700 rounded-lg text-xs">
          Retry
        </button>
      </div>
    );
  }

  const dists = edaData.distributions || {};
  const currentDist = dists[activeFeature] || {};
  const box = currentDist.boxplot || {};

  // 1. Histogram trace
  const histTrace = {
    x: currentDist.bin_labels || [],
    y: currentDist.counts || [],
    type: 'bar',
    marker: {
      color: activeFeature === 'Flood_Risk_Score' ? '#f59e0b' : activeFeature === 'Rainfall_mm' ? '#0ea5e9' : activeFeature === 'River_Level_m' ? '#6366f1' : '#14b8a6',
      line: { color: 'rgba(255,255,255,0.2)', width: 1 }
    },
    name: 'Frequency'
  };

  // 2. Boxplot trace
  const boxTrace = {
    y: [box.min, box.q1, box.median, box.q3, box.max],
    type: 'box',
    name: activeFeature,
    boxpoints: 'outliers',
    marker: { color: '#06b6d4' },
    line: { color: '#38bdf8' }
  };

  // 3. District Comparison Chart
  const districtList = edaData.district_comparison || [];
  const districtComparisonTraces = [
    {
      x: districtList.map(d => d.district),
      y: districtList.map(d => d.avg_risk_score),
      type: 'bar',
      name: 'Avg Risk Score (0-100)',
      marker: { color: '#f59e0b' }
    },
    {
      x: districtList.map(d => d.district),
      y: districtList.map(d => d.avg_rainfall / 5), // Scaled for visual comparison
      type: 'bar',
      name: 'Rainfall (scaled mm ÷ 5)',
      marker: { color: '#0ea5e9' }
    },
    {
      x: districtList.map(d => d.district),
      y: districtList.map(d => d.avg_river_level * 5), // Scaled for visual comparison
      type: 'bar',
      name: 'River Head (scaled m × 5)',
      marker: { color: '#6366f1' }
    }
  ];

  // 4. Bivariate Scatter Plot
  const scatterRaw = edaData.scatter_data || {};
  const scatterPoints =
    activeFeature === 'Rainfall_mm'
      ? scatterRaw.rainfall_vs_risk || []
      : activeFeature === 'River_Level_m'
      ? scatterRaw.river_vs_risk || []
      : scatterRaw.soil_vs_risk || [];

  const scatterTrace = {
    x: scatterPoints.map(p => p.x),
    y: scatterPoints.map(p => p.y),
    mode: 'markers',
    type: 'scatter',
    text: scatterPoints.map(p => `${p.district}: (${p.x}, ${p.y})`),
    marker: {
      size: 7,
      color: scatterPoints.map(p => p.y),
      colorscale: 'Portland',
      showscale: true,
      colorbar: {
        title: { text: 'Risk Score', side: 'right', font: { color: '#94a3b8', size: 10 } },
        tickfont: { color: '#94a3b8', size: 9 },
        thickness: 12
      }
    }
  };

  const featureLabels = {
    Rainfall_mm: 'Rainfall (mm)',
    River_Level_m: 'River Level (m)',
    Soil_Permeability_mm_hr: 'Soil Permeability (mm/hr)',
    Flood_Risk_Score: 'Flood Risk Score (Target)'
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            Exploratory Data Analysis (EDA)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            JNTUK EDA Units 1 & 2 • Parametric profiling, skewness checks, and outlier detection
          </p>
        </div>

        {/* Feature Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {Object.keys(featureLabels).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFeature(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeFeature === f
                  ? 'bg-cyan-500 text-navy-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {featureLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Distribution & Boxplot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frequency Histogram (Span 2) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Univariate Distribution Histogram: {featureLabels[activeFeature]}
              </h3>
              <p className="text-xs text-slate-400">
                Frequency counts categorized into 15 equal metric bins
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
              N = 500 samples
            </span>
          </div>

          <div className="h-72">
            <PlotlyChart
              data={[histTrace]}
              layout={{
                xaxis: { title: `${featureLabels[activeFeature]} Bins`, tickangle: -30 },
                yaxis: { title: 'Record Count' },
                margin: { t: 15, b: 65, l: 45, r: 15 }
              }}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Outlier Discovery Boxplot (Span 1) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-white">Five-Number Summary & Outliers</h3>
            <p className="text-xs text-slate-400">Boxplot quantiles (Q1, Median, Q3, Whiskers)</p>
          </div>

          <div className="h-56">
            <PlotlyChart
              data={[boxTrace]}
              layout={{
                yaxis: { title: featureLabels[activeFeature] },
                margin: { t: 10, b: 30, l: 50, r: 15 }
              }}
              className="w-full h-full"
            />
          </div>

          {/* Quantile stats readout */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-3 pt-3 border-t border-slate-800">
            <div className="text-slate-400">Min: <span className="text-slate-200">{box.min}</span></div>
            <div className="text-slate-400">Q1 (25%): <span className="text-slate-200">{box.q1}</span></div>
            <div className="text-slate-400">Median: <span className="text-cyan-400 font-bold">{box.median}</span></div>
            <div className="text-slate-400">Q3 (75%): <span className="text-slate-200">{box.q3}</span></div>
            <div className="text-slate-400 col-span-2">Max: <span className="text-slate-200">{box.max}</span></div>
          </div>
        </div>
      </div>

      {/* Bivariate Scatter Plot */}
      {activeFeature !== 'Flood_Risk_Score' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Bivariate Scatter: {featureLabels[activeFeature]} vs Flood Risk Score
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing functional linear correlation before deploying Ordinary Least Squares regression
              </p>
            </div>
            <span className="text-xs text-cyan-400 font-medium">
              Target: Flood Risk Score (0-100)
            </span>
          </div>

          <div className="h-80">
            <PlotlyChart
              data={[scatterTrace]}
              layout={{
                xaxis: { title: featureLabels[activeFeature] },
                yaxis: { title: 'Flood Risk Score (0-100)' },
                margin: { t: 15, b: 45, l: 50, r: 40 }
              }}
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* District Comparison Grouped Bar Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white">
            District Multi-Metric Comparative Profile
          </h3>
          <p className="text-xs text-slate-400">
            Cross-analyzing average risk, monsoonal rainfall, and river level across all 9 coastal districts
          </p>
        </div>

        <div className="h-80">
          <PlotlyChart
            data={districtComparisonTraces}
            layout={{
              barmode: 'group',
              xaxis: { title: 'District' },
              yaxis: { title: 'Metric Level' },
              legend: { orientation: 'h', y: 1.1, x: 0 },
              margin: { t: 30, b: 50, l: 50, r: 20 }
            }}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Academic Insights Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            Rainfall Distribution
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Exhibits high variance (51mm to 449mm) reflecting distinct dry periods and intense cyclonic depressions characteristic of Bay of Bengal coastal monsoon patterns.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            River Gauge Level
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Spans 1.0m to 14.99m across Godavari, Krishna, and Pennar delta monitoring stations. Danger mark thresholds typically breached beyond 10.0m.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
            Soil Permeability Mitigation
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ranges from 0.10 to 9.86 mm/hr. Clayey delta alluvium possesses low permeability, accelerating surface pooling, while coastal sandy loam facilitates rapid aquifer drainage.
          </p>
        </div>
      </div>
    </div>
  );
}
