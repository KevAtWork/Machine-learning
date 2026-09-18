import os
import json
from fastapi import APIRouter, HTTPException, status
import joblib

from backend.app.config import settings

router = APIRouter(tags=["Model Operations"])

@router.get("/model-info")
def get_model_info():
    """Returns details and parameters of the currently running active classifier model."""
    model_path = os.path.join(settings.SAVED_MODELS_DIR, "best_model.joblib")
    preprocessor_path = os.path.join(settings.SAVED_MODELS_DIR, "preprocessor.joblib")
    
    if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not trained. Check training progress."
        )
        
    try:
        model = joblib.load(model_path)
        preprocessor = joblib.load(preprocessor_path)
        
        # Extract model parameters
        params = {}
        if hasattr(model, "get_params"):
            params = model.get_params(deep=False)
            # Remove objects/non-serializable params
            params = {k: str(v) if not isinstance(v, (int, float, bool, str, list, dict, type(None))) else v for k, v in params.items()}
            
        return {
            "model_name": type(model).__name__,
            "preprocessor_scaling": preprocessor.scaling_method,
            "pca_components": preprocessor.n_components,
            "features_used": preprocessor.get_feature_names(),
            "model_hyperparameters": params
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving model info: {e}"
        )

@router.get("/metrics")
def get_model_metrics():
    """Loads and returns comparison results from the training benchmark runs."""
    comparison_path = os.path.join(settings.SAVED_MODELS_DIR, "model_comparison.json")
    
    if not os.path.exists(comparison_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model comparisons not found. Ensure training pipeline was executed."
        )
        
    try:
        with open(comparison_path, "r") as f:
            metrics_data = json.load(f)
        return metrics_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading metrics comparisons: {e}"
        )
