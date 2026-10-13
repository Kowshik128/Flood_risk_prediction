import os
import pandas as pd
import numpy as np

# Path to the real dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "ap_flood_dataset.csv")

def get_raw_dataframe() -> pd.DataFrame:
    """Load the authentic Andhra Pradesh flood dataset."""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    return df

def get_kpis():
    """Calculate overall Key Performance Indicators from real data."""
    df = get_raw_dataframe()
    total_records = len(df)
    unique_districts = df["District"].nunique()
    avg_rainfall = float(df["Rainfall_mm"].mean())
    avg_river_level = float(df["River_Level_m"].mean())
    avg_soil_permeability = float(df["Soil_Permeability_mm_hr"].mean())
    avg_risk_score = float(df["Flood_Risk_Score"].mean())

    # Risk category distribution in the dataset
    def categorize(score):
        if score <= 30:
            return "Low"
        elif score <= 60:
            return "Moderate"
        elif score <= 80:
            return "High"
        else:
            return "Very High"

    categories = df["Flood_Risk_Score"].apply(categorize).value_counts().to_dict()
    category_counts = {
        "Low": int(categories.get("Low", 0)),
        "Moderate": int(categories.get("Moderate", 0)),
        "High": int(categories.get("High", 0)),
        "Very High": int(categories.get("Very High", 0)),
    }

    return {
        "total_records": total_records,
        "unique_districts": unique_districts,
        "avg_rainfall": round(avg_rainfall, 2),
        "avg_river_level": round(avg_river_level, 2),
        "avg_soil_permeability": round(avg_soil_permeability, 2),
        "avg_risk_score": round(avg_risk_score, 2),
        "min_risk_score": round(float(df["Flood_Risk_Score"].min()), 2),
        "max_risk_score": round(float(df["Flood_Risk_Score"].max()), 2),
        "risk_distribution": category_counts,
        "districts_list": sorted(df["District"].unique().tolist())
    }

def get_dataset_records(district: str = None, limit: int = 500, offset: int = 0):
    """Retrieve dataset records with optional district filter and pagination."""
    df = get_raw_dataframe()
    if district and district.strip().lower() != "all":
        df = df[df["District"].str.lower() == district.strip().lower()]
    
    total_filtered = len(df)
    subset = df.iloc[offset : offset + limit]
    records = subset.to_dict(orient="records")
    
    # Calculate summary statistics for numeric columns
    numeric_cols = ["Rainfall_mm", "River_Level_m", "Soil_Permeability_mm_hr", "Flood_Risk_Score"]
    summary = {}
    for col in numeric_cols:
        summary[col] = {
            "mean": round(float(df[col].mean()), 2),
            "std": round(float(df[col].std()), 2),
            "min": round(float(df[col].min()), 2),
            "q25": round(float(df[col].quantile(0.25)), 2),
            "median": round(float(df[col].median()), 2),
            "q75": round(float(df[col].quantile(0.75)), 2),
            "max": round(float(df[col].max()), 2),
        }

    return {
        "total_count": total_filtered,
        "limit": limit,
        "offset": offset,
        "records": records,
        "summary_statistics": summary,
        "columns": df.columns.tolist()
    }

def get_eda_data():
    """Compute Exploratory Data Analysis metrics including distributions and relationships."""
    df = get_raw_dataframe()
    numeric_cols = ["Rainfall_mm", "River_Level_m", "Soil_Permeability_mm_hr", "Flood_Risk_Score"]
    
    # 1. Distributions (Histograms + Basic KDE estimate)
    distributions = {}
    for col in numeric_cols:
        values = df[col].values
        hist, bin_edges = np.histogram(values, bins=15)
        bin_labels = [f"{round(bin_edges[i], 1)}-{round(bin_edges[i+1], 1)}" for i in range(len(bin_edges)-1)]
        
        # Quantiles for boxplot
        q1 = float(np.percentile(values, 25))
        median = float(np.median(values))
        q3 = float(np.percentile(values, 75))
        iqr = q3 - q1
        lower_bound = float(max(np.min(values), q1 - 1.5 * iqr))
        upper_bound = float(min(np.max(values), q3 + 1.5 * iqr))
        outliers = [float(v) for v in values if v < lower_bound or v > upper_bound]

        distributions[col] = {
            "counts": [int(c) for c in hist],
            "bins": [round(float(b), 2) for b in bin_edges],
            "bin_labels": bin_labels,
            "boxplot": {
                "min": round(float(np.min(values)), 2),
                "lower_bound": round(lower_bound, 2),
                "q1": round(q1, 2),
                "median": round(median, 2),
                "q3": round(q3, 2),
                "upper_bound": round(upper_bound, 2),
                "max": round(float(np.max(values)), 2),
                "outliers": [round(o, 2) for o in outliers[:10]]
            }
        }

    # 2. District Comparison
    district_grouped = df.groupby("District").agg(
        avg_rainfall=("Rainfall_mm", "mean"),
        avg_river_level=("River_Level_m", "mean"),
        avg_soil_permeability=("Soil_Permeability_mm_hr", "mean"),
        avg_risk_score=("Flood_Risk_Score", "mean"),
        max_risk_score=("Flood_Risk_Score", "max"),
        min_risk_score=("Flood_Risk_Score", "min"),
        records_count=("Flood_Risk_Score", "count")
    ).reset_index()

    district_comparison = []
    for _, row in district_grouped.iterrows():
        district_comparison.append({
            "district": row["District"],
            "avg_rainfall": round(float(row["avg_rainfall"]), 2),
            "avg_river_level": round(float(row["avg_river_level"]), 2),
            "avg_soil_permeability": round(float(row["avg_soil_permeability"]), 2),
            "avg_risk_score": round(float(row["avg_risk_score"]), 2),
            "max_risk_score": round(float(row["max_risk_score"]), 2),
            "min_risk_score": round(float(row["min_risk_score"]), 2),
            "records_count": int(row["records_count"])
        })
    # Sort district comparison by average risk score descending
    district_comparison.sort(key=lambda x: x["avg_risk_score"], reverse=True)

    # 3. Scatter plot data points (subsampled if needed, 500 rows is very lightweight)
    scatter_data = {
        "rainfall_vs_risk": [
            {"x": round(float(r["Rainfall_mm"]), 2), "y": round(float(r["Flood_Risk_Score"]), 2), "district": r["District"]}
            for _, r in df.iterrows()
        ],
        "river_vs_risk": [
            {"x": round(float(r["River_Level_m"]), 2), "y": round(float(r["Flood_Risk_Score"]), 2), "district": r["District"]}
            for _, r in df.iterrows()
        ],
        "soil_vs_risk": [
            {"x": round(float(r["Soil_Permeability_mm_hr"]), 2), "y": round(float(r["Flood_Risk_Score"]), 2), "district": r["District"]}
            for _, r in df.iterrows()
        ]
    }

    return {
        "distributions": distributions,
        "district_comparison": district_comparison,
        "scatter_data": scatter_data
    }

def get_correlation_data():
    """Compute Pearson correlation matrix and covariances for the numerical variables."""
    df = get_raw_dataframe()
    numeric_cols = ["Rainfall_mm", "River_Level_m", "Soil_Permeability_mm_hr", "Flood_Risk_Score"]
    
    corr_df = df[numeric_cols].corr(method="pearson")
    cov_df = df[numeric_cols].cov()

    matrix = []
    for row_col in numeric_cols:
        row_vals = []
        for col_col in numeric_cols:
            row_vals.append(round(float(corr_df.loc[row_col, col_col]), 4))
        matrix.append(row_vals)

    # Flattened pairs for analysis
    pairs = []
    for i in range(len(numeric_cols)):
        for j in range(i + 1, len(numeric_cols)):
            col1 = numeric_cols[i]
            col2 = numeric_cols[j]
            r = float(corr_df.loc[col1, col2])
            strength = "Strong Positive" if r > 0.6 else ("Moderate Positive" if r > 0.3 else ("Weak Positive" if r > 0 else ("Strong Negative" if r < -0.6 else ("Moderate Negative" if r < -0.3 else "Weak Negative"))))
            pairs.append({
                "feature_1": col1,
                "feature_2": col2,
                "correlation": round(r, 4),
                "covariance": round(float(cov_df.loc[col1, col2]), 4),
                "interpretation": strength
            })

    return {
        "columns": numeric_cols,
        "matrix": matrix,
        "pairs": pairs
    }
