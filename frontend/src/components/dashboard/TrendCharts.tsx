import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReactNode } from 'react'
import type { DashboardCategoryPoint, DashboardChartPoint } from '../../types/dashboard'

interface TrendChartsProps {
  monthlySalesTrend: DashboardChartPoint[]
  forecastVsHistorical: DashboardChartPoint[]
  categoryDistribution: DashboardCategoryPoint[]
  inventoryRiskDistribution: DashboardCategoryPoint[]
}

const palette = ['#2dd4bf', '#f97316', '#60a5fa', '#f59e0b', '#a78bfa', '#34d399']

function TrendCharts({ monthlySalesTrend, forecastVsHistorical, categoryDistribution, inventoryRiskDistribution }: TrendChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartPanel title="Sales Trend Line Chart">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlySalesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#0f1b2d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Line type="monotone" dataKey="historical" stroke="#2dd4bf" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="forecast" stroke="#f97316" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Forecast Trend Line Chart">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={forecastVsHistorical}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#0f1b2d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Area type="monotone" dataKey="forecast" stroke="#2dd4bf" fill="#2dd4bf33" />
            <Area type="monotone" dataKey="historical" stroke="#60a5fa" fill="#60a5fa22" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Category-wise Demand Distribution">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={categoryDistribution} dataKey="value" nameKey="label" innerRadius={55} outerRadius={95} paddingAngle={4}>
              {categoryDistribution.map((entry, index) => (
                <Cell key={entry.label} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f1b2d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Inventory Risk Distribution">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={inventoryRiskDistribution} dataKey="value" nameKey="label" innerRadius={55} outerRadius={95} paddingAngle={4}>
              {inventoryRiskDistribution.map((entry, index) => (
                <Cell key={entry.label} fill={palette[(index + 2) % palette.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f1b2d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  )
}

function ChartPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <h3 className="mb-4 font-display text-lg font-semibold text-white">{title}</h3>
      {children}
    </div>
  )
}

export default TrendCharts