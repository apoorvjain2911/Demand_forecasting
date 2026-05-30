from __future__ import annotations

from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.config import DATASET_DIR, MODEL_PATH
from database.db import get_db
from database.models import Dataset
from schemas.forecast import TrainResponse, TrainingMetrics
from services.trainer import train_xgboost_model


router = APIRouter()


def _dataset_path(dataset_id: int, filename: str) -> Path:
    safe_name = Path(filename).name
    return DATASET_DIR / f"{dataset_id}_{safe_name}"


def _get_latest_dataset(db: Session) -> Dataset:
    dataset = db.query(Dataset).order_by(Dataset.upload_time.desc(), Dataset.id.desc()).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="No dataset available. Upload a CSV first.")
    return dataset


@router.post("/train", response_model=TrainResponse)
def train_model(dataset_id: int | None = None, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first() if dataset_id else _get_latest_dataset(db)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    dataset_path = _dataset_path(dataset.id, dataset.filename)
    if not dataset_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file is missing from storage")

    try:
        frame = pd.read_csv(dataset_path)
        result = train_xgboost_model(frame)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Training failed: {exc}") from exc

    return TrainResponse(
        message="Model trained successfully",
        dataset_id=dataset.id,
        metrics=TrainingMetrics(**result.metrics),
        model_path=str(MODEL_PATH),
    )