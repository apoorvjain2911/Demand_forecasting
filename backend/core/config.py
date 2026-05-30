from pathlib import Path
import os

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")


def _as_path(value: str | None, default: Path) -> Path:
    if value:
        return Path(value).expanduser().resolve()
    return default.resolve()


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{(BASE_DIR / 'app.db').as_posix()}",
)
MODEL_PATH = _as_path(os.getenv("MODEL_PATH"), BASE_DIR / "models" / "xgboost_model.pkl")
DATASET_DIR = _as_path(os.getenv("DATASET_DIR"), BASE_DIR / "datasets")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
APP_NAME = os.getenv("APP_NAME", "ERP Demand Forecasting System")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "https://your-frontend.vercel.app,https://www.your-frontend.vercel.app",
    ).split(",")
    if origin.strip()
]


def ensure_runtime_directories() -> None:
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)