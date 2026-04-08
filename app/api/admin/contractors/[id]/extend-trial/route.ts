import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: contractorId } = await params

  const sub = await prisma.subscription.findUnique({
    where: { contractorId },
    select: { id: true, trialEndsAt: true },
  })

  if (!sub) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  const base = sub.trialEndsAt && sub.trialEndsAt > new Date() ? sub.trialEndsAt : new Date()
  const newTrialEnd = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000)

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { trialEndsAt: newTrialEnd },
  })

  return NextResponse.json({ ok: true, newTrialEnd })
}
