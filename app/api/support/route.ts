import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const schema = z.object({
  category: z.enum(['bug', 'billing', 'feature', 'general']),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
  pageUrl: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { category, subject, message, pageUrl } = parsed.data

  // Fetch contractor + plan for metadata
  const contractor = session.user.contractorId
    ? await prisma.contractor.findUnique({
        where: { id: session.user.contractorId },
        select: {
          companyName: true,
          subscription: { select: { plan: true } },
        },
      })
    : null

  try {
    await prisma.supportTicket.create({
      data: {
        contractorId: session.user.contractorId ?? null,
        userEmail: session.user.email ?? '',
        companyName: contractor?.companyName ?? null,
        plan: contractor?.subscription?.plan ?? null,
        category,
        subject,
        message,
        status: 'open',
        userAgent: req.headers.get('user-agent') ?? null,
        pageUrl: pageUrl ?? null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    await logger.error('api.support.create', error, { userId: session.user.id, meta: { category, subject } })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
