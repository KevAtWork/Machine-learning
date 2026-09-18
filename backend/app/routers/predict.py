import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
import joblib
import os

from backend.app.database import get_db
from backend.app.models import PredictionHistory
from backend.app.schemas import CardioPredictRequest, CardioPredictResponse
from backend.app.auth import get_current_user_optional
from backend.app.ml.explain import explainer_instance
from backend.app.utils.pdf_generator import generate_medical_report_pdf
from backend.app.config import settings

router = APIRouter(prefix="/predict", tags=["Prediction"])

def get_recommendations(req: CardioPredictRequest) -> list[str]:
    """Generates patient-specific clinical recommendations based on medical inputs."""
    recs = []
    
    # Blood Pressure Rules
    if req.ap_hi >= 140 or req.ap_lo >= 90:
        recs.append("Your blood pressure indicates Stage 2 Hypertension. We recommend consulting a physician or cardiologist to evaluate potential medical therapies (e.g., ACE inhibitors, beta-blockers) and immediately reducing daily dietary sodium intake below 1,500 mg.")
    elif req.ap_hi >= 130 or req.ap_lo >= 80:
        recs.append("Your blood pressure readings fall into Stage 1 Hypertension. We suggest implementing dietary changes (such as the DASH diet), increasing cardio exercises, and monitoring your blood pressure twice daily.")
    elif req.ap_hi >= 120 and req.ap_lo < 80:
        recs.append("Your blood pressure is Elevated. Continue a low-sodium, heart-healthy diet to prevent progression to full hypertension.")
        
    # BMI Rules (calculated on the fly)
    height_m = req.height / 100.0
    bmi = req.weight / (height_m ** 2)
    if bmi >= 30:
        recs.append(f"Your calculated BMI is {bmi:.1f} (Obese). We recommend scheduling an appointment with a dietitian to outline a structured caloric-deficit plan combined with regular resistance and aerobic activity.")
    elif bmi >= 25:
        recs.append(f"Your calculated BMI is {bmi:.1f} (Overweight). Focus on portion controls, tracking dietary fiber, and aiming for at least 150-300 minutes of moderate physical activity weekly.")
        
    # Cholesterol Rules
    if req.cholesterol == 3:
        recs.append("Your cholesterol levels are severely elevated (Well Above Normal). We strongly suggest requesting a comprehensive lipid panel test (checking LDL, HDL, and Triglycerides) and discussing statin therapeutics with your primary care provider.")
    elif req.cholesterol == 2:
        recs.append("Your cholesterol levels are Elevated. Increase intake of soluble fiber (found in oats, beans, and lentils) and omega-3 fatty acids, while minimizing saturated and trans fats.")
        
    # Glucose Rules
    if req.gluc == 3:
        recs.append("Your blood glucose level is Well Above Normal. We recommend checking your HbA1c levels with a healthcare provider to screen for diabetes or insulin resistance.")
    elif req.gluc == 2:
        recs.append("Your glucose level is Elevated. Limit refined carbohydrates and added sugars, and prioritize low-glycemic index foods.")
        
    # Lifestyle Rules
    if req.smoke:
        recs.append("Smoking is a primary driver of coronary artery damage and plaque build-up. We highly advocate enrolling in a smoking cessation program and discussing nicotine replacement therapies with your doctor.")
    if req.alco:
        recs.append("Regular alcohol intake can raise blood pressure and blood lipids. If you consume alcohol, keep intake within moderate medical limits (maximum 1 drink/day for women, 2/day for men).")
    if not req.active:
        recs.append("A sedentary lifestyle increases cardiac strain. We recommend starting with light-intensity walks for 15-30 minutes daily and gradually working up to structured cardio routines.")
        
    # General fallbacks if health parameters are mostly normal
    if not recs:
        recs.append("Your health indicators are currently in optimal ranges. Maintain a balanced diet rich in leafy greens, berries, whole grains, and lean proteins, and continue your active lifestyle.")
        
    return recs

@router.post("", response_model=CardioPredictResponse)
def predict_cardio(
    request_data: CardioPredictRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Predicts cardiovascular disease risk and outputs SHAP explanations."""
    model_path = os.path.join(settings.SAVED_MODELS_DIR, "best_model.joblib")
    preprocessor_path = os.path.join(settings.SAVED_MODELS_DIR, "preprocessor.joblib")
    
    if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model is not ready. Please run the training pipeline first."
        )
        
    try:
        # Load preprocessor & model
        preprocessor = joblib.load(preprocessor_path)
        model = joblib.load(model_path)
        
        # Prepare input dictionary for preprocessor format
        # Age needs to be converted back to days for preprocessing functions
        age_days = int(request_data.age_years * 365.25)
        raw_dict = {
            "age": age_days,
            "gender": request_data.gender,
            "height": request_data.height,
            "weight": request_data.weight,
            "ap_hi": request_data.ap_hi,
            "ap_lo": request_data.ap_lo,
            "cholesterol": request_data.cholesterol,
            "gluc": request_data.gluc,
            "smoke": int(request_data.smoke),
            "alco": int(request_data.alco),
            "active": int(request_data.active)
        }
        
        # Transform data
        df_input = pd.DataFrame([raw_dict])
        df_transformed = preprocessor.transform(df_input, apply_outlier_clipping=True)
        feature_names = preprocessor.get_feature_names()
        X_predict = df_transformed[feature_names]
        
        # Predict probability
        prob = float(model.predict_proba(X_predict)[0][1])
        
        # Calculate Risk Category
        if prob < 0.20:
            risk_level = "Low"
        elif prob < 0.50:
            risk_level = "Moderate"
        elif prob < 0.80:
            risk_level = "High"
        else:
            risk_level = "Critical"
            
        # Confidence Score: 2 * |prob - 0.5|
        confidence = float(2 * abs(prob - 0.5))
        
        # SHAP Explanations
        explainer_instance.load_resources()
        explanation = explainer_instance.explain_prediction(raw_dict)
        
        # Recommendations
        recommendations = get_recommendations(request_data)
        
        # Save to history database if user is logged in
        new_record = None
        if user:
            new_record = PredictionHistory(
                user_id=user.id,
                age=age_days,
                gender=request_data.gender,
                height=int(request_data.height),
                weight=request_data.weight,
                ap_hi=request_data.ap_hi,
                ap_lo=request_data.ap_lo,
                cholesterol=request_data.cholesterol,
                gluc=request_data.gluc,
                smoke=request_data.smoke,
                alco=request_data.alco,
                active=request_data.active,
                result_probability=prob,
                risk_level=risk_level,
                explanation_json=json.dumps(explanation)
            )
            db.add(new_record)
            db.commit()
            
        return {
            "result_probability": prob,
            "risk_level": risk_level,
            "confidence_score": confidence,
            "risk_factors": explanation['risk_factors'],
            "protective_factors": explanation['protective_factors'],
            "recommendations": recommendations,
            "created_at": datetime.utcnow()
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during prediction: {e}"
        )

@router.post("/report", response_class=StreamingResponse)
def get_pdf_report(request_data: CardioPredictRequest):
    """Compiles and streams a clinical-grade medical prediction report as a PDF."""
    try:
        # Re-run prediction internally to acquire probabilities and SHAP scores
        # We don't save this to DB to prevent duplicate entries if user already clicked submit
        model_path = os.path.join(settings.SAVED_MODELS_DIR, "best_model.joblib")
        preprocessor_path = os.path.join(settings.SAVED_MODELS_DIR, "preprocessor.joblib")
        
        if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model is not trained."
            )
            
        preprocessor = joblib.load(preprocessor_path)
        model = joblib.load(model_path)
        
        age_days = int(request_data.age_years * 365.25)
        raw_dict = {
            "age": age_days,
            "gender": request_data.gender,
            "height": request_data.height,
            "weight": request_data.weight,
            "ap_hi": request_data.ap_hi,
            "ap_lo": request_data.ap_lo,
            "cholesterol": request_data.cholesterol,
            "gluc": request_data.gluc,
            "smoke": int(request_data.smoke),
            "alco": int(request_data.alco),
            "active": int(request_data.active)
        }
        
        df_input = pd.DataFrame([raw_dict])
        df_transformed = preprocessor.transform(df_input, apply_outlier_clipping=True)
        feature_names = preprocessor.get_feature_names()
        X_predict = df_transformed[feature_names]
        prob = float(model.predict_proba(X_predict)[0][1])
        
        if prob < 0.20:
            risk_level = "Low"
        elif prob < 0.50:
            risk_level = "Moderate"
        elif prob < 0.80:
            risk_level = "High"
        else:
            risk_level = "Critical"
            
        confidence = float(2 * abs(prob - 0.5))
        explainer_instance.load_resources()
        explanation = explainer_instance.explain_prediction(raw_dict)
        recommendations = get_recommendations(request_data)
        
        patient_data_dict = {
            "age_years": request_data.age_years,
            "gender": request_data.gender,
            "height": int(request_data.height),
            "weight": request_data.weight,
            "ap_hi": request_data.ap_hi,
            "ap_lo": request_data.ap_lo,
            "cholesterol": request_data.cholesterol,
            "gluc": request_data.gluc,
            "smoke": request_data.smoke,
            "alco": request_data.alco,
            "active": request_data.active
        }
        
        prediction_results_dict = {
            "result_probability": prob,
            "risk_level": risk_level,
            "confidence_score": confidence,
            "risk_factors": explanation['risk_factors'],
            "protective_factors": explanation['protective_factors'],
            "recommendations": recommendations
        }
        
        # Compile Report PDF
        pdf_buffer = generate_medical_report_pdf(patient_data_dict, prediction_results_dict)
        
        # Return Stream
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=CardioPredict_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"}
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile PDF report: {e}"
        )
