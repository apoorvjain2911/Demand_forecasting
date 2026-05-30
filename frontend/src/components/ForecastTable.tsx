import type { ForecastItem } from '../types'

interface ForecastTableProps {
  rows: ForecastItem[]
}

function ForecastTable({ rows }: ForecastTableProps) {
  if (!rows.length) {
    return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-sm text-slate-400">No forecast data yet.</div>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm">
        <thead className="bg-white/5 text-slate-300">
          <tr>
            <th className="px-4 py-3 font-medium">Prediction Date</th>
            <th className="px-4 py-3 font-medium">Product ID</th>
            <th className="px-4 py-3 font-medium">Predicted Demand</th>
            <th className="px-4 py-3 font-medium">Created At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8 text-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-white/5">
              <td className="px-4 py-3">{new Date(row.prediction_date).toLocaleDateString()}</td>
              <td className="px-4 py-3">{row.product_id}</td>
              <td className="px-4 py-3 font-medium text-signal">{row.predicted_demand.toFixed(2)}</td>
              <td className="px-4 py-3 text-slate-400">{new Date(row.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ForecastTable