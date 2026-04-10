import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe, PLANS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const checkoutSchema = z.object({
  plan: z.enum(['STARTER', 'PRO']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { plan } = parsed.data
  const priceId = PLANS[plan].priceId

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { contractorId: session.user.contractorId },
    })

    let customerId = subscription?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name || undefined,
        metadata: { contractorId: session.user.contractorId },
      })
      customerId = customer.id

      await prisma.subscription.upsert({
        where: { contractorId: session.user.contractorId },
        update: { stripeCustomerId: customerId },
        create: {
          contractorId: session.user.contractorId,
          stripeCustomerId: customerId,
          plan,
          status: 'inactive',
        },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { contractorId: session.user.contractorId },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      metadata: {
        contractorId: session.user.contractorId,
        plan,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    await logger.error('api.stripe.checkout', error, {
      userId: session.user.id,
      meta: { contractorId: session.user.contractorId, plan },
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
