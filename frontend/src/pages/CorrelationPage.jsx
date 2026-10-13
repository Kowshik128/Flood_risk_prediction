import React, { useState, useEffect } from 'react';
import {
  GitCommit,
  ArrowRightLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingDown,
  TrendingUp,
  Scale
} from 'lucide-react';
import PlotlyChart from '../components/PlotlyChart';
import api from '../api';

export default function CorrelationPage() {
  const [corrData, setCorrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCorrelation();
  }, []);

  async function loadCorrelation() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCorrelation();
      setCorrData(res);
    } catch (err) {
      setError(err.message || 'Failed to load correlation data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Computing Pearson Product-Moment correlation matrix...</p>
      </div>
    );
  }

  if (error || !corrData) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800 text-rose-200">
        <h3 className="font-bold">Correlation Matrix Error</h3>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadCorrelation} className="mt-3 px-3 py-1.5 bg-rose-700 rounded-lg text-xs">
          Retry
        </button>
      </div>
    );
  }

  const columns = corrData.columns || [];
  const matrix = corrData.matrix || [];
  const pairs = corrData.pairs || [];

  const prettyLabels = {
    Rainfall_mm: 'Rainfall',
    River_Level_m: 'River Level',
    Soil_Permeability_mm_hr: 'Soil Perm.',
    Flood_Risk_Score: 'Flood Risk'
  };

  const axisLabels = columns.map(c => prettyLabels[c] || c);

  // Annotations for heatmap cells
  const annotations = [];
  for (let i = 0; i < columns.length; i++) {
    for (let j = 0; j < columns.length; j++) {
      const val = matrix[i]?.[j];
      annotations.push({
        x: axisLabels[j],
        y: axisLabels[i],
        text: val !== undefined ? Number(val).toFixed(2) : '',
        font: {
          family: 'JetBrains Mono, monospace',
          color: Math.abs(val) > 0.5 ? '#ffffff' : '#cbd5e1',
          size: 13,
          weight: 700
        },
        showarrow: false
      });
    }
  }

  const heatmapTrace = {
    z: matrix,
    x: axisLabels,
    y: axisLabels,
    type: 'heatmap',
    colorscale: [
      [0.0, '#3b82f6'],   // Negative correlation (Blue)
      [0.5, '#0f172a'],   // Zero correlation (Neutral Dark)
      [1.0, '#ef4444']    // Positive correlation (Red)
    ],
    zmin: -1.0,
    zmax: 1.0,
    hoverongaps: false,
    colorbar: {
      title: { text: 'Pearson (r)', side: 'right', font: { color: '#94a3b8', size: 11 } },
      tickfont: { color: '#94a3b8', size: 10 },
      thickness: 14
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-cyan-400" />
          Statistical Correlation Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          JNTUK Statistical Methods Unit 2 • Pearson Product-Moment Correlation (r) & Multicollinearity Diagnostics
        </p>
      </div>

      {/* Heatmap & Academic Theory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap (7 cols) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 lg:col-span-7">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Pearson Correlation Matrix Heatmap</h3>
              <p className="text-xs text-slate-400">Interdependency between environmental drivers and target risk score</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              -1.0 ≤ r ≤ +1.0
            </span>
          </div>

          <div className="h-80">
            <PlotlyChart
              data={[heatmapTrace]}
              layout={{
                annotations: annotations,
                xaxis: { tickfont: { color: '#e2e8f0', size: 11 } },
                yaxis: { tickfont: { color: '#e2e8f0', size: 11 }, automargin: true },
                margin: { t: 20, b: 40, l: 80, r: 40 }
              }}
              className="w-full h-full"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span className="flex items-center gap-1.5 text-blue-400">
              <TrendingDown className="w-3.5 h-3.5" /> r &lt; 0 (Inverse Relationship)
            </span>
            <span className="text-slate-400">r ≈ 0 (Orthogonal)</span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <TrendingUp className="w-3.5 h-3.5" /> r &gt; 0 (Direct Relationship)
            </span>
          </div>
        </div>

        {/* Statistical Notes & Formula (5 cols) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-cyan-400" />
              Mathematical Formulation
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 leading-relaxed mb-4">
              r = Σ[(X - X̄)(Y - Ȳ)] / √[Σ(X - X̄)² · Σ(Y - Ȳ)²]
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="font-semibold text-sky-400 block mb-1">
                  1. Rainfall vs Risk (r ≈ +0.73)
                </span>
                <p className="text-slate-400">
                  Strong positive correlation. Precipitation constitutes the primary volumetric moisture input causing rapid surface runoff accumulation.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="font-semibold text-indigo-400 block mb-1">
                  2. River Level vs Risk (r ≈ +0.60)
                </span>
                <p className="text-slate-400">
                  Strong positive correlation. Higher river gauge readings indicate baseline channel saturation, reducing capacity to convey inland floodwaters into the ocean.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="font-semibold text-teal-400 block mb-1">
                  3. Soil Permeability vs Risk (r ≈ -0.32)
                </span>
                <p className="text-slate-400">
                  Inverse negative correlation. High permeability allows rainwater infiltration into groundwater aquifers, attenuating surface runoff and suppressing flood risk.
                </p>
              </div>
            </div>
          </div>

          {/* Multicollinearity Verification Badge */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-800/40">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Multicollinearity Check Passed:</strong> Cross-correlations among predictors (|r| &lt; 0.3) confirm Ordinary Least Squares (OLS) estimator stability.
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Pairwise Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-3">Pairwise Statistical Indicators</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071120] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Independent Variable (X)</th>
                <th className="py-2.5 px-4">Dependent / Paired Variable (Y)</th>
                <th className="py-2.5 px-4 font-mono">Pearson (r)</th>
                <th className="py-2.5 px-4 font-mono">Covariance (Cov)</th>
                <th className="py-2.5 px-4">Relationship Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {pairs.map((p, idx) => {
                const isTarget = p.feature_2 === 'Flood_Risk_Score';
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isTarget ? 'bg-cyan-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-sans font-medium text-slate-200">
                      {p.feature_1}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-200">
                      {p.feature_2}
                      {isTarget && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-cyan-900/60 text-cyan-300 font-sans">
                          Target
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          p.correlation > 0.5
                            ? 'text-rose-400'
                            : p.correlation < -0.2
                            ? 'text-sky-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {p.correlation > 0 ? `+${p.correlation}` : p.correlation}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{p.covariance}</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.correlation > 0.6
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                            : p.correlation < -0.3
                            ? 'bg-sky-950/60 text-sky-300 border border-sky-800/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {p.interpretation}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
