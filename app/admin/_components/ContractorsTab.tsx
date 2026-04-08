import { prisma } from '@/lib/prisma'
import { AlertTriangle } from 'lucide-react'

function SetupDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 border ${
        ok
          ? 'text-green-700 border-green-200 bg-green-50'
          : 'text-stone-400 border-stone-200 bg-stone-50'
      }`}
    >
      {ok ? '✓' : '—'} {label}
    </span>
  )
}

export async function ContractorsTab({
  search,
  status: statusFilter,
}: {
  search: string
  status: string
}) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const contractorWhere = {
    ...(search ? { companyName: { contains: search, mode: 'insensitive' as const } } : {}),
    ...(['active', 'trialing', 'inactive'].includes(statusFilter)
      ? { subscription: { status: statusFilter } }
      : {}),
  }

  const [
    contractors,
    totalContractors,
    noEmailCount,
    proNoWebhookCount,
    noPricingCount,
    notOnboardedCount,
  ] = await Promise.all([
    prisma.contractor.findMany({
      where: contractorWhere,
      include: {
        _count: { select: { leads: true } },
        subscription: true,
        leads: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
        pricingSettings: { select: { id: true } },
        weeklyReports: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.contractor.count(),
    prisma.contractor.count({ where: { notificationEmail: null } }),
    prisma.contractor.count({
      where: { subscription: { plan: 'PRO', status: 'active' }, webhookUrl: null },
    }),
    prisma.contractor.count({ where: { pricingSettings: { is: null } } }),
    prisma.contractor.count({ where: { onboardingCompleted: false } }),
  ])

  const attentionItems = [
    { label: 'Not onboarded', count: notOnboardedCount, urgent: notOnboardedCount > 0 },
    { label: 'No notification email', count: noEmailCount, urgent: noEmailCount > 0 },
    { label: 'PRO without webhook', count: proNoWebhookCount, urgent: proNoWebhookCount > 0 },
    { label: 'Pricing not configured', count: noPricingCount, urgent: false },
  ]

  return (
    <div className="space-y-6">
      {/* Setup Issues Summary */}
      <div className="border border-stone-300 bg-white">
        <div className="px-5 py-3 bg-stone-100 border-b border-stone-300 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-stone-400" />
          <p className="text-xs font-black uppercase tracking-widest text-stone-600">Setup Issues</p>
        </div>
        <div className="grid grid-cols-4 divide-x divide-stone-200">
          {attentionItems.map((item) => (
            <div key={item.label} className="px-5 py-4">
              <p
                className={`font-barlow font-black text-3xl leading-none ${
                  item.urgent && item.count > 0 ? 'text-orange-500' : 'text-stone-900'
                }`}
              >
                {item.count}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1.5">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contractors Table */}
      <div className="border-2 border-stone-300 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs font-black uppercase tracking-widest text-stone-600 shrink-0">
            Contractors{search || statusFilter ? ' (filtered)' : ` (${totalContractors})`}
          </p>
          <form method="GET" className="flex items-center gap-2">
            <input type="hidden" name="tab" value="contractors" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name…"
              className="text-xs border border-stone-300 px-3 py-1.5 bg-white font-semibold text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 w-48"
            />
            <select
              name="status"
              defaultValue={statusFilter}
              className="text-xs border border-stone-300 px-2 py-1.5 bg-white font-semibold text-stone-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              type="submit"
              className="text-xs font-black uppercase tracking-widest px-3 py-1.5 bg-stone-900 text-white hover:bg-stone-700 transition-colors"
            >
              Filter
            </button>
            {(search || statusFilter) && (
              <a href="/admin?tab=contractors" className="text-xs font-bold text-stone-500 underline hover:text-stone-700">
                Clear
              </a>
            )}
          </form>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_70px_90px_110px_100px_100px] bg-stone-100 border-b-2 border-stone-300">
          {['Company', 'Leads', 'Plan', 'Status', 'Last Lead', 'Joined'].map((h) => (
            <div key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-stone-500 border-r border-stone-200 last:border-r-0">
              {h}
            </div>
          ))}
        </div>

        {contractors.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-stone-400 font-semibold uppercase tracking-wide text-sm">No contractors found</p>
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

            const lastLead = c.leads[0]
            const lastLeadDate = lastLead ? new Date(lastLead.createdAt) : null
            const daysSinceLastLead = lastLeadDate
              ? Math.floor((now.getTime() - lastLeadDate.getTime()) / (1000 * 60 * 60 * 24))
              : null
            const isDormant = c._count.leads > 0 && daysSinceLastLead !== null && daysSinceLastLead > 30

            const trialEnd = c.subscription?.trialEndsAt
            const trialExpiringSoon =
              status === 'trialing' && trialEnd && new Date(trialEnd).getTime() < sevenDaysFromNow.getTime()

            const lastReport = c.weeklyReports[0]
            const hasPricing = c.pricingSettings !== null
            const hasEmail = c.notificationEmail !== null
            const hasWebhook = c.webhookUrl !== null
            const hasBooking = c.bookingUrl !== null

            return (
              <div
                key={c.id}
                className={`grid grid-cols-[1fr_70px_90px_110px_100px_100px] border-t border-stone-200 hover:bg-stone-50 transition-colors ${i % 2 === 1 ? 'bg-stone-50/50' : ''}`}
              >
                <div className="px-4 py-3 border-r border-stone-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-stone-900 text-sm">{c.companyName}</p>
                    {isDormant && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-600 border border-red-200 bg-red-50 px-1.5 py-0.5">dormant</span>
                    )}
                    {trialExpiringSoon && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 border border-orange-200 bg-orange-50 px-1.5 py-0.5">expiring</span>
                    )}
                    {!c.onboardingCompleted && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 border border-stone-200 bg-stone-50 px-1.5 py-0.5">setup</span>
                    )}
                  </div>
                  {/* Setup indicators */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <SetupDot ok={hasEmail} label="Email" />
                    <SetupDot ok={hasWebhook} label="Webhook" />
                    <SetupDot ok={hasBooking} label="Booking" />
                    <SetupDot ok={hasPricing} label="Pricing" />
                    {lastReport && (
                      <span className="text-[9px] font-semibold text-stone-400">
                        report {Math.floor((now.getTime() - new Date(lastReport.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d ago
                      </span>
                    )}
                  </div>
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
                <div className="px-4 py-3 border-r border-stone-100 flex items-center">
                  {lastLeadDate ? (
                    <p className="text-xs text-stone-500 font-semibold">
                      {daysSinceLastLead === 0 ? 'Today' : daysSinceLastLead === 1 ? 'Yesterday' : `${daysSinceLastLead}d ago`}
                    </p>
                  ) : (
                    <p className="text-xs text-stone-300 font-semibold">No leads</p>
                  )}
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-stone-400 font-semibold">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
