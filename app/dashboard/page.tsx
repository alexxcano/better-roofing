import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { WeeklyReportCard } from '@/components/dashboard/WeeklyReportCard'
import { LeadScoreBadge } from '@/components/dashboard/LeadScoreBadge'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.contractorId) redirect('/login')

  const contractorId = session.user.contractorId
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [totalLeads, leadsThisMonth, hotLeads, estimateAgg, recentLeads, latestReport, subscription] = await Promise.all([
    prisma.lead.count({ where: { contractorId } }),
    prisma.lead.count({ where: { contractorId, createdAt: { gte: startOfMonth } } }),
    prisma.lead.count({ where: { contractorId, leadScore: { gte: 8 } } }),
    prisma.lead.aggregate({
      where: { contractorId },
      _avg: { estimateLow: true, estimateHigh: true },
    }),
    prisma.lead.findMany({
      where: { contractorId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        address: true,
        estimateLow: true,
        estimateHigh: true,
        createdAt: true,
        isHomeowner: true,
        projectType: true,
        urgency: true,
        outOfArea: true,
      },
    }),
    prisma.weeklyReport.findFirst({
      where: { contractorId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscription.findUnique({
      where: { contractorId },
      select: { status: true, trialEndsAt: true, stripeSubscriptionId: true },
    }),
  ])

  const avgEstimate = estimateAgg._avg.estimateLow && estimateAgg._avg.estimateHigh
    ? (estimateAgg._avg.estimateLow + estimateAgg._avg.estimateHigh) / 2
    : 0

  const daysLeftInTrial = subscription?.trialEndsAt && subscription.status === 'trialing' && !subscription.stripeSubscriptionId
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div className="space-y-8">
      {/* Trial banner */}
      {daysLeftInTrial !== null && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 px-5 py-4 ${
          daysLeftInTrial <= 3 ? 'border-red-400 bg-red-50' : 'border-orange-400 bg-orange-50'
        }`}>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest mb-0.5 ${daysLeftInTrial <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
              {daysLeftInTrial === 0 ? '⚠️ Trial Expires Today' : `${daysLeftInTrial} Day${daysLeftInTrial === 1 ? '' : 's'} Left in Trial`}
            </p>
            <p className="text-sm text-stone-600 font-semibold">
              {daysLeftInTrial === 0
                ? 'Your trial expires today. Subscribe to keep access.'
                : 'You have full Pro access during your trial. Subscribe before it ends to keep all features.'}
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="btn btn-primary px-5 py-2 flex-shrink-0 whitespace-nowrap"
          >
            Subscribe →
          </Link>
        </div>
      )}

      {/* Page header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none">Overview</h1>
        <p className="text-stone-500 text-sm font-semibold mt-1 uppercase tracking-wide">Your lead pipeline at a glance</p>
      </div>

      <StatsCards
        totalLeads={totalLeads}
        leadsThisMonth={leadsThisMonth}
        averageEstimate={avgEstimate}
        hotLeads={hotLeads}
      />

      {/* Weekly intelligence report */}
      {latestReport ? (
        <WeeklyReportCard report={latestReport.report} weekOf={latestReport.weekOf} />
      ) : (
        <div className="border-2 border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1">Weekly Intelligence Report</p>
          <p className="text-sm text-stone-500 font-semibold">
            Your first AI-generated lead report will arrive next Monday morning.
          </p>
        </div>
      )}

      {/* Recent Leads */}
      <div className="border-2 border-stone-300 bg-white">
        <div className="flex items-center justify-between px-5 py-3 bg-stone-100 border-b-2 border-stone-300">
          <p className="text-xs font-black uppercase tracking-widest text-stone-600">Recent Leads</p>
          <Link href="/dashboard/leads" className="btn btn-ghost px-3 py-2 text-xs">
            View all →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-stone-400 font-semibold uppercase tracking-wide text-sm">
              No leads yet — install the widget to start capturing leads
            </p>
          </div>
        ) : (
          <div>
            {recentLeads.map((lead, i) => (
              <div
                key={lead.id}
                className={`flex items-center justify-between px-5 py-3 border-t border-stone-200 ${i % 2 === 1 ? 'bg-stone-50/50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <LeadScoreBadge
                    isHomeowner={lead.isHomeowner}
                    projectType={lead.projectType}
                    urgency={lead.urgency}
                    outOfArea={lead.outOfArea}
                    showScore
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-stone-900 text-sm">{lead.name}</p>
                      {lead.outOfArea && (
                        <span title="Out of area — this address is outside your configured service radius" className="text-[9px] font-black uppercase tracking-widest text-orange-600 border border-orange-300 bg-orange-50 px-1 py-0.5 leading-none cursor-help">OOA</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5 truncate max-w-xs">{lead.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">
                    ${lead.estimateLow.toLocaleString()} – ${lead.estimateHigh.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5 font-semibold">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

