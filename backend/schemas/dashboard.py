from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class KPIItem(BaseModel):
    label: str
    value: float | int | str
    hint: str


class ChartPoint(BaseModel):
    label: str
    historical: float
    forecast: float


class CategoryPoint(BaseModel):
    category: str
    demand: float


class ForecastRow(BaseModel):
    product_id: str
    product_name: str
    historical_demand: float
    forecasted_demand: float
    growth_percent: float
    confidence_level: float
    confidence_label: str
    recommendation: str


class InventoryRecommendation(BaseModel):
    type: str
    message: str


class BusinessInsight(BaseModel):
    message: str


class DashboardAnalytics(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dataset_id: int
    filename: str
    upload_time: datetime
    rows: int
    columns: list[str]
    metrics: dict[str, float]
    kpis: list[KPIItem]
    chart_data: dict[str, list[dict[str, float | str]]]
    forecast_rows: list[ForecastRow]
    top_growth_products: list[dict[str, float | str]]
    inventory_recommendations: list[InventoryRecommendation]
    business_insights: list[BusinessInsight]
    inventory_health_score: int
    message: str