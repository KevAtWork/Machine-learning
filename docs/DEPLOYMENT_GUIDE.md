# CardioPredict AI Production Deployment Guide

This document describes how to deploy the CardioPredict AI application to cloud hosting platforms (such as Render, Railway, Vercel) and establish automated CI/CD deployment pipelines.

---

## 1. Environment Configurations

Make sure to establish environment variables on your cloud service dashboard:

| Variable | Description | Recommended Production Value |
| --- | --- | --- |
| `JWT_SECRET` | Secret key for JWT hashing | High entropy alphanumeric string |
| `DATABASE_URL` | SQLAlchemy Connection URL | PostgreSQL connection string (e.g. `postgresql://user:pass@host/db`) |
| `VITE_API_URL` | Frontend client gateway path | `https://api.yourdomain.com/api/v1` or `/api/v1` |

---

## 2. Deploying on Render (Unified Web Services)

You can host both backend and frontend services on **Render**:

### PostgreSQL Instance
1. Click **New** -> **PostgreSQL**.
2. Name the database, select a region, and choose the free tier.
3. Save the **Internal Database URL** for the backend configuration.

### FastAPI Backend
1. Click **New** -> **Web Service**.
2. Connect your GitHub repository.
3. Configuration parameters:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python -m backend.app.ml.train`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `DATABASE_URL`: (Paste your PostgreSQL connection string)
   - `JWT_SECRET`: (Set a strong secret key)

### React Frontend (Static Site)
1. Click **New** -> **Static Site**.
2. Connect the repository.
3. Configuration parameters:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add environment variables:
   - `VITE_API_URL`: (The URL of your Render backend web service, e.g. `https://cardiopredict-backend.onrender.com/api/v1`)
5. Configure a rewrite rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Status**: `200 (Rewrite)` (Essential for React SPA routing).

---

## 3. GitHub Actions CI/CD Workflow (Optional)

You can automate code testing and deployment using GitHub Actions.

Create `.github/workflows/deploy.yml`:

```yaml
name: CardioPredict CI/CD

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-state: 3.10
    - name: Install Dependencies
      run: |
        pip install -r requirements.txt
    - name: Preprocess & Train Verification
      run: |
        python -m backend.app.ml.download_data
        pytest tests/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    # Add deploy triggers to Render or Railway Webhook endpoints
    - name: Trigger Webhook Deploy
      run: |
        curl -X POST "${{ secrets.RENDER_DEPLOY_WEBHOOK_URL }}"
```
