import { useState } from 'react'
import api from '../api/client'
import SectionCard from '../components/SectionCard'
import type { TrainingResponse } from '../types'

function TrainModel() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TrainingResponse | null>(null)

  const handleTrain = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.post<TrainingResponse>('/train', {})
      setResult(response.data)
    } catch (trainingError) {
      setError('Training failed. Upload a valid dataset first.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard
      title="Train Model"
      subtitle="Build the XGBoost regressor, evaluate it on a time-based split, and persist the model artifact."
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleTrain}
          disabled={loading}
          className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Training...' : 'Train Model'}
        </button>

        {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

        {result ? (
          <div className="grid gap-4 md:grid-cols-3">
            <MetricBox label="MAE" value={result.metrics.mae.toFixed(4)} />
            <MetricBox label="RMSE" value={result.metrics.rmse.toFixed(4)} />
            <MetricBox label="R2" value={result.metrics.r2.toFixed(4)} />
          </div>
        ) : null}

        {result ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">{result.message}</p>
            <p>Dataset ID: {result.dataset_id}</p>
            <p>Model path: {result.model_path}</p>
          </div>
        ) : null}
      </div>
    </SectionCard>
  )
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-panelSoft/70 p-4">
      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

export default TrainModel