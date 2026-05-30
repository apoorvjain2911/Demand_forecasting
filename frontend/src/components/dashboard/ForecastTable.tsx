import { useMemo, useState } from 'react'
import type { ForecastRow } from '../../types/dashboard'

interface ForecastTableProps {
  rows: ForecastRow[]
}

type SortKey = 'product_name' | 'historical_demand' | 'forecasted_demand' | 'growth_percent' | 'confidence_level'

function ForecastTable({ rows }: ForecastTableProps) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('forecasted_demand')
  const [ascending, setAscending] = useState(false)

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return [...rows]
      .filter((row) =>
        [row.product_id, row.product_name, row.recommendation].some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
      .sort((left, right) => {
        const leftValue = left[sortKey]
        const rightValue = right[sortKey]
        if (typeof leftValue === 'string' && typeof rightValue === 'string') {
          return ascending ? leftValue.localeCompare(rightValue) : rightValue.localeCompare(leftValue)
        }
        const leftNumber = Number(leftValue)
        const rightNumber = Number(rightValue)
        return ascending ? leftNumber - rightNumber : rightNumber - leftNumber
      })
  }, [ascending, query, rows, sortKey])

  const exportCsv = () => {
    const headers = ['Product ID', 'Product Name', 'Forecast Quantity', 'Confidence Level', 'Recommendation']
    const csvRows = filteredRows.map((row) => [row.product_id, row.product_name, row.forecasted_demand, row.confidence_level, row.recommendation])
    const csvContent = [headers, ...csvRows].map((line) => line.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'forecast_results.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (!rows.length) {
    return <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-sm text-slate-400">Upload a CSV to populate the forecast table.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-md">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product, ID, or recommendation"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-signal/50"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="product_name">Product</option>
            <option value="historical_demand">Historical Demand</option>
            <option value="forecasted_demand">Forecasted Demand</option>
            <option value="growth_percent">Growth %</option>
            <option value="confidence_level">Confidence Level</option>
          </select>
          <button
            type="button"
            onClick={() => setAscending((value) => !value)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-signal/40 hover:bg-signal/10"
          >
            {ascending ? 'Ascending' : 'Descending'}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-2xl bg-signal px-4 py-3 text-sm font-semibold text-midnight transition hover:brightness-110"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">Product ID</th>
              <th className="px-4 py-3 font-medium">Product Name</th>
              <th className="px-4 py-3 font-medium">Forecast Quantity</th>
              <th className="px-4 py-3 font-medium">Confidence Level</th>
              <th className="px-4 py-3 font-medium">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8 text-slate-100">
            {filteredRows.map((row) => (
              <tr key={`${row.product_id}-${row.product_name}`} className="transition-colors hover:bg-white/5">
                <td className="px-4 py-3">{row.product_id}</td>
                <td className="px-4 py-3">{row.product_name}</td>
                <td className="px-4 py-3 font-medium text-signal">{row.forecasted_demand.toFixed(0)}</td>
                <td className="px-4 py-3">
                  <span className={[
                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]',
                    row.confidence_label === 'High' ? 'bg-emerald-500/15 text-emerald-300' : row.confidence_label === 'Medium' ? 'bg-amber-500/15 text-amber-300' : 'bg-red-500/15 text-red-300',
                  ].join(' ')}>
                    {row.confidence_label} · {row.confidence_level.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{row.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ForecastTable