import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const settingsSchema = z.object({
  notificationEmail: z.union([z.string().email(), z.literal('')]).optional(),
  webhookUrl: z.union([z.string().url(), z.literal('')]).optional(),
  bookingUrl: z.union([z.string().url(), z.literal('')]).optional(),
  outOfAreaBehavior: z.enum(['GATE', 'FLAG']).optional(),
  onboardingCompleted: z.boolean().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contractor = await prisma.contractor.findUnique({
    where: { id: session.user.contractorId },
    select: { notificationEmail: true, webhookUrl: true, bookingUrl: true, outOfAreaBehavior: true, onboardingCompleted: true },
  })

  return NextResponse.json(contractor ?? {
    notificationEmail: null,
    webhookUrl: null,
    bookingUrl: null,
    outOfAreaBehavior: 'FLAG',
    onboardingCompleted: false,
  })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = settingsSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const contractor = await prisma.contractor.update({
      where: { id: session.user.contractorId },
      data: {
        notificationEmail: parsed.data.notificationEmail ?? undefined,
        webhookUrl: parsed.data.webhookUrl ?? undefined,
        bookingUrl: parsed.data.bookingUrl ?? undefined,
        outOfAreaBehavior: parsed.data.outOfAreaBehavior ?? undefined,
        onboardingCompleted: parsed.data.onboardingCompleted ?? undefined,
      },
      select: { notificationEmail: true, webhookUrl: true, bookingUrl: true, outOfAreaBehavior: true, onboardingCompleted: true },
    })

    return NextResponse.json(contractor)
  } catch (error) {
    await logger.error('api.contractor.settings', error, { userId: session.user.id, meta: { contractorId: session.user.contractorId } })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
