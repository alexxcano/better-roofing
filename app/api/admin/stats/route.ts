import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
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
        take: 10,
      }),
    ])

    return NextResponse.json({
      totalContractors,
      totalLeads,
      activeSubscriptions,
      recentContractors: contractors,
    })
  } catch (error) {
    await logger.error('admin.stats', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
