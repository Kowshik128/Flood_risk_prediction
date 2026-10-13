import pandas as pd
from .data_service import get_raw_dataframe

# Authenticated geographical coordinates (Latitude, Longitude) for Andhra Pradesh Coastal Districts
# Sourced from official state administrative centers
VERIFIED_DISTRICT_COORDINATES = {
    "Srikakulam": {"lat": 18.3164, "lng": 83.8943, "coastal_zone": "North Coastal AP"},
    "Vizianagaram": {"lat": 18.1167, "lng": 83.4167, "coastal_zone": "North Coastal AP"},
    "Visakhapatnam": {"lat": 17.6868, "lng": 83.2185, "coastal_zone": "North Coastal AP"},
    "East Godavari": {"lat": 16.9891, "lng": 82.2475, "coastal_zone": "Godavari Delta"},
    "West Godavari": {"lat": 16.7107, "lng": 81.1300, "coastal_zone": "Godavari Delta"},
    "Krishna": {"lat": 16.1955, "lng": 81.1340, "coastal_zone": "Krishna Delta"},
    "Guntur": {"lat": 16.3067, "lng": 80.4365, "coastal_zone": "Central Coastal AP"},
    "Prakasam": {"lat": 15.5057, "lng": 80.0499, "coastal_zone": "South Coastal AP"},
    "Nellore": {"lat": 14.4426, "lng": 79.9865, "coastal_zone": "South Coastal AP"}
}

def get_map_district_data():
    """Aggregate actual dataset values for each district combined with verified geographic coordinates."""
    df = get_raw_dataframe()
    grouped = df.groupby("District").agg(
        avg_rainfall=("Rainfall_mm", "mean"),
        avg_river_level=("River_Level_m", "mean"),
        avg_soil_permeability=("Soil_Permeability_mm_hr", "mean"),
        avg_risk_score=("Flood_Risk_Score", "mean"),
        max_risk_score=("Flood_Risk_Score", "max"),
        min_risk_score=("Flood_Risk_Score", "min"),
        records_count=("Flood_Risk_Score", "count")
    ).reset_index()

    def get_category_and_color(score):
        if score <= 30:
            return "Low", "#10B981"
        elif score <= 60:
            return "Moderate", "#F59E0B"
        elif score <= 80:
            return "High", "#F97316"
        else:
            return "Very High", "#EF4444"

    features = []
    for _, row in grouped.iterrows():
        name = row["District"]
        coords = VERIFIED_DISTRICT_COORDINATES.get(name, {"lat": 16.0, "lng": 80.5, "coastal_zone": "Coastal AP"})
        score = float(row["avg_risk_score"])
        cat, color = get_category_and_color(score)

        features.append({
            "district": name,
            "lat": coords["lat"],
            "lng": coords["lng"],
            "coastal_zone": coords["coastal_zone"],
            "avg_risk_score": round(score, 2),
            "avg_rainfall_mm": round(float(row["avg_rainfall"]), 2),
            "avg_river_level_m": round(float(row["avg_river_level"]), 2),
            "avg_soil_permeability_mm_hr": round(float(row["avg_soil_permeability"]), 2),
            "max_risk_score": round(float(row["max_risk_score"]), 2),
            "min_risk_score": round(float(row["min_risk_score"]), 2),
            "records_count": int(row["records_count"]),
            "risk_category": cat,
            "color": color
        })

    # Sort by risk score descending
    features.sort(key=lambda x: x["avg_risk_score"], reverse=True)

    return {
        "center": {"lat": 16.2, "lng": 81.2},
        "default_zoom": 7,
        "state": "Andhra Pradesh",
        "districts": features,
        "disclaimer": "Project-defined categories for analytical visualization, NOT official government thresholds."
    }
