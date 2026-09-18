import os
import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import get_db
from backend.app.config import settings

router = APIRouter(prefix="/health", tags=["Health Monitoring"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    """Verifies backend API, database session context, and ML resources are healthy."""
    db_status = "unhealthy"
    try:
        # Run simple select query
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy (error: {e})"
        
    model_status = "unloaded"
    model_path = os.path.join(settings.SAVED_MODELS_DIR, "best_model.joblib")
    if os.path.exists(model_path):
        model_status = "ready"
    else:
        model_status = "missing (run train pipeline)"
        
    return {
        "status": "online",
        "timestamp": time.time(),
        "database_connectivity": db_status,
        "machine_learning_model": model_status,
        "environment": "production" if "postgres" in settings.DATABASE_URL else "development"
    }
