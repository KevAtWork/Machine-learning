import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.routers import auth, predict, model, eda, history, health

# Create SQL tables out-of-the-box (For development/SQLite simplicity)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CardioPredict AI - Cardiovascular Disease Prediction & Explanations using ML (SHAP)",
    version="1.0.0"
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL (e.g. localhost:5173, Vercel)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve graphs static directory directly for fallback UI needs
os.makedirs(settings.GRAPHS_DIR, exist_ok=True)
app.mount("/static/graphs", StaticFiles(directory=settings.GRAPHS_DIR), name="graphs")

# Register Endpoint Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(predict.router, prefix=settings.API_V1_STR)
app.include_router(model.router, prefix=settings.API_V1_STR)
app.include_router(eda.router, prefix=settings.API_V1_STR)
app.include_router(history.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)

# Custom Global Error Handler
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Application Server Error: {str(exc)}"}
    )

@app.get("/")
def index():
    return {
        "message": "Welcome to CardioPredict AI Diagnostics API.",
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
