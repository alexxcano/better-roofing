import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendTrialReminder } from '@/lib/resend'
import { z } from 'zod'

const schema = z.object({ type: z.enum(['3d', 'expiry']) })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: contractorId } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const { type } = parsed.data

  const sub = await prisma.subscription.findUnique({
    where: { contractorId },
    include: {
      contractor: {
        select: {
          companyName: true,
          notificationEmail: true,
          users: { select: { email: true }, take: 1 },
          _count: { select: { leads: true } },
        },
      },
    },
  })

  if (!sub || !sub.trialEndsAt) {
    return NextResponse.json({ error: 'Subscription or trial not found' }, { status: 404 })
  }

  const toEmail = sub.contractor.notificationEmail ?? sub.contractor.users[0]?.email
  if (!toEmail) {
    return NextResponse.json({ error: 'No email on file for this contractor' }, { status: 400 })
  }

  await sendTrialReminder({
    toEmail,
    companyName: sub.contractor.companyName,
    type,
    trialEndsAt: sub.trialEndsAt,
    leadCount: sub.contractor._count.leads,
  })

  const now = new Date()
  await prisma.subscription.update({
    where: { id: sub.id },
    data: type === '3d'
      ? { trialReminder3dSentAt: now }
      : { trialReminderExpirySentAt: now },
  })

  return NextResponse.json({ ok: true })
}
