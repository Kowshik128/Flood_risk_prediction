import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.data_service import (
    get_kpis,
    get_dataset_records,
    get_eda_data,
    get_correlation_data,
)
from services.ml_service import ml_manager
from services.geo_service import get_map_district_data

app = FastAPI(
    title="AP Flood Risk Prediction & Analytics System API",
    description="Backend API powering the Andhra Pradesh coastal disaster management and multiple linear regression analytics pipeline.",
    version="1.0.0"
)

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    rainfall_mm: float = Field(..., ge=0.0, le=1000.0, description="Precipitation volume in millimeters (mm)")
    river_level_m: float = Field(..., ge=0.0, le=50.0, description="Hydraulic river gauge depth in meters (m)")
    soil_permeability_mm_hr: float = Field(..., ge=0.0, le=50.0, description="Soil absorption rate in mm/hr")

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "AP Flood Risk Prediction & Analytics System",
        "documentation": "/docs",
        "source": "ap_flood_dataset.csv"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "ap-flood-backend"}

@app.get("/api/kpi")
def fetch_kpis():
    try:
        return get_kpis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset")
def fetch_dataset(
    district: str = Query(None, description="Filter by district name or 'all'"),
    limit: int = Query(500, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    try:
        return get_dataset_records(district=district, limit=limit, offset=offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/eda")
def fetch_eda():
    try:
        return get_eda_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/correlation")
def fetch_correlation():
    try:
        return get_correlation_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/regression")
def fetch_regression_metrics():
    try:
        return ml_manager.get_regression_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
def predict_flood_risk(req: PredictionRequest):
    try:
        result = ml_manager.predict(
            rainfall=req.rainfall_mm,
            river_level=req.river_level_m,
            soil_permeability=req.soil_permeability_mm_hr
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/districts")
def fetch_districts():
    try:
        map_data = get_map_district_data()
        return {"districts": map_data["districts"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/map-data")
def fetch_map_data():
    try:
        return get_map_district_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/about")
def fetch_about_metadata():
    return {
        "title": "AP Flood Risk Prediction & Analytics System",
        "target_organization": "Andhra Pradesh Disaster Management Authority (APDMA)",
        "academic_alignment": "JNTUK 2nd-Year Syllabus (EDA Units 1 & 2 | Statistical Methods Unit 2)",
        "tech_stack": {
            "frontend": "React, Vite, Tailwind CSS, Plotly, React-Leaflet",
            "backend": "Python, FastAPI, Uvicorn",
            "ml_engine": "Scikit-learn, Pandas, NumPy, Joblib"
        },
        "model_formulation": {
            "equation": "Y = β₀ + β₁·X₁ + β₂·X₂ + β₃·X₃ + ε",
            "variables": {
                "Y": "Flood Risk Score (Target, 0–100 Scale)",
                "X1": "Rainfall (mm)",
                "X2": "River Level (meters)",
                "X3": "Soil Permeability (mm/hr)"
            },
            "interpretation": {
                "Rainfall": "Positive coefficient (β₁ > 0): Higher monsoonal rainfall increases surface water runoff volume.",
                "River Level": "Positive coefficient (β₂ > 0): Elevated river stages indicate channel saturation, drastically reducing drainage capacity.",
                "Soil Permeability": "Negative coefficient (β₃ < 0): High infiltration percolation into sub-surface aquifers acts as a natural flood buffer."
            }
        },
        "viva_questions": [
            {
                "question": "Why do we perform Exploratory Data Analysis (EDA) prior to regression modeling?",
                "answer": "To profile parameter distributions, identify extreme anomalies/outliers, verify linearity assumptions, and ensure data conforms to Ordinary Least Squares (OLS) estimation prerequisites."
            },
            {
                "question": "Why is the regression coefficient for Soil Permeability negative?",
                "answer": "Because higher soil permeability enhances groundwater absorption and aquifer recharge, suppressing excess surface runoff and naturally decreasing flood risk."
            },
            {
                "question": "How is the Coefficient of Determination (R²) interpreted in this context?",
                "answer": "R² quantifies the proportion of variance in the Flood Risk Score that is predictable from the environmental predictors (Rainfall, River Level, Soil Permeability)."
            },
            {
                "question": "Why use an 80/20 train-test split with random_state=42?",
                "answer": "An 80/20 partition ensures adequate historical data for parameter training while reserving a representative 20% unseen test set for unbiased validation of MAE, MSE, RMSE, and R² scores, with deterministic reproducibility via random_state=42."
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
