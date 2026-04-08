import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/stripe'
import { Users, BarChart2, CreditCard, TrendingUp, AlertTriangle, Ticket, CheckCircle } from 'lucide-react'
import { MetricCard } from './MetricCard'
import { AlertPanel, type AlertRow } from './AlertPanel'

const PLAN_PRICES: Record<string, number> = {
  STARTER: PLANS.STARTER.price,
  PRO: PLANS.PRO.price,
}

export async function OverviewTab() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalContractors,
    activeSubscriptions,
    trialingCount,
    inactiveWithTrialCount,
    activeWithTrialCount,
    leadsLast30,
    leadsPrev30,
    onboardingCompletedCount,
    dormantCount,
    trialsExpiringSoon,
    openTickets,
    signupsThisMonth,
    signupsLastMonth,
    weeklyLeadCounts,
  ] = await Promise.all([
    prisma.contractor.count(),
    prisma.subscription.findMany({ where: { status: 'active' }, select: { plan: true } }),
    prisma.subscription.count({ where: { status: 'trialing' } }),
    prisma.subscription.count({
      where: { status: { not: 'active' }, trialEndsAt: { not: null, lte: now } },
    }),
    prisma.subscription.count({ where: { status: 'active', trialEndsAt: { not: null } } }),
    prisma.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.contractor.count({ where: { onboardingCompleted: true } }),
    prisma.contractor.count({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        leads: { none: { createdAt: { gte: thirtyDaysAgo } } },
      },
    }),
    prisma.subscription.findMany({
      where: { status: 'trialing', trialEndsAt: { lte: sevenDaysFromNow } },
      include: { contractor: { select: { companyName: true } } },
      orderBy: { trialEndsAt: 'asc' },
    }),
    prisma.supportTicket.findMany({
      where: { status: { in: ['open', 'in_progress'] } },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, subject: true, category: true, companyName: true, status: true },
    }),
    prisma.contractor.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.contractor.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    Promise.all(
      Array.from({ length: 8 }, (_, i) => {
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
        return prisma.lead.count({ where: { createdAt: { gte: weekStart, lt: weekEnd } } })
      })
    ),
  ])

  const mrr = activeSubscriptions.reduce((sum: number, sub) => sum + (PLAN_PRICES[sub.plan] ?? 49), 0)
  const arr = mrr * 12
  const trialConversionDenominator = activeWithTrialCount + inactiveWithTrialCount
  const trialConversionRate =
    trialConversionDenominator > 0
      ? Math.round((activeWithTrialCount / trialConversionDenominator) * 100)
      : null
  const lead30dTrend =
    leadsPrev30 > 0 ? Math.round(((leadsLast30 - leadsPrev30) / leadsPrev30) * 100) : null
  const onboardingRate =
    totalContractors > 0 ? Math.round((onboardingCompletedCount / totalContractors) * 100) : 0
  const signupTrend =
    signupsLastMonth > 0
      ? Math.round(((signupsThisMonth - signupsLastMonth) / signupsLastMonth) * 100)
      : null
  const chartData = [...weeklyLeadCounts].reverse()
  const maxWeeklyLeads = Math.max(...chartData, 1)
  const totalOpenTickets = openTickets.length

  const trialRows: AlertRow[] = trialsExpiringSoon.map((sub) => {
    const daysLeft = Math.ceil(
      (new Date(sub.trialEndsAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const expired = daysLeft <= 0
    return {
      id: sub.id,
      primary: sub.contractor.companyName,
      badge: expired ? 'Expired' : `${daysLeft}d left`,
      badgeVariant: expired ? 'red' : 'orange',
    }
  })

  const ticketRows: AlertRow[] = openTickets.map((t) => ({
    id: t.id,
    primary: t.subject,
    secondary: [t.companyName, t.category].filter(Boolean).join(' · '),
    badge: t.status === 'in_progress' ? 'In Progress' : 'Open',
    badgeVariant: 'stone',
  }))

  return (
    <div className="space-y-8">
      {/* Alerts */}
      <div className="grid grid-cols-2 gap-4">
        <AlertPanel
          header={
            <div className="px-5 py-3 bg-stone-100 border-b border-stone-300 flex items-center gap-2">
              <AlertTriangle
                className={`h-3.5 w-3.5 ${trialsExpiringSoon.length > 0 ? 'text-orange-500' : 'text-stone-400'}`}
              />
              <p className="text-xs font-black uppercase tracking-widest text-stone-600">
                Trials Expiring (&lt;7 days)
              </p>
              {trialsExpiringSoon.length > 0 && (
                <span className="text-[10px] font-black text-orange-600 border border-orange-300 bg-orange-50 px-1.5 py-0.5">
                  {trialsExpiringSoon.length}
                </span>
              )}
            </div>
          }
          rows={trialRows}
          emptyMessage="None expiring soon"
        />
        <AlertPanel
          header={
            <div className="px-5 py-3 bg-stone-100 border-b border-stone-300 flex items-center gap-2">
              <Ticket
                className={`h-3.5 w-3.5 ${totalOpenTickets > 0 ? 'text-stone-600' : 'text-stone-400'}`}
              />
              <p className="text-xs font-black uppercase tracking-widest text-stone-600">
                Open Support Tickets
              </p>
              {totalOpenTickets > 0 && (
                <span className="text-[10px] font-black text-stone-700 border border-stone-300 bg-stone-200 px-1.5 py-0.5">
                  {totalOpenTickets}
                </span>
              )}
            </div>
          }
          rows={ticketRows}
          emptyMessage="No open tickets"
        />
      </div>

      {/* Revenue */}
      <div>
        <div className="group relative inline-flex items-center gap-2 mb-2 cursor-default select-none">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-stone-600 transition-colors">
            Revenue
          </p>
          <span className="text-[9px] font-black text-stone-300 border border-stone-200 bg-stone-50 px-1.5 py-0.5 group-hover:border-orange-300 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all">
            ?
          </span>
          <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
            <div className="bg-stone-950 border-l-[3px] border-orange-500 shadow-2xl w-72">
              <div className="px-4 pt-3 pb-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-2">How these are calculated</p>
              </div>
              <div className="px-4 pb-3 space-y-2">
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-wide">MRR</p>
                  <p className="text-[11px] text-stone-400 font-semibold leading-snug">Sum of active subscription prices — STARTER $49 · PRO $97</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-wide">ARR</p>
                  <p className="text-[11px] text-stone-400 font-semibold leading-snug">MRR × 12</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-wide">Trial Conversion</p>
                  <p className="text-[11px] text-stone-400 font-semibold leading-snug">% of completed trials that converted to a paid plan</p>
                </div>
              </div>
            </div>
            <div className="w-2.5 h-2.5 bg-stone-950 rotate-45 ml-4 -mt-1.5" />
          </div>
        </div>
        <div className="grid grid-cols-4 border border-stone-300 divide-x divide-stone-300 bg-white">
          <MetricCard label="MRR" value={`$${mrr.toLocaleString()}`} icon={CreditCard} />
          <MetricCard label="ARR" value={`$${arr.toLocaleString()}`} icon={CreditCard} />
          <MetricCard label="Active Subscriptions" value={activeSubscriptions.length} icon={CreditCard} sub={`${trialingCount} trialing`} />
          <MetricCard
            label="Trial Conversion"
            value={trialConversionRate !== null ? `${trialConversionRate}%` : '—'}
            icon={TrendingUp}
            sub={trialConversionDenominator > 0 ? `${activeWithTrialCount} of ${trialConversionDenominator} trials` : 'No ended trials yet'}
          />
        </div>
      </div>

      {/* Growth */}
      <div>
        <div className="group relative inline-flex items-center gap-2 mb-2 cursor-default select-none">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-stone-600 transition-colors">
            Growth
          </p>
          <span className="text-[9px] font-black text-stone-300 border border-stone-200 bg-stone-50 px-1.5 py-0.5 group-hover:border-orange-300 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all">
            ?
          </span>
          <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
            <div className="bg-stone-950 border-l-[3px] border-orange-500 shadow-2xl w-72">
              <div className="px-4 pt-3 pb-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-2">How these are calculated</p>
              </div>
              <div className="px-4 pb-3 space-y-2">
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-wide">Leads (30d) trend</p>
                  <p className="text-[11px] text-stone-400 font-semibold leading-snug">Compared to the previous 30-day window</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-wide">Dormant contractors</p>
                  <p className="text-[11px] text-stone-400 font-semibold leading-snug">Signed up &gt;30 days ago with zero leads in the last 30 days — churn risk</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-wide">Signups (MTD)</p>
                  <p className="text-[11px] text-stone-400 font-semibold leading-snug">Month-to-date vs same full calendar month last month</p>
                </div>
              </div>
            </div>
            <div className="w-2.5 h-2.5 bg-stone-950 rotate-45 ml-4 -mt-1.5" />
          </div>
        </div>
        <div className="grid grid-cols-4 border border-stone-300 divide-x divide-stone-300 bg-white">
          <MetricCard label="Total Contractors" value={totalContractors} icon={Users} sub={`${dormantCount} dormant (30d)`} />
          <MetricCard label="Leads (Last 30d)" value={leadsLast30} icon={BarChart2} trend={lead30dTrend} sub={`${leadsPrev30} prev 30d`} />
          <MetricCard label="New Signups (MTD)" value={signupsThisMonth} icon={Users} trend={signupTrend} sub={`${signupsLastMonth} last month`} />
          <MetricCard label="Onboarding Rate" value={`${onboardingRate}%`} icon={CheckCircle} sub={`${onboardingCompletedCount} of ${totalContractors} completed`} />
        </div>
      </div>

      {/* Lead Velocity Chart */}
      <div className="border border-stone-300 bg-white">
        <div className="px-5 py-3 bg-stone-100 border-b border-stone-300">
          <p className="text-xs font-black uppercase tracking-widest text-stone-600">Lead Velocity — Last 8 Weeks</p>
        </div>
        <div className="px-6 pt-4 pb-3">
          <div className="flex items-end gap-2 h-28">
            {chartData.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                {count > 0 && <span className="text-[9px] font-bold text-stone-500">{count}</span>}
                <div
                  className={`w-full ${i === chartData.length - 1 ? 'bg-orange-500' : 'bg-stone-300'}`}
                  style={{ height: `${Math.max((count / maxWeeklyLeads) * 80, count > 0 ? 4 : 2)}px` }}
                />
                <span className="text-[9px] text-stone-400 font-semibold">
                  {i === chartData.length - 1 ? 'now' : `–${8 - i}w`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
