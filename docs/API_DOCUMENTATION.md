# CardioPredict AI REST API Specification

This documentation outlines the endpoint schemas, parameters, and query parameters exposed by the FastAPI backend server (`http://localhost:8000/api/v1`).

---

## 1. Authentication Endpoints

### Register User
* **Endpoint**: `POST /auth/register`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "doctor@hospital.org",
  "password": "securepassword101",
  "full_name": "Dr. Clara Oswald"
}
```
* **Response (201 Created)**:
```json
{
  "id": 1,
  "email": "doctor@hospital.org",
  "full_name": "Dr. Clara Oswald",
  "created_at": "2026-08-06T13:45:00.000Z"
}
```

### User Login
* **Endpoint**: `POST /auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "doctor@hospital.org",
  "password": "securepassword101"
}
```
* **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "doctor@hospital.org",
    "full_name": "Dr. Clara Oswald",
    "created_at": "2026-08-06T13:45:00.000Z"
  }
}
```

---

## 2. Risk Prediction Endpoints

### Submit Diagnostic
* **Endpoint**: `POST /predict`
* **Access**: Public (Optional JWT Authentication - if token is supplied in header, prediction is added to user history)
* **Request Body**:
```json
{
  "age_years": 54.2,
  "gender": 2,
  "height": 172.0,
  "weight": 85.3,
  "ap_hi": 142,
  "ap_lo": 92,
  "cholesterol": 2,
  "gluc": 1,
  "smoke": true,
  "alco": false,
  "active": true
}
```
* **Response (200 OK)**:
```json
{
  "result_probability": 0.6742,
  "risk_level": "High",
  "confidence_score": 0.3484,
  "risk_factors": [
    {
      "feature": "ap_hi",
      "display_name": "Systolic Blood Pressure",
      "shap_value": 0.1874,
      "importance": 0.1874,
      "raw_value": "142"
    }
  ],
  "protective_factors": [
    {
      "feature": "active",
      "display_name": "Physical Activity",
      "shap_value": -0.0412,
      "importance": 0.0412,
      "raw_value": "Active/Yes"
    }
  ],
  "recommendations": [
    "Your blood pressure indicates Stage 2 Hypertension. We recommend consulting..."
  ],
  "created_at": "2026-08-06T13:46:12Z"
}
```

### Download Clinical PDF Report
* **Endpoint**: `POST /predict/report`
* **Access**: Public
* **Request Body**: (Same patient parameters as `/predict`)
* **Response**: Binary PDF file download stream.

---

## 3. Analysis & Analytics Endpoints

### Get EDA Insights
* **Endpoint**: `GET /eda`
* **Access**: Public
* **Response**: JSON summary detailing duplicate records, class distributions, outlier values, and list of PNG graphs.

### Get EDA Visualization Graph
* **Endpoint**: `GET /eda/graphs/{graph_name}`
* **Access**: Public
* **Response**: Stream of visual image asset (e.g. `correlation_heatmap.png`).

### Compare Models Metrics
* **Endpoint**: `GET /metrics`
* **Access**: Public
* **Response**: Model names mapped to Accuracy, F1 Score, Precision, Recall, ROC AUC, Cross-Validation Score, training duration, and 2x2 confusion matrix array.

---

## 4. Administrative & History

### Prediction History Log
* **Endpoint**: `GET /history`
* **Access**: Protected (JWT token required)
* **Response**: Array of past predictions mapped to dates.

### Export History CSV
* **Endpoint**: `GET /history/export`
* **Access**: Protected (JWT token required)
* **Response**: Downloadable CSV spreadsheet containing patient records.

### System Health
* **Endpoint**: `GET /health`
* **Access**: Public
* **Response**: State of database connectivity, uvicorn status, and pre-loaded joblib checks.
