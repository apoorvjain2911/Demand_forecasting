import { useMemo, useState } from 'react'
import { analyzeDataset } from '../api/dashboardApi'
import ForecastTable from '../components/dashboard/ForecastTable'
import KpiCard from '../components/dashboard/KpiCard'
import SectionCard from '../components/dashboard/SectionCard'
import StatPill from '../components/dashboard/StatPill'
import TrendCharts from '../components/dashboard/TrendCharts'
import UploadDropzone from '../components/dashboard/UploadDropzone'
import type { DashboardResponse } from '../types/dashboard'

function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DashboardResponse | null>(null)

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file.')
      return
    }
    setError('')
    setFile(selectedFile)
    setProgress(0)
  }

  const uploadAndAnalyze = async () => {
    if (!file) {
      setError('Choose a CSV file before analyzing the dataset.')
      return
    }

    setLoading(true)
    setError('')
    setProgress(10)

    try {
      const response = await analyzeDataset(file, setProgress)
      setResult(response)
      setProgress(100)
    } catch (uploadError) {
      setError('Analysis failed. Make sure the backend is running and the CSV has the required columns.')
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const summaryLine = useMemo(() => {
    if (!result) {
      return 'Upload a CSV to generate forecasts, recommendations, and executive metrics.'
    }
    return `${result.rows.toLocaleString()} rows analyzed • Inventory health score ${result.inventory_health_score}/100`
  }, [result])

  const handlePrintReport = () => {
    window.print()
  }

  const confidenceSummary = useMemo(() => {
    if (!result) {
      return { high: 0, medium: 0, low: 0 }
    }

    return result.forecast_rows.reduce(
      (summary, row) => {
        if (row.confidence_label === 'High') {
          summary.high += 1
        } else if (row.confidence_label === 'Medium') {
          summary.medium += 1
        } else {
          summary.low += 1
        }
        return summary
      },
      { high: 0, medium: 0, low: 0 },
    )
  }, [result])

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/10 bg-gradient-to-br from-white/8 to-transparent p-8 shadow-glow backdrop-blur-xl lg:p-10">
        <div className="max-w-4xl">
          <div className="text-xs uppercase tracking-[0.45em] text-signal/80">ERP demand intelligence</div>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            ERP Demand Forecasting & Inventory Intelligence
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Upload historical sales data and instantly receive demand forecasts and inventory recommendations.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <StatPill label="Status" value={loading ? 'Processing' : result ? 'Analysis complete' : 'Ready'} />
            <StatPill label="Upload" value={file?.name ?? 'No file selected'} />
            <StatPill label="Summary" value={summaryLine} />
            <button
              type="button"
              onClick={handlePrintReport}
              disabled={!result}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-signal/40 hover:bg-signal/10 disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
            >
              Generate Business Report (PDF)
            </button>
          </div>
        </div>
      </section>

      <SectionCard
        title="Dataset Upload"
        subtitle="Drop a CSV here. The backend will validate the data, preprocess it, train the model, and return insights automatically."
        action={<button type="button" onClick={uploadAndAnalyze} className="rounded-full bg-signal px-5 py-3 text-sm font-semibold text-midnight transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Dataset'}</button>}
      >
        <UploadDropzone
          fileName={file?.name ?? null}
          dragging={dragging}
          progress={progress}
          disabled={loading}
          onFileSelect={handleFile}
          onDropFile={handleFile}
          onDragStateChange={setDragging}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">CSV upload</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">Upload progress</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">Validation messages</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">Loading animation</span>
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        {result ? <div className="mt-4 rounded-2xl border border-signal/25 bg-signal/10 px-4 py-3 text-sm text-signal">{result.message}</div> : null}
      </SectionCard>

      {loading ? <LoadingSkeleton /> : null}

      {result ? (
        <>
          <SectionCard title="Executive Summary" subtitle="A simple view for managers and non-technical users.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {result.kpis.map((kpi) => (
                <KpiCard key={kpi.label} label={kpi.label} value={typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value} hint={kpi.hint} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Forecast Accuracy" subtitle="Model performance metrics interviewers will expect you to explain.">
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard label="MAE" value={result.metrics.mae.toFixed(2)} hint="Average absolute error in units" />
              <KpiCard label="RMSE" value={result.metrics.rmse.toFixed(2)} hint="Penalizes larger misses" />
              <KpiCard label="R² Score" value={result.metrics.r2.toFixed(2)} hint="Higher is better" />
            </div>
          </SectionCard>

          <SectionCard title="Top Growing Products" subtitle="Highest growth opportunities ranked for business review.">
            <div className="grid gap-4 md:grid-cols-3">
              {result.top_growth_products.map((item, index) => (
                <div key={item.product_name} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-[0.25em] text-signal/80">Rank {index + 1}</div>
                  <div className="mt-2 font-display text-xl font-semibold text-white">{item.product_name}</div>
                  <div className="mt-2 text-3xl font-bold text-signal">{item.growth_percent > 0 ? '+' : ''}{item.growth_percent.toFixed(1)}%</div>
                  <div className="mt-2 text-sm text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Demand Forecasting" subtitle="Forecasted demand by product, historical context, and growth signals.">
            <ForecastTable rows={result.forecast_rows} />
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Confidence Mix</div>
                <div className="mt-3 flex items-end gap-3">
                  <div><div className="text-2xl font-bold text-white">{confidenceSummary.high}</div><div className="text-xs text-slate-400">High</div></div>
                  <div><div className="text-2xl font-bold text-white">{confidenceSummary.medium}</div><div className="text-xs text-slate-400">Medium</div></div>
                  <div><div className="text-2xl font-bold text-white">{confidenceSummary.low}</div><div className="text-xs text-slate-400">Low</div></div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Average Confidence</div>
                <div className="mt-3 text-3xl font-bold text-white">{(result.forecast_rows.reduce((sum, row) => sum + row.confidence_level, 0) / Math.max(result.forecast_rows.length, 1)).toFixed(1)}%</div>
                <div className="mt-2 text-sm text-slate-400">Derived from model error and product variability</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Next Month Forecast</div>
                <div className="mt-3 text-3xl font-bold text-white">{result.kpis.find((item) => item.label === 'Forecasted Demand')?.value}</div>
                <div className="mt-2 text-sm text-slate-400">One-step ahead forecast by product</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Inventory Management Insights" subtitle="Automatically generated operational recommendations.">
            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-3">
                {result.inventory_recommendations.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-signal/80">{item.type}</div>
                    <div className="mt-2 text-sm text-slate-200">{item.message}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-signal/15 to-ember/10 p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Inventory Health Score</div>
                <div className="mt-3 font-display text-5xl font-bold text-white">{result.inventory_health_score}</div>
                <div className="mt-2 text-sm text-slate-300">0 means high inventory risk. 100 means healthy inventory alignment.</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Business Insights" subtitle="Natural-language observations written for managers.">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {result.business_insights.map((insight, index) => (
                <div key={`${insight.message}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                  {insight.message}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Visual Analytics" subtitle="Charts rendered with Recharts for business-friendly exploration.">
            <TrendCharts
              monthlySalesTrend={result.chart_data.monthly_sales_trend}
              forecastVsHistorical={result.chart_data.forecast_vs_historical}
              categoryDistribution={result.chart_data.category_distribution}
              inventoryRiskDistribution={result.chart_data.inventory_risk_distribution}
            />
          </SectionCard>
        </>
      ) : null}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6">
      {[1, 2, 3].map((row) => (
        <div key={row} className="animate-pulse rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="h-5 w-56 rounded-full bg-white/10" />
          <div className="mt-4 h-4 w-3/4 rounded-full bg-white/10" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((card) => (
              <div key={card} className="h-24 rounded-3xl bg-white/10" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Dashboard