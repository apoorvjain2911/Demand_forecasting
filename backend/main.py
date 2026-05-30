from __future__ import annotations

import logging

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from api.forecast import router as forecast_router
from api.train import router as train_router
from api.upload import router as upload_router
from core.config import APP_NAME, APP_VERSION, CORS_ORIGINS, LOG_LEVEL, ensure_runtime_directories
from database.db import Base, engine, get_db
from database.models import Dataset, Forecast


logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("demand-forecasting")

ensure_runtime_directories()
Base.metadata.create_all(bind=engine)

app = FastAPI(title=APP_NAME, version=APP_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(train_router)
app.include_router(forecast_router)


@app.exception_handler(HTTPException)
def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "message": str(exc.detail)})


@app.exception_handler(Exception)
def unhandled_exception_handler(_: Request, exc: Exception):
    logger.exception("Unhandled application error")
    return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.query(Dataset).first()
        db.query(Forecast).first()
    except Exception as exc:
        logger.exception("Health check failed")
        return {"status": "unhealthy", "message": "Database connection failed"}

    return {"status": "healthy"}
