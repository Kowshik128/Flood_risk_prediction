import React, { useState, useEffect } from 'react';
import {
  Cpu,
  CloudRain,
  Waves,
  Droplet,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Info,
  RefreshCw,
  Sliders,
  Flame,
  ArrowRight
} from 'lucide-react';
import api from '../api';

const SCENARIO_PRESETS = [
  {
    name: 'Godavari Monsoonal Cyclone',
    desc: 'Heavy torrential downpour, high river stage, low soil permeability',
    rainfall: 410,
    riverLevel: 13.8,
    soilPerm: 1.5
  },
  {
    name: 'Krishna Delta Inundation',
    desc: 'Moderate rain with high upstream river inflow',
    rainfall: 260,
    riverLevel: 11.2,
    soilPerm: 3.8
  },
  {
    name: 'Typical Autumn Transition',
    desc: 'Average precipitation and normal river flow',
    rainfall: 180,
    riverLevel: 6.5,
    soilPerm: 5.5
  },
  {
    name: 'Dry Winter Baseline',
    desc: 'Minimal precipitation, low river level, high groundwater absorption',
    rainfall: 45,
    riverLevel: 2.2,
    soilPerm: 9.0
  }
];

export default function PredictionPage() {
  const [rainfall, setRainfall] = useState(250);
  const [riverLevel, setRiverLevel] = useState(8.0);
  const [soilPerm, setSoilPerm] = useState(4.5);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    runPrediction();
  }, [rainfall, riverLevel, soilPerm]);

  async function runPrediction() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.predictRisk({
        rainfall_mm: Number(rainfall),
        river_level_m: Number(riverLevel),
        soil_permeability_mm_hr: Number(soilPerm)
      });
      setPredictionResult(res);
    } catch (err) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(preset) {
    setRainfall(preset.rainfall);
    setRiverLevel(preset.riverLevel);
    setSoilPerm(preset.soilPerm);
  }

  const score = predictionResult?.predicted_score ?? 0;
  const category = predictionResult?.category ?? 'Moderate';
  const categoryColor = predictionResult?.category_color ?? '#f59e0b';
  const advisory = predictionResult?.advisory ?? '';
  const contributions = predictionResult?.contributions ?? [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          Flood Risk Prediction Calculator
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time inferencing with trained Multiple Linear Regression model (OLS) loaded via Joblib
        </p>
      </div>

      {/* Main Grid: Inputs (Left) and Score Meter (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Environmental Parameter Controls (7 cols) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Environmental Parameter Inputs
            </h3>
            <span className="text-[11px] text-slate-400">
              Interactive Sliders & Numeric Inputs
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs text-slate-400 block mb-2 font-medium">
              Simulation Presets:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SCENARIO_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 hover:border-cyan-700/50 transition group"
                >
                  <span className="text-[11px] font-semibold text-slate-200 group-hover:text-cyan-300 block truncate">
                    {p.name}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    {p.rainfall}mm | {p.riverLevel}m
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input 1: Rainfall */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-2 text-sky-400">
                <CloudRain className="w-4 h-4" />
                Rainfall (X₁)
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold text-right text-xs focus:outline-none focus:border-cyan-500"
                />
                <span className="text-slate-400 text-xs">mm</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="1"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 mm (Arid)</span>
              <span>253 mm (Dataset Avg)</span>
              <span>500 mm (Extreme Monsoon)</span>
            </div>
          </div>

          {/* Input 2: River Level */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-2 text-indigo-400">
                <Waves className="w-4 h-4" />
                River Gauge Level (X₂)
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={riverLevel}
                  onChange={(e) => setRiverLevel(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold text-right text-xs focus:outline-none focus:border-cyan-500"
                />
                <span className="text-slate-400 text-xs">meters</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={riverLevel}
              onChange={(e) => setRiverLevel(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.0 m (Dry Bed)</span>
              <span>8.0 m (Baseline Depth)</span>
              <span>20.0 m (Spillway Overtopping)</span>
            </div>
          </div>

          {/* Input 3: Soil Permeability */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-2 text-teal-400">
                <Droplet className="w-4 h-4" />
                Soil Permeability (X₃)
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <input
                  type="number"
                  min="0"
                  max="15"
                  step="0.1"
                  value={soilPerm}
                  onChange={(e) => setSoilPerm(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold text-right text-xs focus:outline-none focus:border-cyan-500"
                />
                <span className="text-slate-400 text-xs">mm/hr</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={soilPerm}
              onChange={(e) => setSoilPerm(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.1 mm/hr (Clay/Impermeable)</span>
              <span>4.9 mm/hr (Dataset Avg)</span>
              <span>15.0 mm/hr (Sandy Alluvium)</span>
            </div>
          </div>
        </div>

        {/* Prediction Output & Risk Gauge (5 cols) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-5 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Model Inundation Forecast</h3>
              {loading && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
            </div>

            {/* Circular Gauge / Risk Meter */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center relative overflow-hidden">
              {/* Radial gradient background based on score */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${categoryColor}, transparent 70%)`
                }}
              />

              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                Predicted Flood Risk Score
              </span>

              {/* Big Score / 100 */}
              <div className="flex items-baseline justify-center gap-1 font-mono my-2">
                <span
                  className="text-5xl md:text-6xl font-extrabold tracking-tight transition-colors duration-300"
                  style={{ color: categoryColor }}
                >
                  {score.toFixed(1)}
                </span>
                <span className="text-lg font-bold text-slate-400">/ 100</span>
              </div>

              {/* Category Badge */}
              <div
                className="mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-md inline-flex items-center gap-1.5"
                style={{
                  backgroundColor: `${categoryColor}20`,
                  borderColor: `${categoryColor}50`,
                  color: categoryColor
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: categoryColor }}
                />
                {category} Risk Tier
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full mt-5 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, score))}%`,
                    backgroundColor: categoryColor
                  }}
                />
              </div>

              <div className="flex justify-between w-full text-[10px] text-slate-400 font-mono mt-1">
                <span>0 (Low)</span>
                <span>30</span>
                <span>60</span>
                <span>80</span>
                <span>100 (Critical)</span>
              </div>
            </div>

            {/* Category Scale Reference */}
            <div className="grid grid-cols-4 gap-1.5 mt-3 text-center text-[10px] font-mono">
              <div className={`p-1.5 rounded-lg border ${category === 'Low' ? 'bg-emerald-950/80 border-emerald-500 font-bold text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                0–30<br/>Low
              </div>
              <div className={`p-1.5 rounded-lg border ${category === 'Moderate' ? 'bg-amber-950/80 border-amber-500 font-bold text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                31–60<br/>Moderate
              </div>
              <div className={`p-1.5 rounded-lg border ${category === 'High' ? 'bg-orange-950/80 border-orange-500 font-bold text-orange-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                61–80<br/>High
              </div>
              <div className={`p-1.5 rounded-lg border ${category === 'Very High' ? 'bg-rose-950/80 border-rose-500 font-bold text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                81–100<br/>Very High
              </div>
            </div>
          </div>

          {/* Mandatory Project Disclaimer Alert */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-700/50 text-amber-200 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Mandatory Disclosure:</strong> These are project-defined categories for analytical visualization, NOT official government thresholds.
            </p>
          </div>

          {/* Civil Advisory Protocol */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="font-semibold text-slate-300 block mb-1">
              Operational Safety Advisory:
            </span>
            <p className="text-slate-400 leading-relaxed">{advisory}</p>
          </div>
        </div>
      </div>

      {/* Factor Decomposition Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-2">
          Mathematical Factor Decomposition (Ordinary Least Squares Contribution)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Exact breakdown of how each environmental term contributes to the final score: <span className="font-mono text-cyan-400">Score = β₀ + β₁·X₁ + β₂·X₂ + β₃·X₃</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {contributions.map((c, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">
                {c.factor}
              </span>
              <div className="text-xl font-bold font-mono text-white my-1">
                {c.value > 0 ? `+${c.value}` : c.value} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
              <span className="text-[10px] text-slate-400 leading-tight block">
                {c.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
