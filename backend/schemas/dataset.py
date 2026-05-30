from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DatasetRead(BaseModel):
    id: int
    filename: str
    upload_time: datetime

    model_config = ConfigDict(from_attributes=True)


class DatasetUploadResponse(BaseModel):
    message: str
    dataset: DatasetRead
    rows: int
    columns: list[str]