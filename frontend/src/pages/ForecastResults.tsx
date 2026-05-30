import { useEffect, useState } from 'react'
import api from '../api/client'
import ForecastTable from '../components/ForecastTable'
import SectionCard from '../components/SectionCard'
import type { ForecastItem, ForecastResponse } from '../types'

function ForecastResults() {
  const [history, setHistory] = useState<ForecastItem[]>([])
  const [latest, setLatest] = useState<ForecastItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadHistory = async () => {
    const response = await api.get<ForecastItem[]>('/forecasts')
    setHistory(response.data)
  }

  useEffect(() => {
    void loadHistory().catch(() => setError('Unable to load forecast history.'))
  }, [])

  const handleForecast = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.post<ForecastResponse>('/forecast', {})
      setLatest(response.data.forecasts)
      await loadHistory()
    } catch (forecastError) {
      setError('Forecast generation failed. Train the model first and ensure a dataset is uploaded.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Forecast Generation"
        subtitle="Generate predictions from the trained model and store them in the forecast history table."
      >
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleForecast}
            disabled={loading}
            className="rounded-full bg-signal px-5 py-3 text-sm font-semibold text-midnight transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Generate Forecast'}
          </button>

          {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

          {latest.length ? (
            <div>
              <h3 className="mb-3 font-display text-lg font-semibold text-white">Latest Forecast Run</h3>
              <ForecastTable rows={latest} />
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="Forecast History" subtitle="All generated forecast rows stored in the backend database.">
        <ForecastTable rows={history} />
      </SectionCard>
    </div>
  )
}

export default ForecastResults