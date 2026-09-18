# CardioPredict AI 🫀

CardioPredict AI is a production-grade, explainable cardiovascular disease risk assessment platform. By utilizing a clinical cohort of 70,000 patient entries, the application evaluates 11 health biomarkers using 14 machine learning algorithms (including ensemble models like XGBoost and a custom Logistic Regression built from scratch). Risk predictions are decoded in real-time using SHAP (SHapley Additive exPlanations) values to isolate and explain individual risk drivers, and users can export formatted medical reports in PDF format.

---

## Technical Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, TanStack Query, Axios, Recharts, React Toastify, React Hook Form, Zod, Lucide Icons
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite (Development), PostgreSQL (Production), Scikit-learn, NumPy, Pandas, XGBoost, SHAP, ReportLab (PDF compiler)
- **Deployment**: Docker, Docker Compose, Nginx, GitHub Actions (CI/CD)

---

## Folder Structure

```text
CardioPredictProject/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI Application Entrypoint
│       ├── config.py            # Global Settings Configuration
│       ├── database.py          # SQLAlchemy Session Connections
│       ├── models.py            # User and PredictionHistory Schemas
│       ├── schemas.py           # Pydantic Data Validations
│       ├── auth.py              # JWT Password Hashing and Access Controls
│       ├── ml/
│       │   ├── download_data.py # Dataset Downloader & Synthetic Fallback
│       │   ├── preprocess.py    # Medical Cleaning & Preprocessing Pipelines
│       │   ├── scratch_lr.py    # Custom Logistic Regression from scratch
│       │   ├── train.py         # 14-Model Benchmarks, Tuning & Plotting
│       │   └── explain.py       # SHAP Explainability Local/Global Handlers
│       └── utils/
│           └── pdf_generator.py # ReportLab Medical PDF Exporter
├── frontend/
│   ├── src/
│   │   ├── pages/               # Landing, Prediction, Dashboard, Analytics Pages
│   │   ├── utils/api.ts         # Centralized Axios Config with JWT intercepts
│   │   ├── App.tsx              # Sidebar routing layouts
│   │   ├── main.tsx             # TanStack Query & ReactDOM mounting
│   │   └── index.css            # Tailwind & Glassmorphism configurations
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
├── dataset/                     # Local data csv files
├── saved_models/                # Serialized model joblibs and metric logs
├── graphs/                      # Pre-computed EDA & SHAP visualizations
├── reports/                     # Output patient PDF report documents
├── tests/                       # Pytest verification suites
└── deployment/                  # Dockerfiles and Nginx server configs
```

---

## Quickstart Guide (Local Development)

### 1. Backend Setup

1. **Create and Activate a Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Train the Models**:
   Run the training pipeline. This fetches the dataset, trains 14 classifiers (including the Logistic Regression from scratch), runs hyperparameter tuning, serializes model weights, and pre-computes EDA visual dashboards.
   ```bash
   python3 -m backend.app.ml.train
   ```

4. **Launch the FastAPI Server**:
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```
   *The interactive Swagger documentation will be available at: http://localhost:8000/docs*

### 2. Frontend Setup

1. **Install Packages**:
   Navigate to the frontend folder and install:
   ```bash
   cd frontend
   npm install
   ```

2. **Launch Dev Server**:
   Start the Vite local development pipeline:
   ```bash
   npm run dev
   ```
   *The React interface will run at: http://localhost:5173*

---

## Testing & Verification

Run the Python pytest test suite to verify authentications, mathematical preprocess clip boundaries, custom Logistic Regression gradient steps, and prediction validation schemas:

```bash
pytest tests/
```

---

## Docker Compose Deployment (Production-ready)

Spin up containerized instances of the database, FastAPI backend server, and Nginx-proxied React production bundle under a unified gateway:

```bash
docker-compose up --build
```
- Frontend will serve on: `http://localhost`
- Backend API endpoints will proxy on: `http://localhost/api/v1`
