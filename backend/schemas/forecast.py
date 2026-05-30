from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ForecastRequest(BaseModel):
    dataset_id: int | None = Field(default=None, description="Optional dataset ID to forecast")


class ForecastRead(BaseModel):
    id: int
    prediction_date: date
    product_id: str
    predicted_demand: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ForecastResponse(BaseModel):
    message: str
    count: int
    forecasts: list[ForecastRead]


class TrainingMetrics(BaseModel):
    mae: float
    rmse: float
    r2: float


class TrainResponse(BaseModel):
    message: str
    dataset_id: int
    metrics: TrainingMetrics
    model_path: str