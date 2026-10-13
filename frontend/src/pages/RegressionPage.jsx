import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Gauge,
  Percent,
  Sigma,
  ScatterChart
} from 'lucide-react';
import PlotlyChart from '../components/PlotlyChart';
import api from '../api';

export default function RegressionPage() {
  const [regressionData, setRegressionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRegression();
  }, []);

  async function loadRegression() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRegression();
      setRegressionData(res);
    } catch (err) {
      setError(err.message || 'Failed to load regression metrics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Validating 80/20 train-test split and evaluating OLS residuals...</p>
      </div>
    );
  }

  if (error || !regressionData) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800 text-rose-200">
        <h3 className="font-bold">Model Metrics Retrieval Failed</h3>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadRegression} className="mt-3 px-3 py-1.5 bg-rose-700 rounded-lg text-xs">
          Retry
        </button>
      </div>
    );
  }

  const m = regressionData.metrics || {};
  const plots = regressionData.evaluation_plots || {};
  const testPreds = plots.test_predictions || [];

  // Actual vs Predicted Plot
  const actuals = testPreds.map(p => p.actual);
  const preds = testPreds.map(p => p.predicted);

  const actualVsPredTrace = {
    x: actuals,
    y: preds,
    mode: 'markers',
    type: 'scatter',
    name: 'Test Set Predictions',
    marker: {
      color: '#38bdf8',
      size: 7,
      opacity: 0.85,
      line: { color: '#0284c7', width: 1 }
    }
  };

  // Ideal 45-degree reference line (y = x)
  const minVal = Math.min(...actuals, ...preds);
  const maxVal = Math.max(...actuals, ...preds);
  const referenceLineTrace = {
    x: [minVal, maxVal],
    y: [minVal, maxVal],
    mode: 'lines',
    type: 'scatter',
    name: 'Ideal Fit (y = x)',
    line: { color: '#ef4444', dash: 'dash', width: 2 }
  };

  // Residual Plot: Residuals vs Predicted
  const residuals = testPreds.map(p => p.residual);
  const residualTrace = {
    x: preds,
    y: residuals,
    mode: 'markers',
    type: 'scatter',
    name: 'Residuals (e = y - ŷ)',
    marker: {
      color: '#a855f7',
      size: 7,
      opacity: 0.85
    }
  };

  const zeroResidualLine = {
    x: [minVal, maxVal],
    y: [0, 0],
    mode: 'lines',
    type: 'scatter',
    name: 'Zero Error Line',
    line: { color: '#10b981', dash: 'dash', width: 1.5 }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Multiple Linear Regression Model (OLS)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Scikit-learn OLS engine • 80/20 train-test partition with seed <span className="font-mono text-cyan-400">random_state=42</span>
        </p>
      </div>

      {/* Mathematical Model Equation Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-800/40 bg-gradient-to-r from-blue-950/60 to-navy-900">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sigma className="w-4 h-4" />
          Fitted Ordinary Least Squares Regression Equation
        </div>
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm md:text-base font-mono text-white font-bold leading-relaxed overflow-x-auto">
          {m.formula_string}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Intercept (β₀)</span>
            <span className="text-white font-bold">{m.intercept}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Rainfall Coeff (β₁)</span>
            <span className="text-sky-400 font-bold">+{m.coefficients?.Rainfall_mm}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">River Level Coeff (β₂)</span>
            <span className="text-indigo-400 font-bold">+{m.coefficients?.River_Level_m}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Soil Perm. Coeff (β₃)</span>
            <span className="text-teal-400 font-bold">{m.coefficients?.Soil_Permeability_mm_hr}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Performance Metrics KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* R-Squared */}
        <div className="glass-panel p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-semibold">R² Score (Variance Explained)</span>
            <Percent className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 font-mono">
            {m.r2}
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-1">
            {(m.r2 * 100).toFixed(2)}% of risk variance explained
          </div>
        </div>

        {/* RMSE */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-900/40 bg-cyan-950/10">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-xs font-semibold">Root Mean Squared Error (RMSE)</span>
            <Gauge className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">
            {m.rmse}
          </div>
          <div className="text-[11px] text-cyan-400/90 mt-1">
            Risk Score standard error pts
          </div>
        </div>

        {/* MAE */}
        <div className="glass-panel p-4 rounded-xl border border-blue-900/40 bg-blue-950/10">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-xs font-semibold">Mean Absolute Error (MAE)</span>
            <Sigma className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-blue-300 font-mono">
            {m.mae}
          </div>
          <div className="text-[11px] text-blue-400/90 mt-1">
            Average absolute deviation
          </div>
        </div>

        {/* MSE */}
        <div className="glass-panel p-4 rounded-xl border border-indigo-900/40 bg-indigo-950/10">
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-xs font-semibold">Mean Squared Error (MSE)</span>
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">
            {m.mse}
          </div>
          <div className="text-[11px] text-indigo-400/90 mt-1">
            Test partition penalty metric
          </div>
        </div>
      </div>

      {/* Model Evaluation Charts (Actual vs Predicted & Residuals) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actual vs Predicted Scatter */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Actual vs Predicted Risk Score</h3>
              <p className="text-xs text-slate-400">
                Evaluating test subset ({m.test_samples_count} unseen samples) against ideal fit line
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              R² = {m.r2}
            </span>
          </div>

          <div className="h-72">
            <PlotlyChart
              data={[actualVsPredTrace, referenceLineTrace]}
              layout={{
                xaxis: { title: 'Actual Flood Risk Score' },
                yaxis: { title: 'Predicted Flood Risk Score' },
                margin: { t: 15, b: 45, l: 50, r: 20 },
                legend: { orientation: 'h', y: 1.1, x: 0 }
              }}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Residual Plot */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Residual Diagnostic Plot (e = y - ŷ)</h3>
              <p className="text-xs text-slate-400">
                Checking homoscedasticity assumption (constant variance around zero error)
              </p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              μ_res = {plots.mean_residual}
            </span>
          </div>

          <div className="h-72">
            <PlotlyChart
              data={[residualTrace, zeroResidualLine]}
              layout={{
                xaxis: { title: 'Fitted Predicted Score (ŷ)' },
                yaxis: { title: 'Residual Error (y - ŷ)' },
                margin: { t: 15, b: 45, l: 50, r: 20 },
                legend: { orientation: 'h', y: 1.1, x: 0 }
              }}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Model Parameter Breakdown & Interpretations */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-3">
          Parameter Weights & Hydrological Implications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between font-mono font-bold text-sky-400 mb-1">
              <span>Rainfall (β₁)</span>
              <span>+{m.coefficients?.Rainfall_mm}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Every 10 mm increase in rainfall drives an estimated <strong>+1.26 point</strong> surge in flood risk score, indicating rapid surface volume inundation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between font-mono font-bold text-indigo-400 mb-1">
              <span>River Gauge (β₂)</span>
              <span>+{m.coefficients?.River_Level_m}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Every 1 meter rise in river height adds <strong>+2.77 points</strong> to flood risk. River embankments reaching capacity prevents stormwater discharge.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between font-mono font-bold text-teal-400 mb-1">
              <span>Soil Permeability (β₃)</span>
              <span>{m.coefficients?.Soil_Permeability_mm_hr}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Every 1 mm/hr increase in infiltration reduces the risk score by <strong>-2.21 points</strong>. Acts as a vital subterranean absorption buffer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
