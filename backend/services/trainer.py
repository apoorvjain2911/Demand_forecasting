from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

from core.config import MODEL_PATH
from services.preprocessing import build_preprocessor, prepare_frame


@dataclass(frozen=True)
class TrainingResult:
    metrics: dict[str, float]
    model_path: Path


def _chronological_split(frame: pd.DataFrame, target: pd.Series, validation_ratio: float = 0.2):
    split_index = max(int(len(frame) * (1 - validation_ratio)), 1)
    if split_index >= len(frame):
        split_index = len(frame) - 1

    train_frame = frame.iloc[:split_index].copy()
    validation_frame = frame.iloc[split_index:].copy()
    train_target = target.iloc[:split_index].copy()
    validation_target = target.iloc[split_index:].copy()

    if validation_frame.empty:
        raise ValueError("Not enough rows to create a validation split")

    return train_frame, validation_frame, train_target, validation_target


def train_xgboost_model(raw_frame: pd.DataFrame) -> TrainingResult:
    prepared = prepare_frame(raw_frame, include_target=True)
    frame = prepared.frame
    target = prepared.target

    if target is None:
        raise ValueError("Target column is required for training")
    if len(frame) < 10:
        raise ValueError("At least 10 valid rows are required to train the model")

    train_frame, validation_frame, train_target, validation_target = _chronological_split(frame, target)

    preprocessor = build_preprocessor()
    model = XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.9,
        colsample_bytree=0.9,
        reg_alpha=0.0,
        reg_lambda=1.0,
        random_state=42,
        objective="reg:squarederror",
        tree_method="hist",
    )

    train_features = preprocessor.fit_transform(train_frame)
    validation_features = preprocessor.transform(validation_frame)

    model.fit(train_features, train_target)
    predictions = model.predict(validation_features)

    mae = float(mean_absolute_error(validation_target, predictions))
    rmse = float(np.sqrt(mean_squared_error(validation_target, predictions)))
    r2 = float(r2_score(validation_target, predictions))

    artifact = {
        "preprocessor": preprocessor,
        "model": model,
        "feature_columns": list(train_frame.columns),
        "trained_rows": len(frame),
        "metrics": {"mae": mae, "rmse": rmse, "r2": r2},
    }

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)

    return TrainingResult(metrics={"mae": mae, "rmse": rmse, "r2": r2}, model_path=MODEL_PATH)