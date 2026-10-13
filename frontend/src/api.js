// API Client for AP Flood Risk Prediction & Analytics System

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Key Performance Indicators
  getKPI: () => request('/kpi'),

  // Raw dataset with filtering and pagination
  getDataset: (params = {}) => {
    const query = new URLSearchParams();
    if (params.district) query.set('district', params.district);
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/dataset${queryString}`);
  },

  // Exploratory Data Analysis metrics
  getEDA: () => request('/eda'),

  // Correlation matrix
  getCorrelation: () => request('/correlation'),

  // Multiple Linear Regression metrics & actual-vs-pred
  getRegression: () => request('/regression'),

  // Real ML Prediction
  predictRisk: (data) => request('/predict', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // District statistics
  getDistricts: () => request('/districts'),

  // Verified coordinates and metrics for the Leaflet map
  getMapData: () => request('/map-data'),

  // About and methodology metadata
  getAbout: () => request('/about'),
};

export default api;
