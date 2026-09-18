import os
import pandas as pd
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from backend.app.config import settings
from backend.app.ml.download_data import DATASET_PATH
from backend.app.ml.preprocess import inspect_dataset

router = APIRouter(prefix="/eda", tags=["Data Analysis (EDA)"])

@router.get("")
def get_eda_metadata():
    """Returns exploratory data analysis status, listing available graphs and data insights."""
    if not os.path.exists(DATASET_PATH):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Dataset is not downloaded or preprocessed. Run training pipeline first."
        )
        
    try:
        # Load sample raw data metrics
        df = pd.read_csv(DATASET_PATH, sep=';', nrows=10000) # Read chunk for statistics speed
        stats = inspect_dataset(df)
        
        # Get list of generated graph files in directory
        graph_files = []
        if os.path.exists(settings.GRAPHS_DIR):
            graph_files = [f for f in os.listdir(settings.GRAPHS_DIR) if f.endswith(".png")]
            
        return {
            "available_graphs": graph_files,
            "insights": stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate EDA metadata: {e}"
        )

@router.get("/graphs/{graph_name}")
def get_eda_graph(graph_name: str):
    """Serves the generated visualization PNG plots for cardiovascular indicators."""
    graph_path = os.path.join(settings.GRAPHS_DIR, graph_name)
    
    # Secure validation against directory traversal attacks
    normalized_path = os.path.normpath(graph_path)
    if not normalized_path.startswith(os.path.normpath(settings.GRAPHS_DIR)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid graph path."
        )
        
    if not os.path.exists(graph_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Graph '{graph_name}' was not found. Complete model training first."
        )
        
    return FileResponse(graph_path, media_type="image/png")
