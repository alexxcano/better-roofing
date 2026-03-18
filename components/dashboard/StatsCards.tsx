import { Users, TrendingUp, DollarSign, Flame } from 'lucide-react'

interface StatsCardsProps {
  totalLeads: number
  leadsThisMonth: number
  averageEstimate: number
  hotLeads: number
}

const cards = (props: StatsCardsProps) => [
  {
    label: 'Total Leads',
    value: props.totalLeads.toString(),
    sub: 'All time',
    icon: Users,
    accent: false,
  },
  {
    label: 'This Month',
    value: props.leadsThisMonth.toString(),
    sub: 'New leads',
    icon: TrendingUp,
    accent: false,
  },
  {
    label: 'Avg. Estimate',
    value: props.averageEstimate > 0 ? `$${Math.round(props.averageEstimate).toLocaleString()}` : '—',
    sub: 'Per lead',
    icon: DollarSign,
    accent: false,
  },
  {
    label: 'Hot Leads',
    value: props.hotLeads.toString(),
    sub: 'Score 8–10 · Call first',
    icon: Flame,
    accent: true,
  },
]

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 border border-stone-300 divide-x divide-stone-300 bg-white">
      {cards(props).map((card) => (
        <div key={card.label} className={`px-6 py-5 ${card.accent ? 'bg-orange-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">{card.label}</p>
            <card.icon className={`h-4 w-4 ${card.accent ? 'text-orange-500' : 'text-stone-400'}`} />
          </div>
          <p className={`font-barlow font-black text-4xl leading-none mb-1 ${card.accent ? 'text-orange-600' : 'text-stone-900'}`}>
            {card.value}
          </p>
          <p className={`text-xs font-semibold uppercase tracking-wide ${card.accent ? 'text-orange-400' : 'text-stone-400'}`}>
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  )
}
