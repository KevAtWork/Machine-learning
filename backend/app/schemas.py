from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- AUTH SCHEMAS ---

class UserCreate(BaseModel):
    email: str
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None


# --- PREDICTION SCHEMAS ---

class CardioPredictRequest(BaseModel):
    age_years: float = Field(..., ge=1, le=120, description="Age in years")
    gender: int = Field(..., ge=1, le=2, description="Gender (1: Female, 2: Male)")
    height: float = Field(..., ge=50, le=250, description="Height in cm")
    weight: float = Field(..., ge=10, le=300, description="Weight in kg")
    ap_hi: int = Field(..., ge=40, le=250, description="Systolic Blood Pressure (mmHg)")
    ap_lo: int = Field(..., ge=30, le=180, description="Diastolic Blood Pressure (mmHg)")
    cholesterol: int = Field(..., ge=1, le=3, description="Cholesterol level (1: Normal, 2: Above Normal, 3: Well Above Normal)")
    gluc: int = Field(..., ge=1, le=3, description="Glucose level (1: Normal, 2: Above Normal, 3: Well Above Normal)")
    smoke: bool = Field(False, description="Whether the patient smokes")
    alco: bool = Field(False, description="Whether the patient consumes alcohol")
    active: bool = Field(True, description="Whether the patient is physically active")


class SHAPContribution(BaseModel):
    feature: str
    display_name: str
    shap_value: float
    importance: float
    raw_value: str

class CardioPredictResponse(BaseModel):
    result_probability: float
    risk_level: str
    confidence_score: float
    risk_factors: List[SHAPContribution]
    protective_factors: List[SHAPContribution]
    recommendations: List[str]
    created_at: datetime


# --- HISTORY & ANALYTICS SCHEMAS ---

class PredictionHistoryOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    age_years: float
    gender: int
    height: float
    weight: float
    ap_hi: int
    ap_lo: int
    cholesterol: int
    gluc: int
    smoke: bool
    alco: bool
    active: bool
    result_probability: float
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True

class ModelInfoDetail(BaseModel):
    name: str
    metrics: Dict[str, Any]

class EDAMetadata(BaseModel):
    graphs: List[str]
    inspection_stats: Dict[str, Any]
