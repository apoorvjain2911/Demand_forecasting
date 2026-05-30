from __future__ import annotations

from datetime import datetime
from io import BytesIO
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from core.config import DATASET_DIR
from database.db import get_db
from database.models import Dataset
from schemas.dataset import DatasetRead
from schemas.dashboard import DashboardAnalytics
from services.preprocessing import validate_columns
from services.analytics import build_dashboard_analytics
from services.predictor import predict_frame
from services.trainer import train_xgboost_model


router = APIRouter()


def _dataset_path(dataset_id: int, filename: str) -> Path:
    safe_name = Path(filename).name
    return DATASET_DIR / f"{dataset_id}_{safe_name}"


@router.post("/upload", response_model=DashboardAnalytics)
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    raw_content = await file.read()
    if not raw_content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        frame = pd.read_csv(BytesIO(raw_content))
        validate_columns(frame)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid CSV dataset: {exc}") from exc

    dataset = Dataset(filename=file.filename, upload_time=datetime.utcnow())
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    dataset_path = _dataset_path(dataset.id, file.filename)
    dataset_path.write_bytes(raw_content)

    try:
        trained_result = train_xgboost_model(frame)
        feature_frame, predictions = predict_frame(frame)
        analytics = build_dashboard_analytics(feature_frame, predictions, trained_result.metrics["mae"])
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Automatic analysis failed: {exc}") from exc

    return DashboardAnalytics(
        dataset_id=dataset.id,
        filename=dataset.filename,
        upload_time=dataset.upload_time,
        rows=int(len(frame)),
        columns=list(frame.columns),
        metrics=trained_result.metrics,
        kpis=analytics.kpis,
        chart_data=analytics.chart_data,
        forecast_rows=analytics.forecast_rows,
        top_growth_products=analytics.top_growth_products,
        inventory_recommendations=analytics.inventory_recommendations,
        business_insights=analytics.business_insights,
        inventory_health_score=analytics.inventory_health_score,
        message="Dataset uploaded, validated, trained, and analyzed successfully",
    )