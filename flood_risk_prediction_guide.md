# COMPREHENSIVE PROJECT DOCUMENTATION
## PROJECT: COASTAL FLOOD RISK PREDICTION USING EDA & MULTIPLE REGRESSION

**Target Organization:** Andhra Pradesh Disaster Management Authority (APDMA)  
**Academic Alignment:** JNTUK 2nd-Year Syllabus (EDA Units 1 & 2 | Statistical Methods Unit 2)  
**Tech Stack:** Python, Pandas, Seaborn, Scikit-learn, Folium

---

### SECTION 1: THEORETICAL & ACADEMIC ALIGNMENT

#### 1.1 Syllabus Mapping (JNTUK 2nd Year)
*   **EDA Units 1 & 2:** Focuses on data profiling, descriptive statistics (mean, variance, standard deviation), outlier identification, and univariate/bivariate data distributions.
*   **Statistical Methods Unit 2:** Focuses on covariance, Pearson Product-Moment Correlation ($r$), multicollinearity diagnosis, and Ordinary Least Squares (OLS) Multiple Linear Regression equations.

#### 1.2 Mathematical Formulation
The project utilizes a Multiple Linear Regression model to forecast a continuous Flood Risk Score based on three environmental independent variables:

$$Y = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \beta_3 X_3 + \epsilon$$

Where:
*   $Y$ = **Flood Risk Score** (Dependent Target Variable, Scaled 0 to 100)
*   $X_1$ = **Rainfall** (Independent Variable, mm)
*   $X_2$ = **River Level** (Independent Variable, meters)
*   $X_3$ = **Soil Permeability** (Independent Variable, mm/hr)
*   $\beta_0$ = **Intercept** (Baseline risk when all parameters are zero)
*   $\beta_1, \beta_2, \beta_3$ = **Regression Coefficients** (Weight of each environmental factor)
*   $\epsilon$ = **Residual Error** (Unexplained statistical variance)

---

### SECTION 2: INDUSTRIAL HYPOTHESIS & DATA MATRIX

#### 2.1 Environmental Factor Analysis
1.  **Rainfall ($X_1$):** Direct volumetric input. Higher precipitation increases the risk score linearly ($\beta_1 > 0$).
2.  **River Level ($X_2$):** Baseline saturation check. Elevated levels indicate channels are near maximum capacity, accelerating flood trigger potential ($\beta_2 > 0$).
3.  **Soil Permeability ($X_3$):** Mitigation index. High permeability allows fast water absorption into underground aquifers, suppressing surface runoff. This creates an inverse relationship with risk ($\beta_3 < 0$).

#### 2.2 Regional Scope
The project specifically monitors the 9 traditional coastal districts of Andhra Pradesh:
*   Srikakulam
*   Vizianagaram
*   Visakhapatnam
*   East Godavari
*   West Godavari
*   Krishna
*   Guntur
*   Prakasam
*   Nellore

---

### SECTION 3: THE TECHNICAL PIPELINE WORKFLOW

```
  [ Raw Data Ingestion ] 
            │
            ▼
  [ Phase 1: Exploratory Data Analysis (EDA) ] ──► Summary Stats, Distributions, Outliers
            │
            ▼
  [ Phase 2: Statistical Methods ]              ──► Pearson Heatmaps, Scatter Checking
            │
            ▼
  [ Phase 3: Multiple Regression Modeling ]     ──► Train/Test Split, OLS Fitting, R² Validation
            │
            ▼
  [ Phase 4: Geospatial Model Serving ]         ──► Interactive Folium Dashboard Generation
```

#### Phase 1: Exploratory Data Analysis (EDA)
*   **Descriptive Summaries:** Implementing `.describe()` matrices via Pandas to evaluate variable tendencies.
*   **Distribution Analysis:** Generating skewness and density plots using Seaborn to confirm normalization states.
*   **Outlier Discovery:** Implementing Box Plots to isolate extreme monsoonal anomalies or instrumentation telemetry errors.

#### Phase 2: Statistical Correlation Checking
*   **Pearson Correlation Matrix:** Mapping $r$-values to determine parameter interdependencies and prevent multicollinearity failure states where independent variables mirror each other too tightly.
*   **Bivariate Scatter Analysis:** Verifying linear alignment assumptions before deploying linear modeling blocks.

#### Phase 3: Predictive Regression Modeling
*   **Data Partitioning:** Splitting raw indicators into 80% training subsets and 20% validation subsets.
*   **OLS System Training:** Using Scikit-Learn's `LinearRegression` engine to optimize parameter vectors.
*   **Performance Metrics:** Validation via Mean Squared Error (MSE) and Coefficient of Determination ($R^2$).

#### Phase 4: Geospatial Map Integration
*   Mapping predicted district risk outputs onto geographical coordinates centering on Andhra Pradesh ($15.9129^\circ$ N, $79.7400^\circ$ E) inside an interactive Folium layout.

---

### SECTION 4: PRODUCTION IMPLEMENTATION SOURCE CODE

```python
"""
APDMA Flood Risk Prediction Pipeline
Aligned with JNTUK 2nd-Year Curriculum Specs
"""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import folium

# 1. GENERATE SYNTHETIC DATA REPRESENTING AP COASTAL DISTRICTS
np.random.seed(42)
districts = ['Srikakulam', 'Vizianagaram', 'Visakhapatnam', 'East Godavari', 
             'West Godavari', 'Krishna', 'Guntur', 'Prakasam', 'Nellore']

data_records = []
for dist in districts:
    for month in range(1, 13): # 12 months of monitoring records
        rainfall = np.random.uniform(50, 450) if month in [6,7,8,9,10] else np.random.uniform(5, 80)
        river_level = np.random.uniform(1.5, 6.0) + (rainfall * 0.01)
        soil_perm = np.random.uniform(2.0, 15.0)
        
        # Continuous base target computation (with deterministic logic + structural noise)
        base_risk = (rainfall * 0.15) + (river_level * 8.0) - (soil_perm * 1.2) + np.random.normal(0, 3)
        flood_risk_score = np.clip(base_risk, 0, 100)
        
        data_records.append([dist, month, rainfall, river_level, soil_perm, flood_risk_score])

df = pd.DataFrame(data_records, columns=['District', 'Month', 'Rainfall_mm', 'RiverLevel_m', 'SoilPermeability_mmhr', 'FloodRiskScore'])
df.to_csv('ap_flood_dataset.csv', index=False)
print("✔ Step 1: Synthetic Dataset 'ap_flood_dataset.csv' successfully created.")

# 2. PHASE 1: EXPLORATORY DATA ANALYSIS (EDA Units 1 & 2)
print("\n--- PHASE 1: DATA PROFILE AND SUMMARY STATISTICS ---")
print(df.describe())

# Generate distribution graphs
plt.figure(figsize=(12, 4))
plt.subplot(1, 3, 1)
sns.histplot(df['Rainfall_mm'], kde=True, color='blue')
plt.title('Rainfall Distribution')

plt.subplot(1, 3, 2)
sns.boxplot(y=df['RiverLevel_m'], color='green')
plt.title('River Level Boxplot')

plt.subplot(1, 3, 3)
sns.scatterplot(data=df, x='Rainfall_mm', y='FloodRiskScore', alpha=0.6)
plt.title('Rainfall vs Risk Score')
plt.tight_layout()
plt.savefig('eda_distribution_plots.png')
print("✔ Step 2: EDA visualizations exported to 'eda_distribution_plots.png'")

# 3. PHASE 2: STATISTICAL CORRELATION ANALYSIS (Statistical Methods Unit 2)
print("\n--- PHASE 2: PEARSON CORRELATION MATRIX ---")
numerical_cols = ['Rainfall_mm', 'RiverLevel_m', 'SoilPermeability_mmhr', 'FloodRiskScore']
corr_matrix = df[numerical_cols].corr(method='pearson')
print(corr_matrix)

plt.figure(figsize=(6, 5))
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt=".2f", linewidths=0.5)
plt.title('Pearson Correlation Matrix')
plt.tight_layout()
plt.savefig('correlation_heatmap.png')
print("✔ Step 3: Correlation Matrix exported to 'correlation_heatmap.png'")

# 4. PHASE 3: MULTIPLE LINEAR REGRESSION MODELING
X = df[['Rainfall_mm', 'RiverLevel_m', 'SoilPermeability_mmhr']]
y = df['FloodRiskScore']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("\n--- PHASE 3: MODEL COEFFICIENTS & PERFORMANCE METRICS ---")
print(f"Model Intercept (Beta_0): {model.intercept_:.4f}")
print(f"Rainfall Coeff (Beta_1): {model.coef_[0]:.4f}")
print(f"River Level Coeff (Beta_2): {model.coef_[1]:.4f}")
print(f"Soil Permeability Coeff (Beta_3): {model.coef_[2]:.4f}")
print(f"Mean Squared Error (MSE): {mean_squared_error(y_test, y_pred):.4f}")
print(f"R-squared Score (R² Matrix): {r2_score(y_test, y_pred):.4f}")

# 5. PHASE 4: GEOSPATIAL RISK MAP VISUALIZATION (Folium Engine)
# Approximate spatial anchors for AP coastal districts
district_coords = {
    'Srikakulam': [18.3164, 83.8943], 'Vizianagaram': [18.1167, 83.4167],
    'Visakhapatnam': [17.6868, 83.2185], 'East Godavari': [16.9891, 82.2475],
    'West Godavari': [16.7107, 81.1300], 'Krishna': [16.1955, 81.1340],
    'Guntur': [16.3067, 80.4365], 'Prakasam': [15.5057, 80.0499],
    'Nellore': [14.4426, 79.9865]
}

# Aggregate risk metrics by district zone
district_summary = df.groupby('District')['FloodRiskScore'].mean().reset_index()

# Instantiating geographic layer map centered over Andhra Pradesh
ap_map = folium.Map(location=[15.9129, 79.7400], zoom_start=7, tiles='OpenStreetMap')

for _, row in district_summary.iterrows():
    name = row['District']
    score = row['FloodRiskScore']
    coord = district_coords[name]
    
    # Conditional color sorting logic for markers
    marker_color = 'red' if score > 50 else ('orange' if score > 35 else 'green')
    
    folium.Marker(
        location=coord,
        popup=folium.Popup(f"<b>District:</b> {name}<br><b>Mean Flood Risk Score:</b> {score:.2f}", max_width=300),
        tooltip=f"{name} (Risk: {score:.1f})",
        icon=folium.Icon(color=marker_color, icon='info-sign')
    ).add_to(ap_map)

ap_map.save('ap_flood_risk_map.html')
print("\n✔ Step 5: Geospatial Map successfully written to 'ap_flood_risk_map.html'")
print("--- PIPELINE RUN COMPLETED SUCCESSFULLY ---")
```

---

### SECTION 5: VIVA VOCE & REPORT DISCUSSION QUESTIONS

Use these typical JNTUK review panel questions to defend your lab project:
1.  **Why do we perform EDA before regression?** To ensure the parameters conform to linearity assumptions and to eliminate data discrepancies that disrupt Ordinary Least Squares estimation metrics.
2.  **What does a negative coefficient for soil permeability mean?** It signifies a mathematically inverse relationship; as soil fluid absorption indices increase, structural surface runoff decreases, causing a reduction in predicted flood hazards.
3.  **How do we interpret the $R^2$ evaluation score?** It represents the percentage of total dependent target variable variation successfully mapped and explained by the three independent environmental tracking parameters.
