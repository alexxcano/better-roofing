import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscription = await prisma.subscription.findUnique({
    where: { contractorId: session.user.contractorId },
  })

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
