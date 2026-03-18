import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateWeeklyReport } from '@/lib/generateWeeklyReport'
import { sendWeeklyReport } from '@/lib/resend'

export const maxDuration = 300 // 5 min — enough for batch processing

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this automatically; set CRON_SECRET in env for local testing)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekOf = getStartOfWeek()

  // Process all Pro contractors with active subscriptions and a notification email
  const contractors = await prisma.contractor.findMany({
    where: {
      subscription: { plan: 'PRO', status: { in: ['active', 'trialing'] } },
      notificationEmail: { not: null },
    },
    select: {
      id: true,
      companyName: true,
      notificationEmail: true,
    },
  })

  const results = await Promise.allSettled(
    contractors.map((c) => processContractor(c, weekOf))
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  console.log(`[Weekly Report] Processed ${contractors.length} contractors — ${succeeded} ok, ${failed} failed`)
  return NextResponse.json({ processed: contractors.length, succeeded, failed })
}

async function processContractor(
  contractor: { id: string; companyName: string; notificationEmail: string | null },
  weekOf: Date
) {
  const weekStart = weekOf
  const weekEnd = new Date(weekOf)
  weekEnd.setDate(weekEnd.getDate() + 7)

  // Fetch this week's leads + all-time aggregates in parallel
  const [weekLeads, totalCount, avgScoreAgg] = await Promise.all([
    prisma.lead.findMany({
      where: { contractorId: contractor.id, createdAt: { gte: weekStart, lt: weekEnd } },
      select: {
        urgency: true,
        projectType: true,
        materialType: true,
        leadScore: true,
        outOfArea: true,
        estimateLow: true,
        estimateHigh: true,
        address: true,
      },
    }),
    prisma.lead.count({ where: { contractorId: contractor.id } }),
    prisma.lead.aggregate({
      where: { contractorId: contractor.id },
      _avg: { leadScore: true },
    }),
  ])

  // Aggregate this week's stats
  const stats = {
    newLeads: weekLeads.length,
    hotLeads: weekLeads.filter((l) => l.leadScore >= 8).length,
    emergencyLeads: weekLeads.filter((l) => l.urgency === 'emergency').length,
    soonLeads: weekLeads.filter((l) => l.urgency === 'soon').length,
    browsingLeads: weekLeads.filter((l) => l.urgency === 'browsing').length,
    replacements: weekLeads.filter((l) => l.projectType === 'replacement').length,
    repairs: weekLeads.filter((l) => l.projectType === 'repair').length,
    outOfAreaLeads: weekLeads.filter((l) => l.outOfArea).length,
    avgEstimate: weekLeads.length
      ? Math.round(weekLeads.reduce((s, l) => s + (l.estimateLow + l.estimateHigh) / 2, 0) / weekLeads.length)
      : 0,
    totalEstimateValue: Math.round(
      weekLeads.reduce((s, l) => s + (l.estimateLow + l.estimateHigh) / 2, 0)
    ),
    topCities: topCities(weekLeads.map((l) => l.address)),
    materialBreakdown: materialBreakdown(weekLeads.map((l) => l.materialType)),
    totalLeads: totalCount,
    allTimeAvgScore: Math.round((avgScoreAgg._avg.leadScore ?? 0) * 10) / 10,
  }

  // Skip if no activity this week and no all-time leads
  if (stats.newLeads === 0 && totalCount === 0) return

  const report = await generateWeeklyReport(contractor.companyName, stats, weekOf)
  if (!report) return

  // Save to DB
  await prisma.weeklyReport.create({
    data: { contractorId: contractor.id, weekOf, report },
  })

  // Email it
  if (contractor.notificationEmail) {
    await sendWeeklyReport({
      toEmail: contractor.notificationEmail,
      companyName: contractor.companyName,
      weekOf,
      report,
      stats,
    })
  }
}

function getStartOfWeek(): Date {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sun
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1) // Monday
  const monday = new Date(now)
  monday.setUTCDate(diff)
  monday.setUTCHours(0, 0, 0, 0)
  return monday
}

function topCities(addresses: string[]): { city: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const addr of addresses) {
    // Extract city — typically "123 Main St, City, STATE ZIP"
    const parts = addr.split(',')
    const city = parts[1]?.trim()
    if (city) counts[city] = (counts[city] ?? 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ city, count }))
}

function materialBreakdown(materials: string[]): { material: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const m of materials) counts[m] = (counts[m] ?? 0) + 1
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([material, count]) => ({ material, count }))
}
