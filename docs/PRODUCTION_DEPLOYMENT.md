# Production Deployment Guide - CardioPredict AI

This guide outlines the steps required to deploy the **CardioPredict AI** platform live to the cloud. The project is already pre-configured for production using Docker, Nginx, and environment variables.

---

## Phase 1: Pre-Flight Production Checklist

Before pushing the project live, configure these production safeguards:

### 1. Secure Secret Keys
In `docker-compose.yml` (or your cloud environment settings), change the default `JWT_SECRET` key to a secure, random string.
```yaml
# In docker-compose.yml
environment:
  - JWT_SECRET=3c9b74828f7311e9a9a5f23c915016e3fd8b5dfd4f828a2a07c91a0212f8ea34
```

### 2. Upgrade to a Managed Database (e.g. PostgreSQL)
SQLite is excellent for development but not suitable for high-concurrency production setups. Because the FastAPI backend uses SQLAlchemy, you can swap to PostgreSQL simply by changing the `DATABASE_URL` environment variable:
```yaml
# Example using a managed AWS RDS / Supabase database
environment:
  - DATABASE_URL=postgresql://db_user:db_password@rds-instance-endpoint:5432/cardiopredict
```

### 3. Build & Pre-train the Model
Ensure your model files (`best_model.joblib` and `preprocessor.joblib`) are generated. When deploying to a server, you can either:
- Copy the locally trained `./saved_models` directory to the server.
- Run the training pipeline script on the server before launching:
  `python3 -m backend.app.ml.train`

---

## Phase 2: Deployment Platforms

### Option A: Virtual Private Server (VPS) via Docker Compose (Recommended)
This is the most cost-effective and direct method (suitable for DigitalOcean droplet, AWS EC2 instance, or Linode).

#### 1. Provision Server & Install Docker
Provision a Linux Ubuntu server and install Docker + Docker Compose:
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
```

#### 2. Clone Repository & Run ML Pipeline
Clone your project, install backend dependencies, and run the training pipeline once:
```bash
git clone https://github.com/yourusername/CardioPredictProject.git
cd CardioPredictProject
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 -m backend.app.ml.train
```

#### 3. Spin up Containers
Run the Docker Compose suite in detached mode (background):
```bash
docker-compose up -d --build
```
Your application is now running live on Port 80!

#### 4. Configure HTTPS (SSL Encryption)
For a medical application, HTTPS is mandatory. Install Let's Encrypt Certbot on the host:
```bash
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d yourdomain.com
```
Update the Nginx volume configuration to load the certificate keys, or run a reverse-proxy sidecar (like Traefik/Nginx Proxy Manager) to automate certificate renewals.

---

### Option B: Cloud PaaS Containers (Render, Railway, Heroku)
If you prefer a fully managed serverless experience where the cloud provider manages servers and SSL certificates automatically:

#### Render.com Deployment Steps:
1. **Managed PostgreSQL**: Click "New" -> "PostgreSQL" and copy the Internal Database URL.
2. **FastAPI Backend (Web Service)**:
   - Click "New" -> "Web Service" and link your Git repository.
   - Set **Runtime** to `Docker` and the Dockerfile path to `deployment/Dockerfile`.
   - Add environment variables:
     - `DATABASE_URL` = *[Your copied Database URL]*
     - `JWT_SECRET` = *[Your secure JWT string]*
3. **React Frontend (Web Service)**:
   - Click "New" -> "Web Service" and link your Git repository.
   - Set **Runtime** to `Docker` and the Dockerfile path to `deployment/Dockerfile.frontend`.
   - Add environment variables:
     - `VITE_API_URL` = *[Your deployed Backend service URL]/api/v1*
4. Render will automatically generate an **SSL (HTTPS) domain name** for both services!
