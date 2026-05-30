import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-midnight text-frost">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.12),_transparent_28%),linear-gradient(180deg,_#07111f_0%,_#0a1424_44%,_#04070d_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-glow backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-signal/80">ERP analytics</p>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Demand Forecasting Control Center
              </h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Single-page dashboard • upload once, analyze instantly
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

export default App