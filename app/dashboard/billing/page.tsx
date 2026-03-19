import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BillingClient } from './billing-client'

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.contractorId) redirect('/login')

  const [subscription, locationCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { contractorId: session.user.contractorId } }),
    prisma.location.count({ where: { contractorId: session.user.contractorId } }),
  ])

  const daysLeftInTrial = subscription?.trialEndsAt && subscription.status === 'trialing' && !subscription.stripeSubscriptionId
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null

  return <BillingClient subscription={subscription} daysLeftInTrial={daysLeftInTrial} locationCount={locationCount} />
}
