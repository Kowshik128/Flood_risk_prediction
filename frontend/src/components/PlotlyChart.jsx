import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

export default function PlotlyChart({
  data = [],
  layout = {},
  config = {},
  className = "w-full h-80",
  style = {}
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Default dark theme matching environmental command center
    const defaultLayout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: 'Inter, sans-serif',
        color: '#94a3b8',
        size: 12
      },
      margin: { t: 40, r: 24, b: 40, l: 48 },
      xaxis: {
        gridcolor: 'rgba(255, 255, 255, 0.07)',
        zerolinecolor: 'rgba(255, 255, 255, 0.15)',
        tickfont: { color: '#94a3b8' },
        ...(layout.xaxis || {})
      },
      yaxis: {
        gridcolor: 'rgba(255, 255, 255, 0.07)',
        zerolinecolor: 'rgba(255, 255, 255, 0.15)',
        tickfont: { color: '#94a3b8' },
        ...(layout.yaxis || {})
      },
      hoverlabel: {
        bgcolor: '#0a192f',
        bordercolor: '#0284c7',
        font: { family: 'Inter', color: '#f8fafc', size: 12 }
      },
      legend: {
        font: { color: '#cbd5e1' },
        bgcolor: 'transparent',
        ...(layout.legend || {})
      },
      autosize: true,
      ...layout
    };

    const defaultConfig = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'select2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      toImageButtonOptions: {
        format: 'png',
        filename: 'ap_flood_analytics_chart',
        height: 500,
        width: 700,
        scale: 2
      },
      ...config
    };

    Plotly.react(containerRef.current, data, defaultLayout, defaultConfig);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, layout, config]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: '300px', ...style }}
    />
  );
}
