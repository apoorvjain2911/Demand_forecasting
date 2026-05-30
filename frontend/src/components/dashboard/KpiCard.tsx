interface KpiCardProps {
  label: string
  value: string | number
  hint: string
}

function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-panel/75 p-5 shadow-glow backdrop-blur-xl">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</div>
      <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{hint}</div>
    </div>
  )
}

export default KpiCard