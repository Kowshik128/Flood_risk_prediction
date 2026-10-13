# AP Flood Risk Prediction & Analytics System

An enterprise disaster-management analytics and decision support platform engineered for the **Andhra Pradesh Disaster Management Authority (APDMA)**. Powered by **Exploratory Data Analysis (EDA)**, **Statistical Correlation Matrices**, and **Multiple Linear Regression (OLS)**, this system continuously models flood risks across the 9 vulnerable coastal districts of Andhra Pradesh.

Aligned with the **JNTUK 2nd-Year Curriculum** (EDA Units 1 & 2 | Statistical Methods Unit 2).

---

## 🏛️ System Features

1. **Executive Dashboard**: Dynamic KPI scorecards (Total Records, Monitored Districts, Average Rainfall, River Level, Soil Permeability, Average Flood Risk), risk distribution donut chart, district risk ranking, and emergency alerts.
2. **Dataset Explorer**: Searchable, filterable, sortable telemetry table with 500 authentic records from `ap_flood_dataset.csv`, 5-number summary statistics, and CSV export.
3. **Exploratory Data Analysis (EDA)**: Univariate frequency histograms with 15 metric bins, five-number boxplots for outlier discovery, bivariate feature-vs-risk scatter plots, and multi-metric district comparisons.
4. **Statistical Correlation Analysis**: $4 \times 4$ Pearson Product-Moment correlation ($r$) heatmap, covariance indices, and multicollinearity diagnosis confirming Ordinary Least Squares (OLS) estimator stability.
5. **Multiple Linear Regression (OLS)**: Dynamic 80/20 train-test partition (`random_state=42`) with real model metrics:
   - **MAE**: 3.471
   - **MSE**: 18.077
   - **RMSE**: 4.252
   - **R² Score**: 0.9542 (95.42% variance explained)
   - Actual vs Predicted test plot with ideal $y=x$ reference line and residual diagnostic plots.
6. **Flood Risk Prediction Calculator**: Real-time inferencing with sliders and numeric controls for Rainfall ($X_1$), River Level ($X_2$), and Soil Permeability ($X_3$). Returns score out of 100, project risk category badge, exact mathematical contribution decomposition, and operational safety advisories.
7. **District Hydraulic Analysis**: Granular vulnerability profiles and multi-factor radar benchmarks for all 9 coastal districts against state averages.
8. **Interactive Geospatial Risk Map**: React-Leaflet GIS layer with OpenStreetMap, verified Andhra Pradesh coordinates, pulsing hazard halos, and detailed popup telemetry.
9. **Methodology & Viva Voce Guide**: Academic syllabus mapping, APDMA operational context, mathematical formulation derivations, and defense Q&A.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Data Visualization**: Plotly.js (`plotly.js-dist-min`)
- **Geospatial Mapping**: React-Leaflet & OpenStreetMap
- **Backend API**: Python 3, FastAPI, Uvicorn, Pydantic
- **Machine Learning**: Scikit-learn (Ordinary Least Squares `LinearRegression`), Pandas, NumPy, Joblib

---

## 📊 Project Risk Classification

| Risk Level | Score Range | Indicated Action |
| :--- | :--- | :--- |
| **Low** | 0 – 30 | Baseline monitoring; surface runoff within safe absorption capacities. |
| **Moderate** | 31 – 60 | Heightened watch; elevated river stages and reduced aquifer drainage. |
| **High** | 61 – 80 | Critical alert; river channels approaching capacity; mobilize flood gates. |
| **Very High** | 81 – 100 | Emergency crisis; severe overtopping expected; initiate evacuation alerts. |

> **⚠️ Mandatory Disclosure:** These are project-defined categories for analytical visualization, NOT official government thresholds.

---

## 🚀 Running the Project Locally

### 1. Backend Service
```bash
cd backend
uvicorn main:app --reload
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 📂 Project Structure

```
flood-risk-prediction/
├── backend/
│   ├── main.py
│   ├── data/
│   │   └── ap_flood_dataset.csv
│   ├── models/
│   │   └── flood_linear_model.joblib
│   └── services/
│       ├── data_service.py
│       ├── ml_service.py
│       └── geo_service.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── PlotlyChart.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DatasetExplorer.jsx
│   │   │   ├── EDAPage.jsx
│   │   │   ├── CorrelationPage.jsx
│   │   │   ├── RegressionPage.jsx
│   │   │   ├── PredictionPage.jsx
│   │   │   ├── DistrictAnalysisPage.jsx
│   │   │   ├── RiskMapPage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── README.md
└── .gitignore
```
