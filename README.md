# ERP Demand Forecasting & Inventory Intelligence

Production-ready ERP demand forecasting platform with a FastAPI backend and a React + Vite dashboard for upload-driven analysis.

## Project Overview

The workflow is single-step and business-friendly:

1. Upload a historical sales CSV.
2. The backend validates the file, preprocesses the data, trains the model, and generates demand plus inventory intelligence.
3. The frontend renders KPIs, charts, recommendations, confidence levels, and business insights automatically.

## Features

- Demand Forecasting
- Inventory Intelligence
- Business Insights
- Executive Dashboard

## Repository Structure

- `backend/` FastAPI app, model training, analytics, database, and deployment config
- `frontend/` React dashboard, Vite build, Tailwind UI, and Vercel config
- `render.yaml` Render deployment manifest for the API
- `frontend/vercel.json` SPA routing for Vercel

## Local Setup

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Environment Variables

### Backend

- `DATABASE_URL` - PostgreSQL connection string for Render and production
- `MODEL_PATH` - model artifact path, default `backend/models/xgboost_model.pkl`
- `DATASET_DIR` - uploaded CSV storage directory, default `backend/datasets`
- `ALLOWED_ORIGINS` - comma-separated list of allowed frontend origins
- `LOG_LEVEL` - logging level such as `INFO`

### Frontend

- `VITE_API_URL` - Render backend URL used by Axios

## API Endpoints

- `POST /upload` - upload CSV and return analysis payload
- `POST /train` - train the model manually
- `POST /forecast` - generate forecasts from the latest dataset
- `GET /forecasts` - return forecast history
- `GET /health` - health check

## Render Deployment Steps

1. Push the repository to GitHub.
2. Create a new Render Web Service from the repository.
3. Use `render.yaml` or point the service to `backend/`.
4. Set `DATABASE_URL` to your PostgreSQL connection string.
5. Ensure Render uses **Python 3.11** for the service. The project pins `pydantic`/`pydantic-core` which have prebuilt wheels for Python 3.11; newer Python runtimes (3.14+) may require Rust to compile native extensions and can fail during build.
5. Set `ALLOWED_ORIGINS` to the deployed Vercel frontend URL.
6. Verify the start command is:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Vercel Deployment Steps

1. Create a new Vercel project from the `frontend/` folder.
2. Set `VITE_API_URL` to the Render backend URL.
3. Deploy using the standard Vite build command:

```bash
npm run build
```

4. `frontend/vercel.json` ensures SPA route refreshes work correctly.

## Architecture Diagram

The system architecture is a simple two-tier web application with a data-processing backend and a single-page frontend. Use the diagram below when planning deployments.

```mermaid
flowchart LR
	A[User Browser] -->|Upload CSV / View Dashboard| B(Vercel Frontend)
	B -->|API requests (VITE_API_URL)| C[Render Backend (FastAPI)]
	C --> D[(Postgres / SQLite)]
	C --> E[(Model artefact - joblib/pkl)]
	C --> F[Storage for uploaded CSVs]
```

## Screenshots

Add screenshots here after deployment for the executive dashboard, charts, and forecast table.

## Notes

- Uploaded datasets are stored in `backend/datasets/`.
- The trained model is saved at `backend/models/xgboost_model.pkl`.
- The dashboard uses a single upload action and automatically renders the generated analytics.