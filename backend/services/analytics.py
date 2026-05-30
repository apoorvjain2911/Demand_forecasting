from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

import pandas as pd


@dataclass(frozen=True)
class AnalyticsResult:
    kpis: list[dict[str, float | int | str]]
    chart_data: dict[str, list[dict[str, float | str]]]
    forecast_rows: list[dict[str, float | str]]
    top_growth_products: list[dict[str, float | str]]
    inventory_recommendations: list[dict[str, str]]
    business_insights: list[dict[str, str]]
    inventory_health_score: int


def _growth_percent(previous: float, current: float) -> float:
    if previous == 0:
        return 0.0 if current == 0 else 100.0
    return ((current - previous) / previous) * 100.0


def _confidence_from_error(mae: float, historical: float) -> float:
    baseline = max(historical, 1.0)
    score = 100.0 - min((mae / baseline) * 100.0, 45.0)
    return round(max(min(score, 98.5), 55.0), 1)


def _confidence_label(score: float) -> str:
    if score >= 85:
        return "High"
    if score >= 70:
        return "Medium"
    return "Low"


def _next_month(date_value: pd.Timestamp) -> pd.Timestamp:
    return (date_value + pd.offsets.MonthBegin(1)).normalize()


def _latest_product_rows(frame: pd.DataFrame) -> pd.DataFrame:
    return (
        frame.sort_values("date")
        .groupby(["product_id", "product_name", "category"], as_index=False)
        .tail(1)
        .copy()
    )


def build_dashboard_analytics(frame: pd.DataFrame, predictions: list[float], mae: float) -> AnalyticsResult:
    working = frame.copy()
    working["forecast"] = predictions
    working["historical_demand"] = working["sales_quantity"].astype(float)
    working["month_label"] = working["date"].dt.strftime("%b %Y")

    latest_rows = _latest_product_rows(working)
    latest_rows["next_forecast_date"] = latest_rows["date"].apply(_next_month)
    latest_rows["forecasted_demand"] = latest_rows["forecast"].astype(float)
    latest_rows["historical_demand"] = latest_rows["historical_demand"].astype(float)

    product_summary = latest_rows[
        ["product_id", "product_name", "category", "historical_demand", "forecasted_demand", "price", "date", "month_label"]
    ].sort_values("forecasted_demand", ascending=False)

    historical_total = float(working["historical_demand"].sum())
    forecast_total = float(product_summary["forecasted_demand"].sum())
    total_products = int(product_summary["product_id"].nunique())
    inventory_risk_products = int((product_summary["forecasted_demand"] < product_summary["historical_demand"] * 0.9).sum())
    expected_revenue = float((product_summary["forecasted_demand"] * product_summary["price"]).sum())
    avg_monthly_sales = float(working.groupby(working["date"].dt.to_period("M"))["historical_demand"].sum().mean())
    demand_change = _growth_percent(avg_monthly_sales, forecast_total)

    kpis = [
        {"label": "Total Products", "value": total_products, "hint": "Unique products analyzed"},
        {"label": "Total Historical Sales", "value": round(historical_total, 0), "hint": "Units recorded across all months"},
        {"label": "Forecasted Demand", "value": round(forecast_total, 0), "hint": "Next-month demand across products"},
        {"label": "Inventory Risk Products", "value": inventory_risk_products, "hint": "Items likely to need attention"},
        {"label": "Expected Revenue", "value": round(expected_revenue, 2), "hint": "Forecasted revenue estimate"},
    ]

    monthly_summary = working.groupby("month_label", as_index=False).agg(historical=("historical_demand", "sum"))
    if len(monthly_summary):
        next_month_label = _next_month(pd.to_datetime(working["date"].max())).strftime("%b %Y")
        monthly_summary = pd.concat(
            [
                monthly_summary,
                pd.DataFrame(
                    [{"month_label": next_month_label, "historical": float(monthly_summary["historical"].iloc[-1]), "forecast": forecast_total}]
                ),
            ],
            ignore_index=True,
        )
    monthly_summary["forecast"] = monthly_summary.get("forecast", pd.Series([0.0] * len(monthly_summary)))
    monthly_summary.loc[monthly_summary.index[:-1], "forecast"] = monthly_summary.loc[monthly_summary.index[:-1], "historical"]

    by_category = (
        working.groupby("category", as_index=False)
        .agg(demand=("historical_demand", "sum"))
        .sort_values("demand", ascending=False)
    )

    inventory_risk_distribution = (
        product_summary.assign(risk=lambda item: item["forecasted_demand"] < item["historical_demand"] * 0.9)
        .groupby("risk", as_index=False)
        .size()
    )

    forecast_rows = []
    inventory_recommendations = []
    top_growth_products = []
    for _, row in product_summary.iterrows():
        growth = _growth_percent(float(row["historical_demand"]), float(row["forecasted_demand"]))
        confidence = _confidence_from_error(mae, float(row["historical_demand"]))
        volatility = float(working.loc[working["product_id"] == row["product_id"], "historical_demand"].std() or 0.0)
        confidence = round(max(55.0, min(98.0, confidence - min(volatility / max(float(row["historical_demand"]), 1.0) * 10.0, 18.0))), 1)
        confidence_label = _confidence_label(confidence)
        recommendation = "Maintain current stock" if growth >= 0 else "Review replenishment plan"
        if growth < -10:
            recommendation = "Reorder immediately"
        elif growth > 15:
            recommendation = "Increase stock allocation"

        forecast_rows.append(
            {
                "product_id": str(row["product_id"]),
                "product_name": str(row["product_name"]),
                "historical_demand": round(float(row["historical_demand"]), 2),
                "forecasted_demand": round(float(row["forecasted_demand"]), 2),
                "growth_percent": round(float(growth), 2),
                "confidence_level": confidence,
                "confidence_label": confidence_label,
                "recommendation": recommendation,
            }
        )

        top_growth_products.append(
            {
                "product_name": str(row["product_name"]),
                "growth_percent": round(float(growth), 2),
                "label": f"{str(row['product_name'])} {round(float(growth), 1):+}%",
            }
        )

        gap = float(row["historical_demand"]) - float(row["forecasted_demand"])
        if gap > 0:
            inventory_recommendations.append(
                {
                    "type": "Low Stock Alert",
                    "message": f"Product {row['product_name']} may run out of stock within 15 days.",
                }
            )
            inventory_recommendations.append(
                {
                    "type": "Reorder Recommendation",
                    "message": f"Reorder {max(int(abs(gap)), 1)} units of {row['product_name']}.",
                }
            )
        else:
            inventory_recommendations.append(
                {
                    "type": "Overstock Alert",
                    "message": f"Product {row['product_name']} inventory exceeds expected demand.",
                }
            )

    business_insights = [
        {"message": f"Demand is expected to change by {round(demand_change, 1)}% next month."},
        {"message": f"{by_category.iloc[0]['category']} category shows the strongest growth." if len(by_category) else "No category trend available."},
        {"message": f"{by_category.iloc[-1]['category']} category is showing the weakest demand." if len(by_category) > 1 else "Demand trend is stable across categories."},
        {"message": f"Product {product_summary.iloc[0]['product_name']} is likely to become a best seller." if len(product_summary) else "No product trend available."},
    ]

    top_growth_products = sorted(top_growth_products, key=lambda item: item["growth_percent"], reverse=True)[:3]

    chart_data = {
        "monthly_sales_trend": [
            {"label": str(row["month_label"]), "historical": float(row["historical"]), "forecast": float(row["forecast"])}
            for _, row in monthly_summary.iterrows()
        ],
        "forecast_vs_historical": [
            {"label": str(row["product_name"]), "historical": float(row["historical_demand"]), "forecast": float(row["forecasted_demand"])}
            for _, row in product_summary.iterrows()
        ],
        "category_distribution": [
            {"label": str(row["category"]), "value": float(row["demand"])}
            for _, row in by_category.iterrows()
        ],
        "inventory_risk_distribution": [
            {"label": "Risk", "value": float(inventory_risk_distribution.loc[inventory_risk_distribution["risk"] == True, "size"].sum() if len(inventory_risk_distribution) else 0)},
            {"label": "Healthy", "value": float(inventory_risk_distribution.loc[inventory_risk_distribution["risk"] == False, "size"].sum() if len(inventory_risk_distribution) else len(product_summary))},
        ],
    }

    inventory_health_score = int(max(0, min(100, round(100 - (inventory_risk_products / max(total_products, 1)) * 100))))

    return AnalyticsResult(
        kpis=kpis,
        chart_data=chart_data,
        forecast_rows=forecast_rows,
        top_growth_products=top_growth_products,
        inventory_recommendations=inventory_recommendations,
        business_insights=business_insights,
        inventory_health_score=inventory_health_score,
    )