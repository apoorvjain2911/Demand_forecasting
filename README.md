# ERP Demand Forecasting & Inventory Intelligence

Production-ready AI-powered ERP Demand Forecasting and Inventory Intelligence platform that transforms historical sales data into demand forecasts, inventory recommendations, executive KPIs, and business insights through a single-upload workflow...

## Project Overview

This project provides a business-friendly ERP analytics experience where users can upload historical sales data and instantly receive forecasting and inventory intelligence

### Workflow

1. Upload a historical sales CSV file.
2. The backend validates and preprocesses the data.
3. An XGBoost forecasting model is trained automatically.
4. Demand forecasts are generated.
5. Inventory intelligence and business recommendations are calculated.
6. The dashboard displays KPIs, charts, forecasts, alerts, and insights.

No separate training or forecasting steps are required from the user.

---

## Features

### Demand Forecasting
- Automated demand prediction
- Product-level forecasts
- Growth trend analysis
- Forecast confidence indicators

### Inventory Intelligence
- Low stock alerts
- Overstock detection
- Reorder recommendations
- Inventory health scoring

### Executive Dashboard
- Executive summary KPIs
- Interactive charts
- Forecast tables
- Business performance insights

### Business Insights
- Natural-language recommendations
- Product growth opportunities
- Demand trend identification
- Category performance analysis

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Recharts

### Backend
- FastAPI
- Pandas
- NumPy
- Scikit-Learn
- XGBoost
- SQLAlchemy
- Pydantic

### Database
- SQLite (default)
- PostgreSQL (production-ready)

### Deployment
- Vercel (Frontend)
- Render (Backend)

---

## Repository Structure

```text
Demand_forecasting/
│
├── backend/
│   ├── api/
│   ├── core/
│   ├── database/
│   ├── services/
│   ├── models/
│   ├── datasets/
│   ├── main.py
│   ├── requirements.txt
│   └── render.yaml
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── vercel.json
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

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
6. Set `ALLOWED_ORIGINS` to the deployed Vercel frontend URL.
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

## Live Demo

- Frontend: https://demand-forecasting-self.vercel.app/
- Backend health: https://demand-forecasting-x2hr.onrender.com/health

Use the live frontend to upload a CSV and view the dashboard. The frontend is configured to call the Render backend through `VITE_API_URL`.



## Screenshots

Add screenshots here after deployment for the executive dashboard, charts, and forecast table.

## Notes

- Uploaded datasets are stored in `backend/datasets/`.
- The trained model is saved at `backend/models/xgboost_model.pkl`.
- The dashboard uses a single upload action and automatically renders the generated analytics.
