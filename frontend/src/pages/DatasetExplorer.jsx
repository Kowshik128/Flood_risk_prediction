import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Table as TableIcon
} from 'lucide-react';
import api from '../api';

export default function DatasetExplorer() {
  const [dataResponse, setDataResponse] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('Flood_Risk_Score');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedDistrict]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDataset({ district: selectedDistrict, limit: 500 });
      setDataResponse(res);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to fetch dataset');
    } finally {
      setLoading(false);
    }
  }

  const allRecords = dataResponse?.records || [];
  const summary = dataResponse?.summary_statistics || {};

  // Client-side filtering & sorting
  const filteredAndSortedRecords = useMemo(() => {
    let result = [...allRecords];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.District.toLowerCase().includes(q) ||
          r.Rainfall_mm.toString().includes(q) ||
          r.River_Level_m.toString().includes(q) ||
          r.Soil_Permeability_mm_hr.toString().includes(q) ||
          r.Flood_Risk_Score.toString().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [allRecords, searchTerm, sortField, sortOrder]);

  // Pagination calculation
  const totalRecordsCount = filteredAndSortedRecords.length;
  const totalPages = Math.ceil(totalRecordsCount / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRecords.slice(start, start + pageSize);
  }, [filteredAndSortedRecords, currentPage, pageSize]);

  function handleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }

  function getRiskBadge(score) {
    if (score <= 30) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">Low</span>;
    } else if (score <= 60) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/40">Moderate</span>;
    } else if (score <= 80) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-950/60 text-orange-400 border border-orange-800/40">High</span>;
    } else {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/40">Very High</span>;
    }
  }

  function exportCSV() {
    if (!filteredAndSortedRecords.length) return;
    const headers = ['District', 'Rainfall_mm', 'River_Level_m', 'Soil_Permeability_mm_hr', 'Flood_Risk_Score'];
    const rows = filteredAndSortedRecords.map(r => [
      r.District,
      r.Rainfall_mm,
      r.River_Level_m,
      r.Soil_Permeability_mm_hr,
      r.Flood_Risk_Score
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ap_flood_dataset_filtered_${selectedDistrict}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const districtsList = [
    'all',
    'Guntur',
    'East Godavari',
    'Prakasam',
    'West Godavari',
    'Visakhapatnam',
    'Krishna',
    'Vizianagaram',
    'Srikakulam',
    'Nellore'
  ];

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Dataset Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real data telemetry from <span className="font-mono text-cyan-300">ap_flood_dataset.csv</span> (500 records)
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-800/40 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Filtered CSV
        </button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'Rainfall_mm', label: 'Rainfall (mm)', unit: 'mm', color: 'text-sky-400' },
          { key: 'River_Level_m', label: 'River Level (m)', unit: 'm', color: 'text-indigo-400' },
          { key: 'Soil_Permeability_mm_hr', label: 'Soil Permeability (mm/hr)', unit: 'mm/hr', color: 'text-teal-400' },
          { key: 'Flood_Risk_Score', label: 'Flood Risk Score (0-100)', unit: 'pts', color: 'text-amber-400' },
        ].map((item) => {
          const stat = summary[item.key] || {};
          return (
            <div key={item.key} className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>{item.label}</span>
                <span className={`text-xs font-mono font-bold ${item.color}`}>
                  μ = {stat.mean || '-'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Min</span>
                  <span className="text-slate-200">{stat.min || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Median</span>
                  <span className="text-slate-200">{stat.median || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Max</span>
                  <span className="text-slate-200">{stat.max || '-'}</span>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                <span>Std Dev: {stat.std || '-'}</span>
                <span>IQR: {stat.q75 && stat.q25 ? (stat.q75 - stat.q25).toFixed(1) : '-'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* District Filter Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">District:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full md:w-48 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {districtsList.map((d) => (
              <option key={d} value={d}>
                {d === 'all' ? 'All Districts (9)' : d}
              </option>
            ))}
          </select>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search records..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Page size select */}
        <div className="flex items-center gap-2 text-xs text-slate-400 self-end md:self-auto">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071120] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th
                  onClick={() => handleSort('District')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    District
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Rainfall_mm')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    Rainfall (mm)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('River_Level_m')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    River Level (m)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Soil_Permeability_mm_hr')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    Soil Perm. (mm/hr)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Flood_Risk_Score')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    Risk Score (0-100)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Loading records from ap_flood_dataset.csv...</div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((row, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={globalIdx}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">{globalIdx}</td>
                      <td className="py-2.5 px-4 text-slate-200 font-sans font-medium">{row.District}</td>
                      <td className="py-2.5 px-4 text-sky-300">{Number(row.Rainfall_mm).toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-indigo-300">{Number(row.River_Level_m).toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-teal-300">{Number(row.Soil_Permeability_mm_hr).toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-white font-bold">{Number(row.Flood_Risk_Score).toFixed(2)}</td>
                      <td className="py-2.5 px-4">{getRiskBadge(row.Flood_Risk_Score)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#071120] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing{' '}
            <span className="text-white font-medium">
              {totalRecordsCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="text-white font-medium">
              {Math.min(currentPage * pageSize, totalRecordsCount)}
            </span>{' '}
            of <span className="text-white font-medium">{totalRecordsCount}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono text-slate-300">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
