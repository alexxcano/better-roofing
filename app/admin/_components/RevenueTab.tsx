import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/stripe'
import { CreditCard, Mail, CheckCircle, XCircle, BarChart2 } from 'lucide-react'

const PLAN_PRICES = { STARTER: PLANS.STARTER.price, PRO: PLANS.PRO.price }

export async function RevenueTab() {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [
    activeSubsByPlan,
    upcomingRenewals,
    allTrialing,
    subscriptionsByStatus,
  ] = await Promise.all([
    prisma.subscription.findMany({
      where: { status: 'active' },
      select: { plan: true },
    }),
    prisma.subscription.findMany({
      where: { status: 'active', currentPeriodEnd: { lte: thirtyDaysFromNow, gte: now } },
      include: { contractor: { select: { companyName: true, notificationEmail: true } } },
      orderBy: { currentPeriodEnd: 'asc' },
    }),
    prisma.subscription.findMany({
      where: { status: 'trialing' },
      select: {
        id: true,
        contractorId: true,
        trialEndsAt: true,
        contractor: {
          select: {
            companyName: true,
            notificationEmail: true,
            onboardingCompleted: true,
            _count: { select: { leads: true } },
          },
        },
      },
      orderBy: { trialEndsAt: 'asc' },
    }),
    prisma.subscription.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  const starterCount = activeSubsByPlan.filter((s) => s.plan === 'STARTER').length
  const proCount = activeSubsByPlan.filter((s) => s.plan === 'PRO').length
  const starterMRR = starterCount * PLAN_PRICES.STARTER
  const proMRR = proCount * PLAN_PRICES.PRO
  const totalMRR = starterMRR + proMRR

  const statusMap = Object.fromEntries(subscriptionsByStatus.map((s) => [s.status, s._count._all]))

  const mrrAtRisk = upcomingRenewals.reduce(
    (sum, sub) => sum + (PLAN_PRICES[sub.plan as keyof typeof PLAN_PRICES] ?? PLAN_PRICES.STARTER),
    0
  )

  return (
    <div className="space-y-8">
      {/* MRR Breakdown */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">MRR Breakdown by Plan</p>
        <div className="border border-stone-300 bg-white">
          <div className="grid grid-cols-3 divide-x divide-stone-200">
            {/* STARTER */}
            <div className="px-6 py-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Starter — ${PLAN_PRICES.STARTER}/mo</p>
              <p className="font-barlow font-black text-4xl leading-none text-stone-900">${starterMRR.toLocaleString()}</p>
              <p className="text-xs text-stone-400 font-semibold mt-2">{starterCount} subscribers</p>
              <div className="mt-3 bg-stone-100 h-1.5">
                <div
                  className="h-1.5 bg-stone-400"
                  style={{ width: totalMRR > 0 ? `${Math.round((starterMRR / totalMRR) * 100)}%` : '0%' }}
                />
              </div>
              <p className="text-[10px] text-stone-400 font-semibold mt-1">
                {totalMRR > 0 ? Math.round((starterMRR / totalMRR) * 100) : 0}% of MRR
              </p>
            </div>

            {/* PRO */}
            <div className="px-6 py-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Pro — ${PLAN_PRICES.PRO}/mo</p>
              <p className="font-barlow font-black text-4xl leading-none text-stone-900">${proMRR.toLocaleString()}</p>
              <p className="text-xs text-stone-400 font-semibold mt-2">{proCount} subscribers</p>
              <div className="mt-3 bg-stone-100 h-1.5">
                <div
                  className="h-1.5 bg-orange-500"
                  style={{ width: totalMRR > 0 ? `${Math.round((proMRR / totalMRR) * 100)}%` : '0%' }}
                />
              </div>
              <p className="text-[10px] text-stone-400 font-semibold mt-1">
                {totalMRR > 0 ? Math.round((proMRR / totalMRR) * 100) : 0}% of MRR
              </p>
            </div>

            {/* Subscription health */}
            <div className="px-6 py-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Subscription Health</p>
              <div className="space-y-2">
                {[
                  { label: 'Active', key: 'active', color: 'text-green-600 border-green-300 bg-green-50' },
                  { label: 'Trialing', key: 'trialing', color: 'text-orange-600 border-orange-300 bg-orange-50' },
                  { label: 'Inactive', key: 'inactive', color: 'text-stone-500 border-stone-300 bg-stone-100' },
                ].map(({ label, key, color }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 ${color}`}>{label}</span>
                    <span className="text-sm font-black text-stone-900">{statusMap[key] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Renewals */}
        <div className="border border-stone-300 bg-white">
          <div className="px-5 py-3 bg-stone-100 border-b border-stone-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-stone-500" />
              <p className="text-xs font-black uppercase tracking-widest text-stone-600">
                Renewals (Next 30 Days) — {upcomingRenewals.length}
              </p>
            </div>
            {mrrAtRisk > 0 && (
              <span className="text-[10px] font-black text-stone-600 border border-stone-300 bg-stone-100 px-2 py-0.5">
                ${mrrAtRisk} at renewal
              </span>
            )}
          </div>
          {upcomingRenewals.length === 0 ? (
            <p className="px-5 py-4 text-xs text-stone-400 font-semibold uppercase tracking-wide">No renewals in next 30 days</p>
          ) : (
            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
              {upcomingRenewals.map((sub) => {
                const daysUntil = Math.ceil(
                  (new Date(sub.currentPeriodEnd!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <div key={sub.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-stone-900 truncate">{sub.contractor.companyName}</p>
                      <p className="text-[10px] text-stone-400 font-semibold mt-0.5 uppercase tracking-wide">
                        {sub.plan} · ${PLAN_PRICES[sub.plan as keyof typeof PLAN_PRICES]}/mo
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sub.contractor.notificationEmail && (
                        <a
                          href={`mailto:${sub.contractor.notificationEmail}`}
                          title={sub.contractor.notificationEmail}
                          className="text-stone-400 hover:text-orange-500 transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <span className={`text-xs font-black border px-2 py-0.5 ${
                        daysUntil <= 3
                          ? 'text-red-600 border-red-300 bg-red-50'
                          : daysUntil <= 7
                            ? 'text-orange-600 border-orange-300 bg-orange-50'
                            : 'text-stone-600 border-stone-300 bg-stone-50'
                      }`}>
                        {daysUntil}d
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Trial Reminder Status */}
        <div className="border border-stone-300 bg-white">
          <div className="px-5 py-3 bg-stone-100 border-b border-stone-300 flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-stone-500" />
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">
              Active Trials — Reminder Status ({allTrialing.length})
            </p>
          </div>
          {allTrialing.length === 0 ? (
            <p className="px-5 py-4 text-xs text-stone-400 font-semibold uppercase tracking-wide">No active trials</p>
          ) : (
            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
              {allTrialing.map((sub) => {
                const daysLeft = sub.trialEndsAt
                  ? Math.ceil((new Date(sub.trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                  : null
                const expired = daysLeft !== null && daysLeft <= 0
                const leadCount = sub.contractor._count.leads
                const onboarded = sub.contractor.onboardingCompleted

                return (
                  <div key={sub.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-bold text-stone-900 truncate">{sub.contractor.companyName}</p>
                      <span className={`text-[10px] font-black border px-2 py-0.5 flex-shrink-0 ${
                        expired
                          ? 'text-red-600 border-red-300 bg-red-50'
                          : daysLeft !== null && daysLeft <= 3
                            ? 'text-orange-600 border-orange-300 bg-orange-50'
                            : 'text-stone-600 border-stone-300 bg-stone-100'
                      }`}>
                        {expired ? 'Expired' : daysLeft !== null ? `${daysLeft}d left` : '—'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Onboarding status */}
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest border px-1.5 py-0.5 ${
                        onboarded
                          ? 'text-green-700 border-green-200 bg-green-50'
                          : 'text-stone-400 border-stone-200 bg-stone-50'
                      }`}>
                        {onboarded
                          ? <CheckCircle className="h-2.5 w-2.5" />
                          : <XCircle className="h-2.5 w-2.5" />
                        }
                        Setup
                      </span>
                      {/* Lead count */}
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest border px-1.5 py-0.5 ${
                        leadCount > 0
                          ? 'text-stone-700 border-stone-300 bg-stone-100'
                          : 'text-stone-400 border-stone-200 bg-stone-50'
                      }`}>
                        <BarChart2 className="h-2.5 w-2.5" />
                        {leadCount} lead{leadCount !== 1 ? 's' : ''}
                      </span>
                      {/* Email */}
                      {sub.contractor.notificationEmail && (
                        <a
                          href={`mailto:${sub.contractor.notificationEmail}`}
                          title={sub.contractor.notificationEmail}
                          className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest border px-1.5 py-0.5 text-stone-600 border-stone-300 bg-white hover:bg-stone-50 transition-colors"
                        >
                          <Mail className="h-2.5 w-2.5" />
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
