import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    await logger.error('api.stripe.webhook.signature', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const contractorId = session.metadata?.contractorId
        const plan = session.metadata?.plan as 'STARTER' | 'PRO'

        if (contractorId && plan && session.subscription) {
          // Fetch the subscription to get its actual status (may be trialing)
          const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string)
          await prisma.subscription.upsert({
            where: { contractorId },
            update: {
              stripeSubscriptionId: stripeSub.id,
              plan,
              status: stripeSub.status,
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
            create: {
              contractorId,
              stripeSubscriptionId: stripeSub.id,
              stripeCustomerId: session.customer as string,
              plan,
              status: stripeSub.status,
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const contractorId = sub.metadata?.contractorId

        if (contractorId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: {
              status: sub.status,
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'canceled' },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { status: 'past_due' },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    await logger.error('api.stripe.webhook', error, { meta: { eventType: event.type } })
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }
}
