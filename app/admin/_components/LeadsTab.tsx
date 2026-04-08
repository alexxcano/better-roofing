import { prisma } from '@/lib/prisma'
import { BarChart2, Target, DollarSign, Trophy } from 'lucide-react'
import { MetricCard } from './MetricCard'

const PIPELINE_ORDER = ['new', 'contacted', 'quoted', 'won', 'lost']

const PIPELINE_STYLE: Record<string, string> = {
  new: 'bg-stone-400',
  contacted: 'bg-blue-400',
  quoted: 'bg-orange-400',
  won: 'bg-green-500',
  lost: 'bg-red-400',
}

const PIPELINE_LABEL_STYLE: Record<string, string> = {
  new: 'text-stone-600 border-stone-300 bg-stone-100',
  contacted: 'text-blue-700 border-blue-200 bg-blue-50',
  quoted: 'text-orange-700 border-orange-200 bg-orange-50',
  won: 'text-green-700 border-green-200 bg-green-50',
  lost: 'text-red-700 border-red-200 bg-red-50',
}

function BreakdownBar({ label, count, total, colorClass }: { label: string; count: number; total: number; colorClass: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
      <p className="text-xs font-bold text-stone-700 capitalize w-24 shrink-0">{label}</p>
      <div className="flex-1 bg-stone-100 h-2">
        <div className={`h-2 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs font-black text-stone-900 w-8 text-right">{count}</p>
      <p className="text-[10px] font-semibold text-stone-400 w-8 text-right">{pct}%</p>
    </div>
  )
}

export async function LeadsTab() {
  const [
    totalLeads,
    leadsAggregate,
    pipelineByStatus,
    insuranceBreakdown,
    outOfAreaCount,
    materialBreakdown,
    slopeBreakdown,
    topContractors,
    avgScoreLast30,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.aggregate({
      _avg: { leadScore: true, estimateLow: true, estimateHigh: true },
    }),
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ['insuranceClaim'], _count: { _all: true } }),
    prisma.lead.count({ where: { outOfArea: true } }),
    prisma.lead.groupBy({ by: ['materialType'], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ['roofSlope'], _count: { _all: true } }),
    prisma.contractor.findMany({
      select: { companyName: true, _count: { select: { leads: true } } },
      orderBy: { leads: { _count: 'desc' } },
      take: 8,
    }),
    prisma.lead.aggregate({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      _avg: { leadScore: true },
    }),
  ])

  const avgJobValue =
    leadsAggregate._avg.estimateLow != null && leadsAggregate._avg.estimateHigh != null
      ? Math.round((leadsAggregate._avg.estimateLow + leadsAggregate._avg.estimateHigh) / 2)
      : null

  const avgScore = leadsAggregate._avg.leadScore != null
    ? leadsAggregate._avg.leadScore.toFixed(1)
    : '—'

  const pipelineMap = Object.fromEntries(
    pipelineByStatus.map((s) => [s.status, s._count._all])
  )
  const wonCount = pipelineMap['won'] ?? 0
  const lostCount = pipelineMap['lost'] ?? 0
  const winRate =
    wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : null

  const outOfAreaPct = totalLeads > 0 ? Math.round((outOfAreaCount / totalLeads) * 100) : 0

  const materialMap = Object.fromEntries(materialBreakdown.map((m) => [m.materialType, m._count._all]))
  const slopeMap = Object.fromEntries(slopeBreakdown.map((s) => [s.roofSlope, s._count._all]))
  const insuranceMap = Object.fromEntries(insuranceBreakdown.map((i) => [i.insuranceClaim, i._count._all]))

  const maxContractorLeads = Math.max(...topContractors.map((c) => c._count.leads), 1)

  return (
    <div className="space-y-8">
      {/* Top metrics */}
      <div className="grid grid-cols-4 border border-stone-300 divide-x divide-stone-300 bg-white">
        <MetricCard label="Total Leads" value={totalLeads.toLocaleString()} icon={BarChart2} />
        <MetricCard
          label="Avg Lead Score"
          value={avgScore}
          icon={Target}
          sub={avgScoreLast30._avg.leadScore != null ? `${avgScoreLast30._avg.leadScore.toFixed(1)} last 30d` : undefined}
        />
        <MetricCard
          label="Avg Job Value"
          value={avgJobValue != null ? `$${avgJobValue.toLocaleString()}` : '—'}
          icon={DollarSign}
          sub="midpoint of estimate range"
        />
        <MetricCard
          label="Win Rate"
          value={winRate != null ? `${winRate}%` : '—'}
          icon={Trophy}
          sub={`${wonCount} won · ${lostCount} lost`}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="border border-stone-300 bg-white">
          <div className="px-5 py-3 bg-stone-100 border-b border-stone-300">
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">Pipeline Funnel</p>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Lead status distribution across all contractors</p>
          </div>
          <div className="px-5 py-3">
            {PIPELINE_ORDER.map((status) => (
              <BreakdownBar
                key={status}
                label={status}
                count={pipelineMap[status] ?? 0}
                total={totalLeads}
                colorClass={PIPELINE_STYLE[status]}
              />
            ))}
          </div>
          <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex flex-wrap gap-2">
            {PIPELINE_ORDER.map((s) => (
              <span key={s} className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${PIPELINE_LABEL_STYLE[s]}`}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Top Contractors by Leads */}
        <div className="border border-stone-300 bg-white">
          <div className="px-5 py-3 bg-stone-100 border-b border-stone-300">
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">Top Contractors by Leads</p>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">All-time lead generation</p>
          </div>
          <div className="px-5 py-3">
            {topContractors.map((c) => (
              <div key={c.companyName} className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
                <p className="text-xs font-bold text-stone-700 w-32 shrink-0 truncate">{c.companyName}</p>
                <div className="flex-1 bg-stone-100 h-2">
                  <div
                    className="h-2 bg-orange-400"
                    style={{ width: `${Math.round((c._count.leads / maxContractorLeads) * 100)}%` }}
                  />
                </div>
                <p className="text-xs font-black text-stone-900 w-8 text-right">{c._count.leads}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Material Types */}
        <div className="border border-stone-300 bg-white">
          <div className="px-5 py-3 bg-stone-100 border-b border-stone-300">
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">Material Type</p>
          </div>
          <div className="px-5 py-3">
            {['asphalt', 'metal', 'tile', 'flat'].map((m) => (
              <BreakdownBar key={m} label={m} count={materialMap[m] ?? 0} total={totalLeads} colorClass="bg-stone-500" />
            ))}
          </div>
        </div>

        {/* Roof Slope */}
        <div className="border border-stone-300 bg-white">
          <div className="px-5 py-3 bg-stone-100 border-b border-stone-300">
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">Roof Slope</p>
          </div>
          <div className="px-5 py-3">
            {['flat', 'low', 'medium', 'steep'].map((s) => (
              <BreakdownBar key={s} label={s} count={slopeMap[s] ?? 0} total={totalLeads} colorClass="bg-orange-400" />
            ))}
          </div>
        </div>

        {/* Insurance & Out-of-Area */}
        <div className="space-y-6">
          <div className="border border-stone-300 bg-white">
            <div className="px-5 py-3 bg-stone-100 border-b border-stone-300">
              <p className="text-xs font-black uppercase tracking-widest text-stone-600">Insurance Claim</p>
            </div>
            <div className="px-5 py-3">
              {['yes', 'no', 'unsure'].map((v) => (
                <BreakdownBar key={v} label={v} count={insuranceMap[v] ?? 0} total={totalLeads} colorClass="bg-blue-400" />
              ))}
            </div>
          </div>

          <div className="border border-stone-300 bg-white">
            <div className="px-5 py-3 bg-stone-100 border-b border-stone-300">
              <p className="text-xs font-black uppercase tracking-widest text-stone-600">Out-of-Area Leads</p>
            </div>
            <div className="px-5 py-4 flex items-end gap-3">
              <p className="font-barlow font-black text-4xl leading-none text-stone-900">{outOfAreaPct}%</p>
              <div className="pb-1">
                <p className="text-xs text-stone-500 font-semibold">{outOfAreaCount} of {totalLeads} leads</p>
                <p className="text-[10px] text-stone-400 font-semibold mt-0.5">outside service areas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
