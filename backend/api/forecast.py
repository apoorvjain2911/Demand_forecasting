from __future__ import annotations

from datetime import datetime
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.config import DATASET_DIR
from database.db import get_db
from database.models import Dataset, Forecast
from schemas.forecast import ForecastRead, ForecastRequest, ForecastResponse
from services.predictor import predict_frame


router = APIRouter()


def _dataset_path(dataset_id: int, filename: str) -> Path:
    safe_name = Path(filename).name
    return DATASET_DIR / f"{dataset_id}_{safe_name}"


def _get_latest_dataset(db: Session) -> Dataset:
    dataset = db.query(Dataset).order_by(Dataset.upload_time.desc(), Dataset.id.desc()).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="No dataset available. Upload a CSV first.")
    return dataset


@router.post("/forecast", response_model=ForecastResponse)
def generate_forecast(request: ForecastRequest, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == request.dataset_id).first() if request.dataset_id else _get_latest_dataset(db)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    dataset_path = _dataset_path(dataset.id, dataset.filename)
    if not dataset_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file is missing from storage")

    try:
        frame = pd.read_csv(dataset_path)
        feature_frame, predictions = predict_frame(frame)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Forecasting failed: {exc}") from exc

    forecast_records: list[ForecastRead] = []
    for index, (_, row) in enumerate(feature_frame.iterrows()):
        prediction_date = pd.to_datetime(row["date"]).date()
        forecast = Forecast(
            prediction_date=prediction_date,
            product_id=str(row["product_id"]),
            predicted_demand=float(predictions[index]),
            created_at=datetime.utcnow(),
        )
        db.add(forecast)
        db.flush()
        forecast_records.append(ForecastRead.model_validate(forecast))

    db.commit()

    return ForecastResponse(
        message="Forecast generated successfully",
        count=len(forecast_records),
        forecasts=forecast_records,
    )


@router.get("/forecasts", response_model=list[ForecastRead])
def get_forecast_history(db: Session = Depends(get_db)):
    forecasts = db.query(Forecast).order_by(Forecast.created_at.desc(), Forecast.id.desc()).all()
    return [ForecastRead.model_validate(item) for item in forecasts]