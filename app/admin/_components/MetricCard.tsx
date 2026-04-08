import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ComponentType } from 'react'

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  sub,
}: {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
  trend?: number | null
  sub?: string
}) {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">{label}</p>
        <Icon className="h-4 w-4 text-stone-400" />
      </div>
      <p className="font-barlow font-black text-4xl leading-none text-stone-900">{value}</p>
      {(trend !== undefined && trend !== null) || sub ? (
        <div className="flex items-center gap-2 mt-2">
          {trend !== undefined && trend !== null && (
            <span
              className={`text-xs font-black flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}
            >
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend >= 0 ? '+' : ''}
              {trend}%
            </span>
          )}
          {sub && <p className="text-xs text-stone-400 font-semibold">{sub}</p>}
        </div>
      ) : null}
    </div>
  )
}
