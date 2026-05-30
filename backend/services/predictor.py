from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd

from core.config import MODEL_PATH
from services.preprocessing import prepare_frame


def load_model_artifact(model_path: Path | None = None):
    path = model_path or MODEL_PATH
    if not path.exists():
        raise FileNotFoundError("Trained model not found. Train the model before forecasting.")
    return joblib.load(path)


def predict_frame(raw_frame: pd.DataFrame) -> tuple[pd.DataFrame, list[float]]:
    artifact = load_model_artifact()
    prepared = prepare_frame(raw_frame, include_target=False)
    frame = prepared.frame

    transformed_frame = artifact["preprocessor"].transform(frame)
    predictions = artifact["model"].predict(transformed_frame)
    predictions = [float(max(prediction, 0.0)) for prediction in predictions]
    return frame, predictions