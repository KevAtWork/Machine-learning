import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    predictions = relationship("PredictionHistory", back_populates="user", cascade="all, delete-orphan")

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    # Input medical parameters
    age = Column(Integer, nullable=False)  # in days
    gender = Column(Integer, nullable=False)  # 1: female, 2: male
    height = Column(Integer, nullable=False)  # cm
    weight = Column(Float, nullable=False)  # kg
    ap_hi = Column(Integer, nullable=False)  # systolic BP
    ap_lo = Column(Integer, nullable=False)  # diastolic BP
    cholesterol = Column(Integer, nullable=False)  # 1, 2, 3
    gluc = Column(Integer, nullable=False)  # 1, 2, 3
    smoke = Column(Boolean, default=False)
    alco = Column(Boolean, default=False)
    active = Column(Boolean, default=True)
    
    # Prediction result variables
    result_probability = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)  # Low, Moderate, High, Critical
    explanation_json = Column(Text, nullable=True)  # SHAP local explanation JSON string
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="predictions")
