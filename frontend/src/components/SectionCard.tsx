import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  subtitle: string
  children: ReactNode
}

function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-panel/80 p-6 shadow-glow backdrop-blur-xl">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

export default SectionCard