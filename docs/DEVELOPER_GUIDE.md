# CardioPredict AI Developer & Architecture Guide

This document describes the software design patterns, coding principles, and execution guidelines for engineers developing on the CardioPredict AI platform.

---

## 1. Architectural Style & SOLID Design Patterns

The platform is designed around the **SOLID** design principles and clean architectural separation of concerns:

- **Single Responsibility Principle (SRP)**:
  - `MedicalPreprocessor` handles *only* raw feature engineering, imputation, and outlier scaling.
  - `CardioExplainer` manages *only* SHAP values computation and dictionary mapping.
  - Routers isolate logical endpoints (e.g. auth routes remain separate from ML predict pathways).
- **Open/Closed Principle (OCP)**:
  - Models are saved as serialized `.joblib` binary formats. You can change the active machine learning algorithm (e.g. swap from XGBoost to Random Forest) by saving a new estimator object to `saved_models/best_model.joblib`. The FastAPI predict API will load and query it without modifying a single line of backend routing code.
- **Dependency Inversion Principle (DIP)**:
  - The database connection relies on a session generator `get_db()` injected via FastAPI's `Depends` dependencies framework, separating mock test DB structures from live production configurations.

---

## 2. Machine Learning Core Design

The preprocessing and model execution pipeline is structured inside `backend/app/ml/`:

- **Missing Values Imputation**: Auto-calculated medians (for continuous attributes) and modes (for binary attributes) are saved in the preprocessor model.
- **Outlier Cleaning**: Cleaned blood pressure is constrained strictly within realistic physical bounds (systolic 60-250 mmHg, diastolic 40-180 mmHg) using the clipping function `_clean_physiological_boundaries`. This guarantees that model predictions never crash if a patient enters typo metrics.
- **Feature Engineering**: BMI ($Weight / Height^2$), Pulse Pressure ($Sys - Dia$), Hypertension stage level groups, and age brackets are added.
- **Custom Scratch Algorithm**: The `ScratchLogisticRegression` class implements binary cross-entropy loss gradients computed iteratively using vectorized numpy operations, fully matching standard scikit-learn estimator methods.

---

## 3. Frontend Architecture

The user interface uses React 19 and Vite:

- **Typography**: Outfit (headings) and Inter (body) Google Fonts.
- **Global Themes**: Strict dark-only theme with custom CSS variables matching Apple carbon minimalist styling.
- **Component Styling**: Framer Motion handles dynamic card transitions, slide-outs, loading skeletons, and interactive state triggers. Recharts renders modular canvas charts representing probability trends.
- **Request State Controls**: TanStack Query (`@tanstack/react-query`) handles query caching, retries, and API state synchronization.
