import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app.models import PredictionHistory
from backend.app.schemas import PredictionHistoryOut
from backend.app.auth import get_current_user

router = APIRouter(prefix="/history", tags=["Prediction History"])

@router.get("", response_model=List[PredictionHistoryOut])
def get_user_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Retrieves all past cardiovascular prediction records for the authenticated user."""
    history = db.query(PredictionHistory)\
                .filter(PredictionHistory.user_id == current_user.id)\
                .order_by(PredictionHistory.created_at.desc())\
                .all()
                
    # Map age back to years on schema return
    results = []
    for h in history:
        h_dict = {
            "id": h.id,
            "user_id": h.user_id,
            "age_years": float(h.age / 365.25),
            "gender": h.gender,
            "height": float(h.height),
            "weight": float(h.weight),
            "ap_hi": h.ap_hi,
            "ap_lo": h.ap_lo,
            "cholesterol": h.cholesterol,
            "gluc": h.gluc,
            "smoke": h.smoke,
            "alco": h.alco,
            "active": h.active,
            "result_probability": h.result_probability,
            "risk_level": h.risk_level,
            "created_at": h.created_at
        }
        results.append(h_dict)
        
    return results

@router.get("/export")
def export_history_csv(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Compiles and streams the patient's cardiorespiratory diagnostic history log as a CSV spreadsheet."""
    history = db.query(PredictionHistory)\
                .filter(PredictionHistory.user_id == current_user.id)\
                .order_by(PredictionHistory.created_at.desc())\
                .all()
                
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No prediction history records found to export."
        )
        
    # Create an in-memory string buffer for CSV compiling
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Record ID", "Date Created", "Age (Years)", "Gender", "Height (cm)", 
        "Weight (kg)", "Systolic BP (ap_hi)", "Diastolic BP (ap_lo)", 
        "Cholesterol Level", "Glucose Level", "Smoker", "Alcohol Consumption", 
        "Physically Active", "Risk Probability", "Risk Level"
    ])
    
    # Rows
    for h in history:
        gender_str = "Male" if h.gender == 2 else "Female"
        chol_labels = ["Normal", "Above Normal", "Well Above Normal"]
        gluc_labels = ["Normal", "Above Normal", "Well Above Normal"]
        
        writer.writerow([
            h.id,
            h.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            round(h.age / 365.25, 1),
            gender_str,
            h.height,
            h.weight,
            h.ap_hi,
            h.ap_lo,
            chol_labels[h.cholesterol - 1],
            gluc_labels[h.gluc - 1],
            "Yes" if h.smoke else "No",
            "Yes" if h.alco else "No",
            "Yes" if h.active else "No",
            f"{h.result_probability:.4f}",
            h.risk_level
        ])
        
    output.seek(0)
    
    # Wrap in stream for download
    csv_bytes = io.BytesIO(output.getvalue().encode('utf-8'))
    return StreamingResponse(
        csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=CardioPredict_History_{current_user.id}_{datetime.now().strftime('%Y%m%d')}.csv"}
    )
