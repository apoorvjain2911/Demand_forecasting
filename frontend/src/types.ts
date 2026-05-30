export interface HealthResponse {
  status: string
  database: string
  model_available: boolean
  dataset_count: number
  forecast_count: number
}

export interface DatasetUploadResponse {
  message: string
  dataset: {
    id: number
    filename: string
    upload_time: string
  }
  rows: number
  columns: string[]
}

export interface TrainingResponse {
  message: string
  dataset_id: number
  metrics: {
    mae: number
    rmse: number
    r2: number
  }
  model_path: string
}

export interface ForecastItem {
  id: number
  prediction_date: string
  product_id: string
  predicted_demand: number
  created_at: string
}

export interface ForecastResponse {
  message: string
  count: number
  forecasts: ForecastItem[]
}