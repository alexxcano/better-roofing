import { prisma } from '@/lib/prisma'
import { Users, BarChart2, CreditCard } from 'lucide-react'

export default async function AdminPage() {
  const [totalContractors, totalLeads, activeSubscriptions, contractors] = await Promise.all([
    prisma.contractor.count(),
    prisma.lead.count(),
    prisma.subscription.count({ where: { status: { in: ['active', 'trialing'] } } }),
    prisma.contractor.findMany({
      include: {
        _count: { select: { leads: true } },
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const stats = [
    { label: 'Total Contractors', value: totalContractors, icon: Users },
    { label: 'Total Leads', value: totalLeads, icon: BarChart2 },
    { label: 'Active Subscriptions', value: activeSubscriptions, icon: CreditCard },
  ]

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none">Admin Dashboard</h1>
        <p className="text-stone-500 text-sm font-semibold mt-1 uppercase tracking-wide">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border border-stone-300 divide-x divide-stone-300 bg-white">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-500">{s.label}</p>
              <s.icon className="h-4 w-4 text-stone-400" />
            </div>
            <p className="font-barlow font-black text-4xl leading-none text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Contractors table */}
      <div className="border-2 border-stone-300 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300">
          <p className="text-xs font-black uppercase tracking-widest text-stone-600">All Contractors</p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_80px_100px_120px_110px] bg-stone-100 border-b-2 border-stone-300">
          {['Company', 'Leads', 'Plan', 'Status', 'Joined'].map((h) => (
            <div key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-stone-500 border-r border-stone-200 last:border-r-0">
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {contractors.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-stone-400 font-semibold uppercase tracking-wide text-sm">No contractors yet</p>
          </div>
        ) : (
          contractors.map((c, i) => {
            const status = c.subscription?.status || 'inactive'
            const statusStyle =
              status === 'active'
                ? 'border-green-400 bg-green-50 text-green-700'
                : status === 'trialing'
                ? 'border-orange-400 bg-orange-50 text-orange-700'
                : 'border-stone-300 bg-stone-100 text-stone-500'

            return (
              <div
                key={c.id}
                className={`grid grid-cols-[1fr_80px_100px_120px_110px] border-t border-stone-200 hover:bg-stone-50 transition-colors ${i % 2 === 1 ? 'bg-stone-50/50' : ''}`}
              >
                <div className="px-4 py-3 border-r border-stone-100">
                  <p className="font-bold text-stone-900 text-sm">{c.companyName}</p>
                  <p className="text-xs text-stone-400 mt-0.5 font-semibold">{c.id.slice(0, 8)}…</p>
                </div>
                <div className="px-4 py-3 border-r border-stone-100 flex items-center">
                  <span className="font-bold text-stone-900 text-sm">{c._count.leads}</span>
                </div>
                <div className="px-4 py-3 border-r border-stone-100 flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wide border border-stone-300 bg-stone-100 px-2 py-1 text-stone-600">
                    {c.subscription?.plan || 'None'}
                  </span>
                </div>
                <div className="px-4 py-3 border-r border-stone-100 flex items-center">
                  <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border ${statusStyle}`}>
                    {status}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-stone-400 font-semibold">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
