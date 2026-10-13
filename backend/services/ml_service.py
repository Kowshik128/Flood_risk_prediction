import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "ap_flood_dataset.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "flood_linear_model.joblib")

FEATURES = ["Rainfall_mm", "River_Level_m", "Soil_Permeability_mm_hr"]
TARGET = "Flood_Risk_Score"

class FloodModelManager:
    def __init__(self):
        self.model = None
        self.metrics = None
        self.test_data = None
        self._ensure_trained_and_loaded()

    def _ensure_trained_and_loaded(self):
        """Train or load the Multiple Linear Regression model."""
        os.makedirs(MODEL_DIR, exist_ok=True)
        self.train_and_save()

    def train_and_save(self):
        """Perform 80/20 train-test split (random_state=42), fit OLS, calculate dynamic metrics, save with joblib."""
        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

        df = pd.read_csv(DATA_PATH)
        X = df[FEATURES]
        y = df[TARGET]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42
        )

        model = LinearRegression()
        model.fit(X_train, y_train)

        # Dynamic metric calculations on the test set
        y_pred = model.predict(X_test)
        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, y_pred))

        # Save model with joblib
        joblib.dump(model, MODEL_PATH)
        self.model = model

        # Coefficients dict
        coefficients = {
            "Rainfall_mm": round(float(model.coef_[0]), 4),
            "River_Level_m": round(float(model.coef_[1]), 4),
            "Soil_Permeability_mm_hr": round(float(model.coef_[2]), 4),
        }

        # Store test predictions for residual and actual-vs-predicted plots
        test_samples = []
        residuals = []
        for actual, pred, (_, x_row) in zip(y_test.values, y_pred, X_test.iterrows()):
            res = float(actual - pred)
            test_samples.append({
                "actual": round(float(actual), 2),
                "predicted": round(float(pred), 2),
                "residual": round(res, 2),
                "rainfall": round(float(x_row["Rainfall_mm"]), 2),
                "river_level": round(float(x_row["River_Level_m"]), 2),
                "soil_permeability": round(float(x_row["Soil_Permeability_mm_hr"]), 2)
            })
            residuals.append(res)

        self.metrics = {
            "mae": round(mae, 4),
            "mse": round(mse, 4),
            "rmse": round(rmse, 4),
            "r2": round(r2, 4),
            "intercept": round(float(model.intercept_), 4),
            "coefficients": coefficients,
            "train_samples_count": len(X_train),
            "test_samples_count": len(X_test),
            "features": FEATURES,
            "target": TARGET,
            "formula_string": f"Flood Risk Score = {round(float(model.intercept_), 2)} + ({round(float(model.coef_[0]), 3)} × Rainfall) + ({round(float(model.coef_[1]), 3)} × River Level) + ({round(float(model.coef_[2]), 3)} × Soil Permeability)"
        }

        self.test_data = {
            "test_predictions": test_samples,
            "mean_residual": round(float(np.mean(residuals)), 4),
            "std_residual": round(float(np.std(residuals)), 4)
        }

        return self.metrics

    def get_regression_info(self):
        """Retrieve model training metrics, equations, and evaluation points."""
        if self.metrics is None or self.model is None:
            self._ensure_trained_and_loaded()
        return {
            "metrics": self.metrics,
            "evaluation_plots": self.test_data
        }

    def predict(self, rainfall: float, river_level: float, soil_permeability: float):
        """Predict Flood Risk Score based on environmental features."""
        if self.model is None:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
            else:
                self.train_and_save()

        # Input dataframe with feature names for model prediction
        input_df = pd.DataFrame(
            [[rainfall, river_level, soil_permeability]],
            columns=FEATURES
        )
        raw_prediction = float(self.model.predict(input_df)[0])
        # Scaled strictly to [0, 100]
        clipped_score = float(np.clip(raw_prediction, 0.0, 100.0))

        # Categorization based on project guidelines:
        # 0–30 Low, 31–60 Moderate, 61–80 High, 81–100 Very High
        if clipped_score <= 30:
            category = "Low"
            color = "#10B981" # Emerald
            severity_level = 1
            advisory = "Normal conditions. Surface runoff is within safe absorption levels. Routine surveillance recommended."
        elif clipped_score <= 60:
            category = "Moderate"
            color = "#F59E0B" # Amber
            severity_level = 2
            advisory = "Elevated hydraulic pressure. Increased river bank discharge risk. Activate precautionary regional monitoring."
        elif clipped_score <= 80:
            category = "High"
            color = "#F97316" # Orange
            severity_level = 3
            advisory = "Critical flood alert. River channels approaching capacity with reduced ground absorption. Mobilize disaster relief and flood gate barriers."
        else:
            category = "Very High"
            color = "#EF4444" # Red
            severity_level = 4
            advisory = "Catastrophic flood danger. Massive overtopping expected. Issue immediate public evacuation warnings in low-lying zones."

        # Factor contributions breakdown
        b0 = float(self.model.intercept_)
        b1_contrib = float(self.model.coef_[0] * rainfall)
        b2_contrib = float(self.model.coef_[1] * river_level)
        b3_contrib = float(self.model.coef_[2] * soil_permeability)

        contributions = [
            {"factor": "Baseline Intercept (β₀)", "value": round(b0, 2), "description": "Baseline regional constant"},
            {"factor": "Rainfall Volume (β₁·X₁)", "value": round(b1_contrib, 2), "description": f"+{round(float(self.model.coef_[0]), 3)} pts per mm"},
            {"factor": "River Level Depth (β₂·X₂)", "value": round(b2_contrib, 2), "description": f"+{round(float(self.model.coef_[1]), 3)} pts per m"},
            {"factor": "Soil Permeability Absorption (β₃·X₃)", "value": round(b3_contrib, 2), "description": f"{round(float(self.model.coef_[2]), 3)} pts per mm/hr (Mitigation factor)"}
        ]

        return {
            "predicted_score": round(clipped_score, 2),
            "raw_score": round(raw_prediction, 2),
            "category": category,
            "category_color": color,
            "severity_level": severity_level,
            "advisory": advisory,
            "disclaimer": "Project-defined categories for analytical visualization, NOT official government thresholds.",
            "contributions": contributions,
            "inputs": {
                "Rainfall_mm": round(rainfall, 2),
                "River_Level_m": round(river_level, 2),
                "Soil_Permeability_mm_hr": round(soil_permeability, 2)
            }
        }

# Global singleton
ml_manager = FloodModelManager()
