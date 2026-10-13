import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Waves,
  CloudRain,
  Droplet,
  Gauge,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import PlotlyChart from '../components/PlotlyChart';
import api from '../api';

export default function DistrictAnalysisPage() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictName, setSelectedDistrictName] = useState('East Godavari');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDistricts();
  }, []);

  async function loadDistricts() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDistricts();
      setDistricts(res.districts || []);
      if (res.districts?.length > 0) {
        setSelectedDistrictName(res.districts[0].district);
      }
    } catch (err) {
      setError(err.message || 'Failed to load district data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Aggregating district profiles and delta telemetry...</p>
      </div>
    );
  }

  if (error || districts.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800 text-rose-200">
        <h3 className="font-bold">District Profile Load Error</h3>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadDistricts} className="mt-3 px-3 py-1.5 bg-rose-700 rounded-lg text-xs">
          Retry
        </button>
      </div>
    );
  }

  const currentDistrict = districts.find(d => d.district === selectedDistrictName) || districts[0];

  // State average calculations
  const stateAvgRisk = districts.reduce((acc, d) => acc + d.avg_risk_score, 0) / districts.length;
  const stateAvgRainfall = districts.reduce((acc, d) => acc + d.avg_rainfall_mm, 0) / districts.length;
  const stateAvgRiver = districts.reduce((acc, d) => acc + d.avg_river_level_m, 0) / districts.length;
  const stateAvgSoil = districts.reduce((acc, d) => acc + d.avg_soil_permeability_mm_hr, 0) / districts.length;

  // Radar/Bar Comparison Chart: District vs State Average
  const comparisonCategories = ['Risk Score (0-100)', 'Rainfall (mm ÷ 5)', 'River Head (m × 5)', 'Soil Perm. (mm/hr × 8)'];
  const districtValues = [
    currentDistrict.avg_risk_score,
    currentDistrict.avg_rainfall_mm / 5,
    currentDistrict.avg_river_level_m * 5,
    currentDistrict.avg_soil_permeability_mm_hr * 8
  ];
  const stateValues = [
    stateAvgRisk,
    stateAvgRainfall / 5,
    stateAvgRiver * 5,
    stateAvgSoil * 8
  ];

  const radarData = [
    {
      type: 'scatterpolar',
      r: districtValues,
      theta: comparisonCategories,
      fill: 'toself',
      name: currentDistrict.district,
      fillcolor: 'rgba(6, 182, 212, 0.25)',
      line: { color: '#06b6d4', width: 2 }
    },
    {
      type: 'scatterpolar',
      r: stateValues,
      theta: comparisonCategories,
      fill: 'toself',
      name: 'AP State Coastal Average',
      fillcolor: 'rgba(148, 163, 184, 0.15)',
      line: { color: '#94a3b8', width: 1.5, dash: 'dash' }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-400" />
          District Hydraulic & Vulnerability Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          In-depth environmental profile and localized risk benchmarks across the 9 coastal districts
        </p>
      </div>

      {/* District Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {districts.map((d) => (
          <button
            key={d.district}
            onClick={() => setSelectedDistrictName(d.district)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-2 border ${
              selectedDistrictName === d.district
                ? 'bg-cyan-500 text-navy-950 font-bold border-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span>{d.district}</span>
          </button>
        ))}
      </div>

      {/* Main District Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Scorecard (7 cols) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 text-[11px] text-cyan-400 font-medium mb-1">
                <MapPin className="w-3 h-3" />
                {currentDistrict.coastal_zone}
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                {currentDistrict.district} District
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Coords: [{currentDistrict.lat}° N, {currentDistrict.lng}° E] • {currentDistrict.records_count} Records
              </p>
            </div>

            {/* Risk Tier Badge */}
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Risk Classification
              </span>
              <div
                className="mt-1 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5"
                style={{
                  backgroundColor: `${currentDistrict.color}20`,
                  borderColor: `${currentDistrict.color}60`,
                  color: currentDistrict.color
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentDistrict.color }}
                />
                {currentDistrict.risk_category} Risk ({currentDistrict.avg_risk_score}/100)
              </div>
            </div>
          </div>

          {/* District Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Avg Flood Risk</span>
              <span className="text-xl font-bold text-amber-400">{currentDistrict.avg_risk_score}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-sans">
                Range: {currentDistrict.min_risk_score} - {currentDistrict.max_risk_score}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Avg Rainfall</span>
              <span className="text-xl font-bold text-sky-400">{currentDistrict.avg_rainfall_mm}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-sans">mm precipitation</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Avg River Level</span>
              <span className="text-xl font-bold text-indigo-400">{currentDistrict.avg_river_level_m}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-sans">meters gauge height</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Soil Permeability</span>
              <span className="text-xl font-bold text-teal-400">{currentDistrict.avg_soil_permeability_mm_hr}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-sans">mm/hr absorption</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Max Historic Risk</span>
              <span className="text-xl font-bold text-rose-400">{currentDistrict.max_risk_score}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-sans">peak monsoonal surge</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Min Historic Risk</span>
              <span className="text-xl font-bold text-emerald-400">{currentDistrict.min_risk_score}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-sans">dry season trough</span>
            </div>
          </div>

          {/* Regional Vulnerability Factors */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Regional Disaster Vulnerability Profile
            </h4>
            {currentDistrict.coastal_zone.includes('Delta') ? (
              <p>
                <strong>Deltaic Basin Topography:</strong> Sits within major distributary channels (Godavari/Krishna). Flat alluvial topography and low soil infiltration increase vulnerability to simultaneous upstream discharge and tidal surges.
              </p>
            ) : currentDistrict.coastal_zone.includes('North') ? (
              <p>
                <strong>North Coastal Zone:</strong> High cyclonic precipitation frequency from Bay of Bengal depressions. Undulating terrain leads to flash runoff down river basins like Nagavali and Vamsadhara.
              </p>
            ) : (
              <p>
                <strong>South Coastal Zone:</strong> Subject to severe North-East monsoon surges and riverine swelling (Pennar/Gundlakamma). Groundwater recharge varies with sandy coastal plains.
              </p>
            )}
          </div>
        </div>

        {/* Radar Comparison Chart (5 cols) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Multi-Factor Radar Benchmark
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              {currentDistrict.district} vs Andhra Pradesh State Coastal Mean
            </p>

            <div className="h-72">
              <PlotlyChart
                data={radarData}
                layout={{
                  polar: {
                    radialaxis: { visible: true, range: [0, 80], tickfont: { size: 9, color: '#64748b' } },
                    angularaxis: { tickfont: { size: 10, color: '#94a3b8' } },
                    bgcolor: 'transparent'
                  },
                  showlegend: true,
                  legend: { orientation: 'h', y: -0.15, x: 0 },
                  margin: { t: 20, b: 40, l: 30, r: 30 }
                }}
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Radar axes scaled proportionally to normalize precipitation and hydraulic heads for visual benchmark comparison.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
