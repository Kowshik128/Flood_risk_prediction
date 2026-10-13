import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  ShieldAlert,
  Code2,
  ChevronDown,
  Layers,
  CheckCircle2,
  HelpCircle,
  FileText,
  ExternalLink
} from 'lucide-react';

const VIVA_QUESTIONS = [
  {
    q: "Why do we perform Exploratory Data Analysis (EDA) prior to regression modeling?",
    a: "EDA is fundamental to confirm that raw environmental telemetry satisfies the classical assumptions of Ordinary Least Squares (OLS) regression: linearity between features and target, absence of severe multi-collinearity, normality of distributions, and homoscedasticity of error variance. It also enables detection of sensor anomalies or extreme cyclones without distorting estimator coefficients."
  },
  {
    q: "What does the negative regression coefficient for Soil Permeability (β₃ ≈ -2.205) signify?",
    a: "It mathematically establishes an inverse physical relationship: as soil infiltration capacity increases, surface runoff volume is absorbed rapidly into subterranean aquifers and groundwater tables. Consequently, higher permeability actively suppresses structural surface ponding and decreases the predicted flood hazard."
  },
  {
    q: "How do we interpret the Coefficient of Determination (R² ≈ 0.9542)?",
    a: "The R² score indicates that approximately 95.42% of the variance in the continuous Flood Risk Score across the coastal districts is successfully accounted for and explained by the three environmental predictors (Rainfall, River Gauge Level, and Soil Permeability), demonstrating exceptional predictive validity on unseen test samples."
  },
  {
    q: "Why is an 80/20 train-test partition used with random_state=42?",
    a: "Splitting the 500 records into 80% training (400 samples) and 20% testing (100 samples) prevents model overfitting while preserving sufficient sample volume to estimate unbiased evaluation metrics (MAE, MSE, RMSE, R²). Fixing the pseudorandom seed to 42 guarantees exact deterministic reproducibility across lab evaluations and viva reviews."
  },
  {
    q: "Why must the flood risk classification tiers include an explicit disclaimer?",
    a: "Official flood evacuation alerts are the statutory prerogative of the Andhra Pradesh State Disaster Management Authority (APDMA) and Central Water Commission (CWC). The 0–30, 31–60, 61–80, and 81–100 intervals are project-defined analytical categories designed for statistical visualization and educational decision support."
  }
];

export default function AboutPage() {
  const [openAccordion, setOpenAccordion] = useState(0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          System Methodology & Academic Defense Reference
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Target Authority: APDMA • Academic Curriculum Alignment: JNTUK 2nd-Year Syllabus
        </p>
      </div>

      {/* Alignment Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Academic Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" />
            JNTUK 2nd-Year Curriculum Specifications
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            Statistical Methods & Exploratory Data Analysis
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>EDA Units 1 & 2:</strong> Data profiling, summary statistics (mean, variance, standard deviation), outlier identification with boxplots, univariate & bivariate distributions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Statistical Methods Unit 2:</strong> Pearson Product-Moment correlation (r), covariance matrices, multicollinearity diagnosis, and Ordinary Least Squares (OLS) parameter optimization.</span>
            </li>
          </ul>
        </div>

        {/* Industrial Authority Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4" />
            Industrial & Operational Scope
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            Andhra Pradesh Disaster Management Authority (APDMA)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Designed to monitor and model the 9 historic coastal districts of Andhra Pradesh along the vulnerable 974 km Bay of Bengal littoral shoreline:
          </p>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-cyan-300 font-mono">
            {['Srikakulam', 'Vizianagaram', 'Visakhapatnam', 'East Godavari', 'West Godavari', 'Krishna', 'Guntur', 'Prakasam', 'Nellore'].map(d => (
              <span key={d} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mathematical Pipeline Formulation */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          Multiple Linear Regression Mathematical Formulation
        </h3>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm text-cyan-300 leading-relaxed">
          Y = β₀ + β₁·X₁ + β₂·X₂ + β₃·X₃ + ε
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <strong className="text-white block font-mono">Y : Flood Risk Score (Target)</strong>
              <span className="text-slate-400">Continuous index scaled from 0 to 100 indicating localized flood hazard severity.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <strong className="text-sky-400 block font-mono">X₁ : Rainfall (Rainfall_mm)</strong>
              <span className="text-slate-400">Total monsoonal precipitation volume in millimeters (mm). (β₁ &gt; 0)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <strong className="text-indigo-400 block font-mono">X₂ : River Gauge Level (River_Level_m)</strong>
              <span className="text-slate-400">Hydraulic head depth in meters (m) measured at river basin gauging stations. (β₂ &gt; 0)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <strong className="text-teal-400 block font-mono">X₃ : Soil Permeability (Soil_Permeability_mm_hr)</strong>
              <span className="text-slate-400">Hydraulic conductivity and aquifer infiltration rate in mm/hr. (β₃ &lt; 0)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Viva Voce Question Accordion */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            JNTUK Viva Voce & Review Defense Guide
          </h3>
          <span className="text-[11px] text-slate-400">Frequently Asked Review Questions</span>
        </div>

        <div className="space-y-2.5">
          {VIVA_QUESTIONS.map((item, idx) => {
            const isOpen = openAccordion === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenAccordion(isOpen ? -1 : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-800/40 transition"
                >
                  <span className="text-xs font-semibold text-slate-200">
                    Q{idx + 1}: {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Stack */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span>Engineered with React + Vite + Tailwind CSS + Python FastAPI + Scikit-Learn + Plotly + React-Leaflet</span>
        <span className="font-mono text-cyan-400 text-[11px]">System Status: All 9 Modules Operational</span>
      </div>
    </div>
  );
}
