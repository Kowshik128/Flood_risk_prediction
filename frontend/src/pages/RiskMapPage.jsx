import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Map as MapIcon,
  Layers,
  MapPin,
  AlertTriangle,
  Info,
  CloudRain,
  Waves,
  Droplet,
  Gauge,
  Compass,
  ChevronRight
} from 'lucide-react';
import api from '../api';

// Helper component to smoothly center/fly to coordinates
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function RiskMapPage() {
  const [mapData, setMapData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [mapFocus, setMapFocus] = useState({ center: [16.2, 81.2], zoom: 7 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMapData();
  }, []);

  async function loadMapData() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMapData();
      setMapData(res);
      if (res.districts?.length > 0) {
        setSelectedDistrict(res.districts[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load geospatial map data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Rendering OpenStreetMap tiles and verified AP geospatial coordinates...</p>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800 text-rose-200">
        <h3 className="font-bold">Geospatial Data Error</h3>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadMapData} className="mt-3 px-3 py-1.5 bg-rose-700 rounded-lg text-xs">
          Retry
        </button>
      </div>
    );
  }

  const allDistricts = mapData.districts || [];
  const filteredDistricts = selectedCategory === 'all'
    ? allDistricts
    : allDistricts.filter(d => d.risk_category.toLowerCase() === selectedCategory.toLowerCase());

  // Custom marker icon creation with custom HTML pin
  function createCustomMarker(district) {
    const isHighOrVeryHigh = district.avg_risk_score > 60;
    const pulseClass = isHighOrVeryHigh ? 'animate-ping' : '';
    const color = district.color;

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          ${isHighOrVeryHigh ? `<div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${color}; opacity: 0.4;" class="${pulseClass}"></div>` : ''}
          <div style="position: relative; width: 28px; height: 28px; border-radius: 9999px; background-color: #071120; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <div style="width: 10px; height: 10px; border-radius: 9999px; background-color: ${color};"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  }

  function handleDistrictSelect(district) {
    setSelectedDistrict(district);
    setMapFocus({ center: [district.lat, district.lng], zoom: 9 });
  }

  return (
    <div className="space-y-6">
      {/* Title & Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-cyan-400" />
            Interactive Geospatial Risk Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            OpenStreetMap GIS layer • Verified Andhra Pradesh coastal administrative centroids
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          {['all', 'Low', 'Moderate', 'High', 'Very High'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-navy-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Districts' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + District Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Map (8 cols) */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden lg:col-span-8 h-[550px] relative">
          <MapContainer
            center={mapFocus.center}
            zoom={mapFocus.zoom}
            scrollWheelZoom={true}
            className="w-full h-full z-10"
          >
            <MapController center={mapFocus.center} zoom={mapFocus.zoom} />

            {/* Standard OpenStreetMap tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Pulsing circle and markers */}
            {filteredDistricts.map((d) => (
              <React.Fragment key={d.district}>
                <CircleMarker
                  center={[d.lat, d.lng]}
                  radius={d.avg_risk_score > 60 ? 22 : 14}
                  pathOptions={{
                    color: d.color,
                    fillColor: d.color,
                    fillOpacity: 0.18,
                    weight: 1.5
                  }}
                />
                <Marker
                  position={[d.lat, d.lng]}
                  icon={createCustomMarker(d)}
                  eventHandlers={{
                    click: () => setSelectedDistrict(d)
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2">
                        <span className="font-bold text-sm text-white">{d.district}</span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${d.color}25`, color: d.color }}
                        >
                          {d.risk_category}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-slate-300">
                          <span className="font-sans text-slate-400">Mean Flood Risk:</span>
                          <span className="font-bold text-amber-400">{d.avg_risk_score}/100</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="font-sans text-slate-400">Avg Rainfall:</span>
                          <span className="text-sky-300">{d.avg_rainfall_mm} mm</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="font-sans text-slate-400">River Gauge:</span>
                          <span className="text-indigo-300">{d.avg_river_level_m} m</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="font-sans text-slate-400">Soil Permeability:</span>
                          <span className="text-teal-300">{d.avg_soil_permeability_mm_hr} mm/hr</span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 font-sans">
                        Coastal Zone: <span className="text-slate-200">{d.coastal_zone}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>

          {/* Map Overlay Badge */}
          <div className="absolute top-4 right-4 z-20 pointer-events-none bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Bay of Bengal Littoral Corridor</span>
          </div>
        </div>

        {/* Sidebar District List & Active Inspector (4 cols) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 lg:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">
              District Surveillance Telemetry
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Click a district below to fly to its geographic position
            </p>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredDistricts.map((d) => {
                const isSelected = selectedDistrict?.district === d.district;
                return (
                  <button
                    key={d.district}
                    onClick={() => handleDistrictSelect(d)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition border flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: d.color }}
                      />
                      <div>
                        <span className="font-semibold block">{d.district}</span>
                        <span className="text-[10px] text-slate-400 block">{d.coastal_zone}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-white block">{d.avg_risk_score}</span>
                      <span
                        className="text-[9px] uppercase font-bold"
                        style={{ color: d.color }}
                      >
                        {d.risk_category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mandatory Project Disclaimer Alert */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-[11px] leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Classification Disclaimer:</strong> Project-defined categories for analytical visualization, NOT official government thresholds.
            </div>
          </div>
        </div>
      </div>

      {/* Map Legend Row */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <div>
            <span className="font-bold text-emerald-300 block">Low (0–30)</span>
            <span className="text-[10px] text-slate-400">Normal tidal & surface drainage</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-950/30 border border-amber-800/40">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <div>
            <span className="font-bold text-amber-300 block">Moderate (31–60)</span>
            <span className="text-[10px] text-slate-400">Elevated river stages observed</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-orange-950/30 border border-orange-800/40">
          <span className="w-3 h-3 rounded-full bg-orange-400" />
          <div>
            <span className="font-bold text-orange-300 block">High (61–80)</span>
            <span className="text-[10px] text-slate-400">River channels near capacity</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-rose-950/30 border border-rose-800/40">
          <span className="w-3 h-3 rounded-full bg-rose-400 animate-pulse" />
          <div>
            <span className="font-bold text-rose-300 block">Very High (81–100)</span>
            <span className="text-[10px] text-slate-400">Severe overtopping & delta surge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
