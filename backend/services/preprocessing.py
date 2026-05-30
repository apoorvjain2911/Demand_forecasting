from __future__ import annotations

from dataclasses import dataclass

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


REQUIRED_COLUMNS = [
    "product_id",
    "product_name",
    "category",
    "date",
    "sales_quantity",
    "price",
    "discount",
]

FEATURE_COLUMNS = [
    "product_id",
    "product_name",
    "category",
    "price",
    "discount",
    "day",
    "week",
    "month",
    "quarter",
    "year",
]

TARGET_COLUMN = "sales_quantity"


@dataclass(frozen=True)
class PreparedData:
    frame: pd.DataFrame
    target: pd.Series | None


def validate_columns(frame: pd.DataFrame) -> None:
    normalized_columns = {str(column).strip().lower() for column in frame.columns}
    missing_columns = [column for column in REQUIRED_COLUMNS if column not in normalized_columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")


def prepare_frame(frame: pd.DataFrame, include_target: bool = True) -> PreparedData:
    validate_columns(frame)

    cleaned = frame.copy()
    cleaned.columns = [str(column).strip().lower() for column in cleaned.columns]
    cleaned = cleaned.drop_duplicates()

    cleaned["date"] = pd.to_datetime(cleaned["date"], errors="coerce")
    cleaned["product_id"] = cleaned["product_id"].astype(str).fillna("unknown").str.strip().replace("", "unknown")
    cleaned["product_name"] = cleaned["product_name"].astype(str).fillna("unknown").str.strip().replace("", "unknown")
    cleaned["category"] = cleaned["category"].astype(str).fillna("unknown").str.strip().replace("", "unknown")
    cleaned["price"] = pd.to_numeric(cleaned["price"], errors="coerce")
    cleaned["discount"] = pd.to_numeric(cleaned["discount"], errors="coerce")

    if include_target:
        cleaned[TARGET_COLUMN] = pd.to_numeric(cleaned[TARGET_COLUMN], errors="coerce")
        cleaned = cleaned.dropna(subset=["date", TARGET_COLUMN])
    else:
        cleaned = cleaned.dropna(subset=["date"])
        target = None

    cleaned["day"] = cleaned["date"].dt.day.astype(int)
    cleaned["week"] = cleaned["date"].dt.isocalendar().week.astype(int)
    cleaned["month"] = cleaned["date"].dt.month.astype(int)
    cleaned["quarter"] = cleaned["date"].dt.quarter.astype(int)
    cleaned["year"] = cleaned["date"].dt.year.astype(int)

    cleaned = cleaned.sort_values("date").reset_index(drop=True)

    if include_target:
        target = cleaned[TARGET_COLUMN].astype(float).reset_index(drop=True)

    return PreparedData(frame=cleaned, target=target)


def build_preprocessor() -> ColumnTransformer:
    categorical_features = ["product_id", "product_name", "category"]
    numerical_features = ["price", "discount", "day", "week", "month", "quarter", "year"]

    try:
        encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        encoder = OneHotEncoder(handle_unknown="ignore", sparse=False)

    return ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                numerical_features,
            ),
            (
                "categorical",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", encoder),
                    ]
                ),
                categorical_features,
            ),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )