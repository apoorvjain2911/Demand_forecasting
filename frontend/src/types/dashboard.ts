export interface DashboardKpi {
  label: string
  value: number | string
  hint: string
}

export interface DashboardChartPoint {
  label: string
  historical: number
  forecast: number
}

export interface DashboardCategoryPoint {
  label: string
  value: number
}

export interface ForecastRow {
  product_id: string
  product_name: string
  historical_demand: number
  forecasted_demand: number
  growth_percent: number
  confidence_level: number
  confidence_label: string
  recommendation: string
}

export interface InventoryRecommendation {
  type: string
  message: string
}

export interface BusinessInsight {
  message: string
}

export interface DashboardResponse {
  dataset_id: number
  filename: string
  upload_time: string
  rows: number
  columns: string[]
  metrics: {
    mae: number
    rmse: number
    r2: number
  }
  kpis: DashboardKpi[]
  chart_data: {
    monthly_sales_trend: DashboardChartPoint[]
    forecast_vs_historical: DashboardChartPoint[]
    category_distribution: DashboardCategoryPoint[]
    inventory_risk_distribution: DashboardCategoryPoint[]
  }
  forecast_rows: ForecastRow[]
  top_growth_products: Array<{
    product_name: string
    growth_percent: number
    label: string
  }>
  inventory_recommendations: InventoryRecommendation[]
  business_insights: BusinessInsight[]
  inventory_health_score: number
  message: string
}