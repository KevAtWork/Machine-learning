import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.ml.preprocess import MedicalPreprocessor
from backend.app.ml.scratch_lr import ScratchLogisticRegression
from backend.app.ml.explain import explainer_instance

# Setup Client
client = TestClient(app)

def test_preprocessor_transformation():
    """Test that the preprocessor cleans physiological outliers and engineers BMI."""
    df_raw = pd.DataFrame([
        {"id": 1, "age": 18262, "gender": 2, "height": 175, "weight": 80.0, "ap_hi": 120, "ap_lo": 80, "cholesterol": 3, "gluc": 1, "smoke": 0, "alco": 0, "active": 1, "cardio": 0},
        {"id": 2, "age": 14610, "gender": 1, "height": 160, "weight": 60.0, "ap_hi": 110, "ap_lo": 70, "cholesterol": 1, "gluc": 1, "smoke": 0, "alco": 0, "active": 1, "cardio": 1},
        {"id": 3, "age": 21915, "gender": 2, "height": 180, "weight": 90.0, "ap_hi": 12000, "ap_lo": 85, "cholesterol": 2, "gluc": 2, "smoke": 1, "alco": 1, "active": 0, "cardio": 1}
    ])
    
    preprocessor = MedicalPreprocessor()
    preprocessor.fit(df_raw)
    df_clean = preprocessor.transform(df_raw)
    
    # Verify that the columns are engineered and scaled
    assert "bmi" in df_clean.columns
    assert "age_years" in df_clean.columns
    assert "pulse_pressure" in df_clean.columns
    
    # Since StandardScaler maps columns to mean 0, check that they are scaled numeric values
    assert isinstance(df_clean["bmi"].iloc[0], (float, np.float64))
    assert not np.isnan(df_clean["bmi"].iloc[0])
    
    # Blood pressure outlier (12000) should be clipped before scaling, resulting in a normal scaled number
    assert not np.isnan(df_clean["ap_hi"].iloc[2])
    assert not np.isinf(df_clean["ap_hi"].iloc[2])

def test_scratch_logistic_regression():
    """Test custom gradient descent loop on random mock data."""
    X = np.random.randn(100, 5)
    # Simple threshold target
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    
    model = ScratchLogisticRegression(learning_rate=0.1, epochs=100)
    model.fit(X, y)
    
    # Assert fitting variables are set
    assert model.weights is not None
    assert model.bias is not None
    assert len(model.weights) == 5
    
    # Assert predictive probabilities conform to boundaries
    prob = model.predict_proba(X)
    assert prob.shape == (100, 2)
    assert np.all(prob >= 0.0) and np.all(prob <= 1.0)
    
    predictions = model.predict(X)
    assert len(predictions) == 100
    assert set(predictions).issubset({0, 1})

def test_prediction_endpoint_validation():
    """Test validator bounds on input parameters."""
    response = client.post(
        f"{settings.API_V1_STR}/predict",
        json={
            "age_years": 50,
            "gender": 1,
            "height": 165,
            "weight": 70,
            "ap_hi": 500, # Critical invalid value (validator max is 250)
            "ap_lo": 80,
            "cholesterol": 1,
            "gluc": 1,
            "smoke": False,
            "alco": False,
            "active": True
        }
    )
    # Zod/Pydantic validation should fail with 422 Unprocessable Entity
    assert response.status_code == 422
