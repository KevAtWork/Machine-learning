import os
from typing import Optional

try:
    # Pydantic v2 format
    from pydantic_settings import BaseSettings
except ImportError:
    # Pydantic v1 format
    from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CardioPredict AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-cardio-key-for-local-dev-123456")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cardiopredict.db")
    
    # Folders
    PROJECT_ROOT: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    SAVED_MODELS_DIR: str = os.path.join(PROJECT_ROOT, "saved_models")
    GRAPHS_DIR: str = os.path.join(PROJECT_ROOT, "graphs")
    REPORTS_DIR: str = os.path.join(PROJECT_ROOT, "reports")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
